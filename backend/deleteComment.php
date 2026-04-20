<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

$bootstrapCandidates = [ 
    __DIR__ . '/../../server_backend/collectSet.php', 
    __DIR__ . '/../server_backend/collectSet.php',
    __DIR__ . '/collectSet.php'
];
$bootstrapLoaded = false;
foreach ($bootstrapCandidates as $candidate) {
    if (is_readable($candidate)) { require_once $candidate; $bootstrapLoaded = true; break; }
}
if (!$bootstrapLoaded || !isset($conn)) { 
    echo json_encode(["status" => "error", "message" => "Database connection failed"]); 
    exit(); 
}

$autoloadCandidates = [ 
    __DIR__ . '/../../server_backend/vendor/autoload.php', 
    __DIR__ . '/../server_backend/vendor/autoload.php' 
];
$autoloadLoaded = false;
foreach ($autoloadCandidates as $candidate) {
    if (is_readable($candidate)) { require_once $candidate; $autoloadLoaded = true; break; }
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
    $envPath = __DIR__ . '/../../keys/.env';
    if (!file_exists($envPath)) { $envPath = __DIR__ . '/../keys/.env'; }
    $envData = parse_ini_file($envPath);
    $secretKey = $envData['JWT_SECRET'] ?? '';
    if (!$secretKey) throw new Exception("Secret key not found");
    
    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    if ($decoded->data->role !== 'admin') throw new Exception("Not admin");
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]); 
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$commentId = $data['commentId'] ?? null;

if (!$commentId) {
    echo json_encode(["status" => "error", "message" => "Missing commentId"]); 
    exit();
}

$stmt = $conn->prepare("DELETE FROM huskyrentlens_comments WHERE commentId = ?");
$stmt->bind_param("i", $commentId);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Comment deleted successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to delete comment"]);
}
?>