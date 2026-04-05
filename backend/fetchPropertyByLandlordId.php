<?php
// Public endpoint: returns all properties used by the frontend map/listing pages.

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


$landlordId = isset($_GET['landlordId']) ? intval($_GET['landlordId']) : 0;

if ($landlordId <= 0) {
    echo json_encode(["status" => "error", "message" => "Missing or invalid landlordId"]);
    exit();
}

$sql = "SELECT * FROM huskyrentlens_property WHERE landlordId = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $landlordId);
$stmt->execute();
$result = $stmt->get_result();
$properties = $result->fetch_all(MYSQLI_ASSOC);
$stmt->close();

foreach ($properties as &$property) {
    $currentId = $property['propertyId'];

    $stmtImg = $conn->prepare("SELECT * FROM huskyrentlens_property_image WHERE propertyId = ?");
    $stmtImg->bind_param("i", $currentId);
    $stmtImg->execute();
    $property['images'] = $stmtImg->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtImg->close();

    $stmtAmenity = $conn->prepare("SELECT amenityName FROM huskyrentlens_property_amenities WHERE propertyId = ?");
    $stmtAmenity->bind_param("i", $currentId);
    $stmtAmenity->execute();
    $resAmenity = $stmtAmenity->get_result()->fetch_all(MYSQLI_ASSOC);
    $property['amenities'] = array_column($resAmenity, 'amenityName');
    $stmtAmenity->close();

    $stmtRoom = $conn->prepare("SELECT * FROM huskyrentlens_rental WHERE propertyId = ?");
    $stmtRoom->bind_param("i", $currentId);
    $stmtRoom->execute();
    $rooms = $stmtRoom->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtRoom->close();

    foreach ($rooms as &$room) {
        $rentalId = $room['rentalId'];
        $stmtRoomImg = $conn->prepare("SELECT * FROM huskyrentlens_rental_image WHERE rentalId = ?");
        $stmtRoomImg->bind_param("i", $rentalId);
        $stmtRoomImg->execute();
        $room['images'] = $stmtRoomImg->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmtRoomImg->close();
    }
    
    $property['rooms'] = $rooms;
}

echo json_encode([
    "status" => "success",
    "data" => $properties
]);

if (isset($conn)) {
    $conn->close();
}
?>