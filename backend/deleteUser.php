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
    echo json_encode(["status" => "error", "message" => "JWT autoload not found"]);
    exit();
}

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = apache_request_headers();
$authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

if (!$token) {
    echo json_encode(["status" => "error", "message" => "No token provided"]);
    exit();
}

try {
    $secretKey = getenv('JWT_SECRET');
    if (!$secretKey) {
        throw new Exception("Server configuration error");
    }

    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    if ($decoded->data->role !== 'admin') throw new Exception("Not admin");
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Unauthorized: " . $e->getMessage()]);
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
    echo json_encode(["status" => "success", "message" => "User deleted successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to delete user"]);
}
?>