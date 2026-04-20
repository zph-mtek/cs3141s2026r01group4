<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$bootstrapCandidates = [
    __DIR__ . '/../../server_backend/collectSet.php',
    __DIR__ . '/../server_backend/collectSet.php',
    __DIR__ . '/collectSet.php'
];

$bootstrapLoaded = false;
foreach ($bootstrapCandidates as $candidate) {
    if (is_readable($candidate)) {
        include_once $candidate;
        $bootstrapLoaded = true;
        break;
    }
}

if (!$bootstrapLoaded || !isset($conn)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database bootstrap not found"]);
    exit();
}

$autoloadCandidates = [
    __DIR__ . '/../../server_backend/vendor/autoload.php',
    __DIR__ . '/../server_backend/vendor/autoload.php'
];

$autoloadLoaded = false;
foreach ($autoloadCandidates as $candidate) {
    if (is_readable($candidate)) {
        require_once $candidate;
        $autoloadLoaded = true;
        break;
    }
}

if (!$autoloadLoaded) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "JWT autoload not found"]);
    exit();
}

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = apache_request_headers();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
}

if (!$authHeader) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "no token"]);
    exit();
}

$token = str_replace('Bearer ', '', $authHeader);

try {
    $envPath = __DIR__ . '/../../keys/.env';
    $envData = parse_ini_file($envPath);
    $secret_key = $envData['JWT_SECRET'];
    
    $decoded = JWT::decode($token, new Key($secret_key, 'HS256'));

    $landlordId = $decoded->data->id;
    $role = $decoded->data->role;

    if ($role !== 'Landlord') {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "not authorized"]);
        exit();
    }

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "token invalid: " . $e->getMessage()]);
    exit();
}

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    // DEBUG: log $_FILES keys
    $debugLog = "=== addProperty " . date('Y-m-d H:i:s') . " ===\n";
    $debugLog .= "FILES keys: " . implode(', ', array_keys($_FILES)) . "\n";
    foreach ($_FILES as $fkey => $fval) {
        $debugLog .= "  $fkey: names=" . json_encode($fval['name']) . " errors=" . json_encode($fval['error']) . "\n";
    }
    $roomsInfoRaw = isset($_POST['roomsInfo']) ? json_decode($_POST['roomsInfo'], true) : [];
    $debugLog .= "roomsInfo IDs: " . json_encode(array_column($roomsInfoRaw, 'id')) . "\n";
    $debugLog .= "Expected keys: " . json_encode(array_map(function($r){ return 'roomImages_' . $r['id']; }, $roomsInfoRaw)) . "\n";
    file_put_contents(__DIR__ . '/debug_upload.log', $debugLog, FILE_APPEND);
    // END DEBUG

    $name = $_POST['name'] ?? '';
    $address = $_POST['address'] ?? '';
    $city = $_POST['city'] ?? '';
    $distance = $_POST['distance'] ?? '';
    $description = $_POST['description'] ?? '';
    $walkDistance = $_POST['walkDistance'] ?? '';
    $lat = isset($_POST['lat']) && $_POST['lat'] !== '' ? floatval($_POST['lat']) : null;
    $lng = isset($_POST['lng']) && $_POST['lng'] !== '' ? floatval($_POST['lng']) : null;

    $amenities = isset($_POST['amenities']) ? json_decode($_POST['amenities'], true) : [];
    $roomsInfo = isset($_POST['roomsInfo']) ? json_decode($_POST['roomsInfo'], true) : [];

    $propertyImages = $_FILES['propertyImages'] ?? null;

    //set to database
    $sqlProperty = "INSERT INTO huskyrentlens_property (name, city, description, distanceFromMTU, address, walkDistance, landlordId, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sqlProperty);

    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "SQL error: " . $conn->error]);
        exit();
    }

    $stmt->bind_param("ssssssidd", $name, $city, $description, $distance, $address, $walkDistance, $landlordId, $lat, $lng);

    if ($stmt->execute()) {
        $newPropertyId = $conn->insert_id;
        $stmt->close(); 

        $amenityList = isset($_POST['amenities']) ? json_decode($_POST['amenities'], true) : [];

        if (!empty($amenityList)) {
            $sqlAmenity = "INSERT INTO huskyrentlens_property_amenities (amenityName, propertyId) VALUES (?, ?)";
            $stmtA = $conn->prepare($sqlAmenity);

            if ($stmtA) {
                foreach ($amenityList as $amenity) {
                    $stmtA->bind_param("si", $amenity, $newPropertyId);
                    $stmtA->execute();
                }
                $stmtA->close();
            }
        }

        //save images
        $savedImageCount = 0;
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); 
        }

        if (isset($_FILES['propertyImages']) && is_array($_FILES['propertyImages']['name'])){

            $sqlImage = "INSERT INTO huskyrentlens_property_image (propertyId, imageUrl) VALUES (?, ?)";
            $stmtImg = $conn->prepare($sqlImage);

            if($stmtImg){
                $imageCount = count($_FILES['propertyImages']['name']);
                for ($i = 0; $i < $imageCount; $i++) {
                    if ($_FILES['propertyImages']['error'][$i] === 0) {   
                        $tmpFilePath = $_FILES['propertyImages']['tmp_name'][$i];
                        $originalName = $_FILES['propertyImages']['name'][$i];

                        $newFileName = uniqid() . '_' . basename($originalName);
                        $destFilePath = $uploadDir . $newFileName;

                        if (move_uploaded_file($tmpFilePath, $destFilePath)) {
                            $imageUrlForDB = 'uploads/' . $newFileName; 
                            
                            $stmtImg->bind_param("is", $newPropertyId, $imageUrlForDB);
                            $stmtImg->execute();
                            $savedImageCount++;
                        }
                    }
                }
                 $stmtImg->close();
            }
        }

        //save each file
        $savedRoomCount = 0;
        $savedRoomImageCount = 0;

        if (!empty($roomsInfo)) {

            $sqlRoom = "INSERT INTO huskyrentlens_rental (propertyId, roomName, bedroomCt, bathroomCt, cost, description) VALUES (?, ?, ?, ?, ?, ?)";
            $stmtRoom = $conn->prepare($sqlRoom);

            $sqlRoomImage = "INSERT INTO huskyrentlens_rental_image (rentalId, image_url) VALUES (?, ?)";
            $stmtRoomImage = $conn->prepare($sqlRoomImage);

            if($stmtRoom && $stmtRoomImage){
                foreach ($roomsInfo as $room){
                    $roomName = $room['name'] ?? '';
                    $bedroomCt = intval($room['bedrooms'] ?? 1);
                    $bathroomCt = intval($room['bathrooms'] ?? 1);
                    $cost = intval($room['rent'] ?? 0);
                    $roomDesc = $room['description'] ?? ''; 
                    $stmtRoom->bind_param("isiiis", $newPropertyId, $roomName, $bedroomCt, $bathroomCt, $cost, $roomDesc);

                    if ($stmtRoom->execute()) {
                        $newRentalId = $conn->insert_id;
                        $savedRoomCount++;

                        $roomTempId = $room['id'];
                        $fileKey = "roomImages_" . $roomTempId;

                        if (isset($_FILES[$fileKey]) && is_array($_FILES[$fileKey]['name'])) {
                            $roomImgCount = count($_FILES[$fileKey]['name']);

                            for ($j = 0; $j < $roomImgCount; $j++) {
                                if ($_FILES[$fileKey]['error'][$j] === 0) {
                                    $tmpPath = $_FILES[$fileKey]['tmp_name'][$j];
                                    $origName = $_FILES[$fileKey]['name'][$j];
                                
                                    $newName = uniqid() . '_room_' . basename($origName);
                                    $destPath = $uploadDir . $newName;

                                    if (move_uploaded_file($tmpPath, $destPath)) {
                                        $imageUrlForDB = 'uploads/' . $newName;
                                        
                                        $stmtRoomImage->bind_param("is", $newRentalId, $imageUrlForDB);
                                        $stmtRoomImage->execute();
                                        $savedRoomImageCount++;
                                    }
                                }
                            }
                        }
                    }
                }
                
                $stmtRoom->close();
                $stmtRoomImage->close();
            }
        }

        echo json_encode([
            "status" => "success", 
            "message" => "Property, " . count($amenityList) . " amenities, " . $savedImageCount . " shared images, " . $savedRoomCount . " rooms, and " . $savedRoomImageCount . " room images saved!",
            "propertyId" => $newPropertyId,
            "debug" => [
                "filesKeys" => array_keys($_FILES),
                "expectedRoomKeys" => array_map(function($r){ return 'roomImages_' . $r['id']; }, $roomsInfo),
                "savedRoomImageCount" => $savedRoomImageCount
            ]
        ]);
        exit();

    } else {
        echo json_encode(["status" => "error", "message" => "failed to add property: " . $stmt->error]);
        exit();
    }
}
?>