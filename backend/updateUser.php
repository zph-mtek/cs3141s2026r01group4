<?php
// backend/updateUser.php
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
$newRole = $data['newRole'] ?? null;
$isVerified = $data['isVerified'] ?? null;

if (!$userId) {
    echo json_encode(["status" => "error", "message" => "Missing userId"]);
    exit();
}

$tableName = (strtolower($currentRole) === 'landlord') ? 'huskyrentlens_landlords' : 'huskyrentlens_users';

if ($newRole !== null) {
    $stmt = $conn->prepare("UPDATE {$tableName} SET role = ? WHERE userId = ?");
    $stmt->bind_param("si", $newRole, $userId);
} else if ($isVerified !== null) {
    $verifiedInt = ($isVerified === 'verified') ? 1 : 0;
    $stmt = $conn->prepare("UPDATE {$tableName} SET is_verified = ? WHERE userId = ?");
    $stmt->bind_param("ii", $verifiedInt, $userId);
}

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "User updated successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update user"]);
}
?>