<?php
// Public endpoint: returns all properties used by the frontend map/listing pages.

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../../server_backend/collectSet.php';

// Fetch all property rows.
$stmt = $conn->prepare("SELECT * FROM test_property");
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    "status" => "success",
    "data" => $data
]);

if (isset($conn)) {
    $conn->close();
}
?>