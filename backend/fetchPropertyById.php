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

$propertyId = $_GET['id'] ?? null;
if (!$propertyId) {
    echo json_encode(["status" => "error", "message" => "No property ID provided"]);
    exit();
}

$stmt = $conn->prepare("SELECT * FROM huskyrentlens_property WHERE propertyId = ?");
$stmt->bind_param("i", $propertyId);
$stmt->execute();
$propertyData = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$propertyData) {
    echo json_encode(["status" => "error", "message" => "Property not found"]);
    exit();
}

$stmtImg = $conn->prepare("SELECT imageId, propertyId, imageUrl FROM huskyrentlens_property_image WHERE propertyId = ?");
$stmtImg->bind_param("i", $propertyId);
$stmtImg->execute();
$propertyImages = $stmtImg->get_result()->fetch_all(MYSQLI_ASSOC);
$stmtImg->close();

$stmtAmenity = $conn->prepare("SELECT amenityName FROM huskyrentlens_property_amenities WHERE propertyId = ?");
$stmtAmenity->bind_param("i", $propertyId);
$stmtAmenity->execute();
$resAmenity = $stmtAmenity->get_result()->fetch_all(MYSQLI_ASSOC);
$amenitiesList = array_column($resAmenity, 'amenityName');
$stmtAmenity->close();

$stmtRoom = $conn->prepare("SELECT * FROM huskyrentlens_rental WHERE propertyId = ?");
$stmtRoom->bind_param("i", $propertyId);
$stmtRoom->execute();
$rentals = $stmtRoom->get_result()->fetch_all(MYSQLI_ASSOC);
$stmtRoom->close();

foreach ($rentals as &$room) {
    $rentalId = $room['rentalId'];
    $stmtRoomImg = $conn->prepare("SELECT rentalId, image_url AS imageUrl FROM huskyrentlens_rental_image WHERE rentalId = ?");
    $stmtRoomImg->bind_param("i", $rentalId);
    $stmtRoomImg->execute();
    $room['images'] = $stmtRoomImg->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtRoomImg->close();
}

echo json_encode([
    "status" => "success",
    "data" => [
        "property" => $propertyData, 
        "images" => $propertyImages,  
        "amenities" => $amenitiesList, 
        "rentals" => $rentals         
    ]
]);

if (isset($conn)) {
    $conn->close();
}
?>