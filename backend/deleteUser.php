<?php
// backend/deleteUser.php
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

require_once __DIR__ . '/collectSet.php';
require_once __DIR__ . '/../server_backend/vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = apache_request_headers();
$authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

try {
    $envData = parse_ini_file(__DIR__ . '/../../keys/.env');
    $decoded = JWT::decode($token, new Key($envData['JWT_SECRET'], 'HS256'));
    if ($decoded->data->role !== 'admin') throw new Exception("Not admin");
} catch (Exception $e) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$userId = $data['userId'] ?? null;
$currentRole = $data['currentRole'] ?? '';

if (!$userId) {
    echo json_encode(["status" => "error", "message" => "Missing userId"]);
    exit();
}

$tableName = (strtolower($currentRole) === 'landlord') ? 'huskyrentlens_landlords' : 'huskyrentlens_users';

$stmt = $conn->prepare("DELETE FROM {$tableName} WHERE userId = ?");
$stmt->bind_param("i", $userId);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "User banned/deleted successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to delete user"]);
}
?>