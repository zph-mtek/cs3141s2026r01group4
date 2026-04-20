<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

if (!$bootstrapLoaded || !isset($conn)) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

$autoloadCandidates = [ __DIR__ . '/../../server_backend/vendor/autoload.php', __DIR__ . '/../server_backend/vendor/autoload.php' ];
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
    if (!file_exists($envPath)) {
        $envPath = __DIR__ . '/../keys/.env';
    }
    
    $envData = parse_ini_file($envPath);
    $secretKey = $envData['JWT_SECRET'] ?? '';

    if (!$secretKey) {
        throw new Exception("Secret key not found in .env");
    }

    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    if ($decoded->data->role !== 'admin') throw new Exception("Not admin");
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Unauthorized: " . $e->getMessage()]); 
    exit();
}

// 実際のデータベース構造に合わせたSQL
$sql = "
    SELECT 
        p.propertyId AS id, 
        p.name, 
        p.createdAt AS listedAt,
        (SELECT imageUrl FROM huskyrentlens_property_image WHERE propertyId = p.propertyId LIMIT 1) AS imageUrl,
        (SELECT COUNT(*) FROM huskyrentlens_comments WHERE propertyId = p.propertyId) AS commentCount
    FROM huskyrentlens_property p
    ORDER BY p.createdAt DESC
";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $conn->error]);
    exit();
}

$properties = [];
while ($row = $result->fetch_assoc()) {
    $properties[] = $row;
}

echo json_encode(["status" => "success", "data" => $properties]);
?>