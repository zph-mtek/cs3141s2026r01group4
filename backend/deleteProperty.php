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
    $body = json_decode(file_get_contents('php://input'), true);
    $propertyId = $body['propertyId'] ?? null;

    if (!$propertyId) {
        echo json_encode(["status" => "error", "message" => "Property ID is missing"]);
        exit();
    }

    // Verify ownership
    $stmtCheck = $conn->prepare("SELECT landlordId FROM huskyrentlens_property WHERE propertyId = ?");
    $stmtCheck->bind_param("i", $propertyId);
    $stmtCheck->execute();
    $propData = $stmtCheck->get_result()->fetch_assoc();
    $stmtCheck->close();

    if (!$propData || $propData['landlordId'] !== $landlordId) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "You don't own this property"]);
        exit();
    }

    // Delete room images
    $stmtRoomIds = $conn->prepare("SELECT rentalId FROM huskyrentlens_rental WHERE propertyId = ?");
    $stmtRoomIds->bind_param("i", $propertyId);
    $stmtRoomIds->execute();
    $rooms = $stmtRoomIds->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmtRoomIds->close();

    foreach ($rooms as $room) {
        $stmtDelRoomImg = $conn->prepare("DELETE FROM huskyrentlens_rental_image WHERE rentalId = ?");
        $stmtDelRoomImg->bind_param("i", $room['rentalId']);
        $stmtDelRoomImg->execute();
        $stmtDelRoomImg->close();
    }

    // Delete rooms
    $stmtDelRooms = $conn->prepare("DELETE FROM huskyrentlens_rental WHERE propertyId = ?");
    $stmtDelRooms->bind_param("i", $propertyId);
    $stmtDelRooms->execute();
    $stmtDelRooms->close();

    // Delete amenities
    $stmtDelAm = $conn->prepare("DELETE FROM huskyrentlens_property_amenities WHERE propertyId = ?");
    $stmtDelAm->bind_param("i", $propertyId);
    $stmtDelAm->execute();
    $stmtDelAm->close();

    // Delete property images
    $stmtDelImg = $conn->prepare("DELETE FROM huskyrentlens_property_image WHERE propertyId = ?");
    $stmtDelImg->bind_param("i", $propertyId);
    $stmtDelImg->execute();
    $stmtDelImg->close();

    // Delete the property
    $stmtDel = $conn->prepare("DELETE FROM huskyrentlens_property WHERE propertyId = ? AND landlordId = ?");
    $stmtDel->bind_param("ii", $propertyId, $landlordId);
    $stmtDel->execute();
    $stmtDel->close();

    echo json_encode(["status" => "success", "message" => "Property deleted successfully"]);
    exit();
}
?>
