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
    echo json_encode(["status" => "error", "message" => "Database connection failed"]); exit();
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

if (!$token) { echo json_encode(["status" => "error", "message" => "No token provided"]); exit(); }

try {
    $secretKey = getenv('JWT_SECRET');
    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    if ($decoded->data->role !== 'admin') throw new Exception("Not admin");
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]); exit();
}

$sql = "
    SELECT r.id, r.name, r.created_at AS listedAt, r.image_url AS imageUrl, 
           COUNT(rev.id) AS commentCount 
    FROM huskyrentlens_rentals r
    LEFT JOIN huskyrentlens_reviews rev ON r.id = rev.rentalId
    GROUP BY r.id
";
$result = $conn->query($sql);

$properties = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $properties[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $properties]);
?>