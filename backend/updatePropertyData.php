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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // DEBUG: log $_FILES keys
    $debugLog = "=== updateProperty " . date('Y-m-d H:i:s') . " ===\n";
    $debugLog .= "FILES keys: " . implode(', ', array_keys($_FILES)) . "\n";
    foreach ($_FILES as $fkey => $fval) {
        $debugLog .= "  $fkey: names=" . json_encode($fval['name']) . " errors=" . json_encode($fval['error']) . "\n";
    }
    $roomsInfoRaw = isset($_POST['roomsInfo']) ? json_decode($_POST['roomsInfo'], true) : [];
    $debugLog .= "roomsInfo IDs: " . json_encode(array_column($roomsInfoRaw, 'id')) . "\n";
    $debugLog .= "Expected keys: " . json_encode(array_map(function($r){ return 'roomImages_' . $r['id']; }, $roomsInfoRaw)) . "\n";
    file_put_contents(__DIR__ . '/debug_upload.log', $debugLog, FILE_APPEND);
    // END DEBUG

    $propertyId = $_POST['propertyId'] ?? null;

    if (!$propertyId) {
        echo json_encode(["status" => "error", "message" => "Property ID is missing"]);
        exit();
    }

    $stmtCheck = $conn->prepare("SELECT landlordId FROM huskyrentlens_property WHERE propertyId = ?");
    $stmtCheck->bind_param("i", $propertyId);
    $stmtCheck->execute();
    $propData = $stmtCheck->get_result()->fetch_assoc();
    $stmtCheck->close();

    if (!$propData || (int)$propData['landlordId'] !== (int)$landlordId) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "You don't own this property"]);
        exit();
    }

    $name = $_POST['name'] ?? '';
    $address = $_POST['address'] ?? '';
    $city = $_POST['city'] ?? '';
    $distance = $_POST['distance'] ?? '';
    $description = $_POST['description'] ?? '';
    $walkDistance = $_POST['walkDistance'] ?? '';
    $lat = isset($_POST['lat']) && $_POST['lat'] !== '' ? floatval($_POST['lat']) : null;
    $lng = isset($_POST['lng']) && $_POST['lng'] !== '' ? floatval($_POST['lng']) : null;

    $stmtUpdate = $conn->prepare("UPDATE huskyrentlens_property SET name=?, city=?, description=?, distanceFromMTU=?, address=?, walkDistance=?, lat=?, lng=? WHERE propertyId=?");
    $stmtUpdate->bind_param("ssssssddi", $name, $city, $description, $distance, $address, $walkDistance, $lat, $lng, $propertyId);
    $stmtUpdate->execute();
    $stmtUpdate->close();

    $stmtDelAm = $conn->prepare("DELETE FROM huskyrentlens_property_amenities WHERE propertyId=?");
    $stmtDelAm->bind_param("i", $propertyId);
    $stmtDelAm->execute();
    $stmtDelAm->close();

    $amenities = isset($_POST['amenities']) ? json_decode($_POST['amenities'], true) : [];
    if (!empty($amenities)) {
        $stmtInsAm = $conn->prepare("INSERT INTO huskyrentlens_property_amenities (amenityName, propertyId) VALUES (?, ?)");
        foreach ($amenities as $am) {
            $stmtInsAm->bind_param("si", $am, $propertyId);
            $stmtInsAm->execute();
        }
        $stmtInsAm->close();
    }

    if (isset($_FILES['propertyImages']) && is_array($_FILES['propertyImages']['name'])) {
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $stmtImg = $conn->prepare("INSERT INTO huskyrentlens_property_image (propertyId, imageUrl) VALUES (?, ?)");
        $imageCount = count($_FILES['propertyImages']['name']);
        
        for ($i = 0; $i < $imageCount; $i++) {
            if ($_FILES['propertyImages']['error'][$i] === 0) {
                $tmpFilePath = $_FILES['propertyImages']['tmp_name'][$i];
                $newFileName = uniqid() . '_' . basename($_FILES['propertyImages']['name'][$i]);
                if (move_uploaded_file($tmpFilePath, $uploadDir . $newFileName)) {
                    $imageUrlForDB = 'uploads/' . $newFileName;
                    $stmtImg->bind_param("is", $propertyId, $imageUrlForDB);
                    $stmtImg->execute();
                }
            }
        }
        $stmtImg->close();
    }

    $roomsInfo = isset($_POST['roomsInfo']) ? json_decode($_POST['roomsInfo'], true) : [];

    $stmtGetRooms = $conn->prepare("SELECT rentalId FROM huskyrentlens_rental WHERE propertyId=?");
    $stmtGetRooms->bind_param("i", $propertyId);
    $stmtGetRooms->execute();
    $existingRoomsRes = $stmtGetRooms->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtGetRooms->close();
    $existingRoomIds = array_column($existingRoomsRes, 'rentalId');

    $incomingRoomIds = []; 
    
    $stmtUpdateRoom = $conn->prepare("UPDATE huskyrentlens_rental SET roomName=?, bedroomCt=?, bathroomCt=?, cost=?, description=? WHERE rentalId=? AND propertyId=?");
    $stmtInsertRoom = $conn->prepare("INSERT INTO huskyrentlens_rental (propertyId, roomName, bedroomCt, bathroomCt, cost, description) VALUES (?, ?, ?, ?, ?, ?)");

    foreach ($roomsInfo as $room) {
        $roomId = $room['id']; 
        $roomName = $room['name'] ?? '';
        $bed = intval($room['bedrooms'] ?? 1);
        $bath = intval($room['bathrooms'] ?? 1);
        $cost = intval($room['rent'] ?? 0);
        $desc = $room['description'] ?? '';

        if (in_array($roomId, $existingRoomIds)) {
            $incomingRoomIds[] = $roomId; 
            $stmtUpdateRoom->bind_param("siiisii", $roomName, $bed, $bath, $cost, $desc, $roomId, $propertyId);
            $stmtUpdateRoom->execute();
            $targetRentalId = $roomId;
        } else {
            $stmtInsertRoom->bind_param("isiiis", $propertyId, $roomName, $bed, $bath, $cost, $desc);
            $stmtInsertRoom->execute();
            $targetRentalId = $conn->insert_id; 
        }

        $fileKey = "roomImages_" . $roomId;
        if (isset($_FILES[$fileKey]) && is_array($_FILES[$fileKey]['name'])) {
            $uploadDir = __DIR__ . '/uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            $stmtRoomImg = $conn->prepare("INSERT INTO huskyrentlens_rental_image (rentalId, image_url) VALUES (?, ?)");

            $roomImgCount = count($_FILES[$fileKey]['name']);
            for ($j = 0; $j < $roomImgCount; $j++) {
                if ($_FILES[$fileKey]['error'][$j] === 0) {
                    $tmpPath = $_FILES[$fileKey]['tmp_name'][$j];
                    $newName = uniqid() . '_room_' . basename($_FILES[$fileKey]['name'][$j]);
                    if (move_uploaded_file($tmpPath, $uploadDir . $newName)) {
                        $imageUrlForDB = 'uploads/' . $newName;
                        $stmtRoomImg->bind_param("is", $targetRentalId, $imageUrlForDB);
                        $stmtRoomImg->execute();
                    }
                }
            }
            $stmtRoomImg->close();
        }
    }
    $stmtUpdateRoom->close();
    $stmtInsertRoom->close();

    $roomsToDelete = array_diff($existingRoomIds, $incomingRoomIds);
    foreach ($roomsToDelete as $delId) {
        $stmtDelImg = $conn->prepare("DELETE FROM huskyrentlens_rental_image WHERE rentalId = ?");
        $stmtDelImg->bind_param("i", $delId);
        $stmtDelImg->execute();
        $stmtDelImg->close();

        $stmtDelRoom = $conn->prepare("DELETE FROM huskyrentlens_rental WHERE rentalId = ? AND propertyId = ?");
        $stmtDelRoom->bind_param("ii", $delId, $propertyId);
        $stmtDelRoom->execute();
        $stmtDelRoom->close();
    }

    echo json_encode(["status" => "success", "message" => "Property updated successfully!"]);
    exit();
}
?>