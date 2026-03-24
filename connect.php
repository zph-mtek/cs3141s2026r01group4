<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Support both deployment layouts:
// 1) private server_backend at project root
// 2) legacy backend bridge include
$bootstrapCandidates = [
    __DIR__ . '/server_backend/connect.php',
    __DIR__ . '/../server_backend/connect.php',
    __DIR__ . '/backend/collectSet.php'
];

$bootstrapLoaded = false;
foreach ($bootstrapCandidates as $candidate) {
    if (is_readable($candidate)) {
        require_once $candidate;
        $bootstrapLoaded = true;
        break;
    }
}

if (!$bootstrapLoaded) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database bootstrap not found",
        "checked" => [
            "server_backend/connect.php",
            "../server_backend/connect.php",
            "backend/collectSet.php"
        ]
    ]);
    exit();
}
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
if (!is_array($input)) {
    $input = [];
}

$propertyId = $input['propertyId'] ?? $_POST['propertyId'] ?? $_GET['propertyId'] ?? null;
$allRentals = $input['allRentals'] ?? $_POST['allRentals'] ?? $_GET['allRentals'] ?? null;

if (!isset($conn)) {
    echo json_encode(["error" => "Database connection not available"]);
    exit();
}

if ($propertyId === null || $propertyId === '') {
    echo json_encode([
        "error" => "No propertyId detected",
        "server_info" => [
            "query_string" => $_SERVER['QUERY_STRING'] ?? '',
            "request_uri" => $_SERVER['REQUEST_URI'] ?? ''
        ]
    ]);
    exit();
}

if ((string)$propertyId === '-1') {
    $stmt = $conn->prepare("SELECT * FROM huskyrentlens_property");
    if (!$stmt) {
        echo json_encode(["error" => "Prepare failed: " . $conn->error]);
        exit();
    }

    if (!$stmt->execute()) {
        echo json_encode(["error" => "Execute failed: " . $stmt->error]);
        exit();
    }

    $result = $stmt->get_result();
    echo json_encode([
        "status" => "success",
        "received_id" => $propertyId,
        "count" => $result->num_rows,
        "data" => $result->fetch_all(MYSQLI_ASSOC)
    ]);
    $stmt->close();
    exit();
}

if ($allRentals === 'yes') {
    $stmt = $conn->prepare("SELECT * FROM huskyrentlens_rental WHERE propertyId = ?");
    if (!$stmt) {
        echo json_encode(["error" => "Prepare failed: " . $conn->error]);
        exit();
    }

    $stmt->bind_param("s", $propertyId);
    if (!$stmt->execute()) {
        echo json_encode(["error" => "Execute failed: " . $stmt->error]);
        exit();
    }

    $result = $stmt->get_result();
    echo json_encode([
        "status" => "success",
        "received_id" => $propertyId,
        "count" => $result->num_rows,
        "data" => $result->fetch_all(MYSQLI_ASSOC)
    ]);
    $stmt->close();
    exit();
}

$stmt = $conn->prepare("SELECT * FROM huskyrentlens_property WHERE propertyId = ?");
if (!$stmt) {
    echo json_encode(["error" => "Prepare failed: " . $conn->error]);
    exit();
}

$stmt->bind_param("s", $propertyId);
if (!$stmt->execute()) {
    echo json_encode(["error" => "Execute failed: " . $stmt->error]);
    exit();
}

$result = $stmt->get_result();
echo json_encode([
    "status" => "success",
    "received_id" => $propertyId,
    "count" => $result->num_rows,
    "data" => $result->fetch_all(MYSQLI_ASSOC)
]);
$stmt->close();

$conn->close();
