<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
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
    __DIR__ . '/../server_backend/collectSet.php'
];

$bootstrapLoaded = false;
foreach ($bootstrapCandidates as $candidate) {
    if (is_readable($candidate)) {
        require_once $candidate;
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

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$headers = apache_request_headers();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

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