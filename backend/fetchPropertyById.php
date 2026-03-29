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

// Support both deployment layouts for private DB bootstrap.
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

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

$stmt = $conn->prepare("SELECT * FROM huskyrentlens_property WHERE propertyId = ?");

$stmt->bind_param("i", $id);
$stmt->execute();
$propertyData = $stmt->get_result()->fetch_assoc();

$stmt2 = $conn->prepare("SELECT * FROM huskyrentlens_rental WHERE propertyId = ? ORDER BY cost ASC");
$stmt2->bind_param("i", $id);
$stmt2->execute();
$rentalsData = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    "status" => "success",
    "property" => $propertyData,
    "rentals" => $rentalsData
]);


if (isset($conn)) {
    $conn->close();
}
?>
