<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$bootstrapCandidates = [ __DIR__ . '/../../server_backend/collectSet.php', __DIR__ . '/../server_backend/collectSet.php' ];
$bootstrapLoaded = false;
foreach ($bootstrapCandidates as $candidate) {
    if (is_readable($candidate)) { require_once $candidate; $bootstrapLoaded = true; break; }
}

$autoloadCandidates = [ __DIR__ . '/../../server_backend/vendor/autoload.php', __DIR__ . '/../server_backend/vendor/autoload.php' ];
$autoloadLoaded = false;
foreach ($autoloadCandidates as $candidate) {
    if (is_readable($candidate)) { require_once $candidate; $autoloadLoaded = true; break; }
}

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = apache_request_headers();
$authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

try {
    $secretKey = getenv('JWT_SECRET');
    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    if ($decoded->data->role !== 'admin') throw new Exception("Not admin");
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$propertyId = $data['propertyId'] ?? null;

if (!$propertyId) {
    echo json_encode(["status" => "error", "message" => "Missing propertyId"]); exit();
}

$stmt1 = $conn->prepare("DELETE FROM huskyrentlens_comments WHERE propertyId = ?");
$stmt1->bind_param("i", $propertyId);
$stmt1->execute();

$stmt2 = $conn->prepare("DELETE FROM huskyrentlens_property_image WHERE propertyId = ?");
$stmt2->bind_param("i", $propertyId);
$stmt2->execute();

$stmt3 = $conn->prepare("DELETE FROM huskyrentlens_property WHERE propertyId = ?");
$stmt3->bind_param("i", $propertyId);

if ($stmt3->execute()) {
    echo json_encode(["status" => "success", "message" => "Property, images, and comments deleted successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to delete property"]);
}
?>