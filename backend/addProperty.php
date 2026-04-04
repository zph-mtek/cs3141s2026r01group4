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

// Support both deployment layouts for private DB bootstrap.
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


if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $name = $_POST['name'] ?? '';
    $address = $_POST['address'] ?? '';
    $city = $_POST['city'] ?? '';
    $distance = $_POST['distance'] ?? '';
    $description = $_POST['description'] ?? '';
    $walkDistance = $_POST['walkDistance'] ?? '';

    //test
    $landlordId = 1;

    $amenities = isset($_POST['amenities']) ? json_decode($_POST['amenities'], true) : [];
    $roomsInfo = isset($_POST['roomsInfo']) ? json_decode($_POST['roomsInfo'], true) : [];

    $propertyImages = $_FILES['propertyImages'] ?? null;

    //set to database
    $sqlProperty = "INSERT INTO huskyrentlens_property (name, city, description, distanceFromMTU, address, walkDistance, landlordId) VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sqlProperty);

    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "SQL error: " . $conn->error]);
        exit();
    }

    $stmt->bind_param("ssssssi", $name, $city, $description, $distance, $address, $walkDistance, $landlordId);

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

        if (isset($_FILES['propertyImages']) && is_array($_FILES['propertyImages']['name'])){
            $uploadDir = __DIR__ . '/uploads/';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true); 
            }

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
        if (!empty($roomsInfo)) {

            $sqlRoom = "INSERT INTO huskyrentlens_rental (propertyId, roomName, bedroomCt, bathroomCt, cost) VALUES (?, ?, ?, ?, ?)";
            $stmtRoom = $conn->prepare($sqlRoom);

            if($stmtRoom){
                foreach ($roomsInfo as $room){
                    $roomName = $room['name'] ?? '';
                    $bedroomCt = intval($room['bedrooms'] ?? 1);
                    $bathroomCt = intval($room['bathrooms'] ?? 1);
                    $cost = intval($room['rent'] ?? 0);

                    $stmtRoom->bind_param("isiii", $newPropertyId, $roomName, $bedroomCt, $bathroomCt, $cost);

                    if ($stmtRoom->execute()) {
                        $newRentalId = $conn->insert_id;
                        $savedRoomCount++;
                    }
                    $stmtRoom->close();
                }
            }
        }

        echo json_encode([
            "status" => "success", 
            "message" => "Property, " . count($amenityList) . " amenities, " . $savedImageCount . " shared images, and " . $savedRoomCount . " rooms saved!",
            "propertyId" => $newPropertyId
        ]);
        exit();

    } else {
        echo json_encode(["status" => "error", "message" => "failed to add property: " . $stmt->error]);
        exit();
    }
}

?>
