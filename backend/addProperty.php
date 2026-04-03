<?php
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
    
        echo json_encode(["status" => "success", "message" => "added property ID is: " . $newPropertyId]);
        exit();
    } else {
        echo json_encode(["status" => "error", "message" => "failed to add property: " . $stmt->error]);
        exit();
    }
}




echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);

if (isset($conn)) {
    $conn->close();
}
?>
