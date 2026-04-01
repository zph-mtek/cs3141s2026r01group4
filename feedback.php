<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// Support both layouts:
// 1) project_root/server_backend/connect.php
// 2) one level above
// 3) backend bridge file
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
if (!$bootstrapLoaded || !isset($conn)) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database bootstrap not found"
    ]);
    exit();
}
// Read JSON body (fallback to POST/GET)
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
if (!is_array($input)) {
    $input = [];
}
$propertyId   = $input['propertyId']   ?? $_POST['propertyId']   ?? $_GET['propertyId']   ?? null;
$allRentals   = $input['allRentals']   ?? $_POST['allRentals']   ?? $_GET['allRentals']   ?? null;
$commentDesc  = $input['commentDesc']  ?? $_POST['commentDesc']  ?? $_GET['commentDesc']  ?? null;
$rentalId     = $input['rentalId']     ?? $_POST['rentalId']     ?? $_GET['rentalId']     ?? null;
$userId       = $input['userId']       ?? $_POST['userId']       ?? $_GET['userId']       ?? null;
if ($propertyId === null || $propertyId === '') {
    echo json_encode([
        "status" => "error",
        "message" => "No propertyId detected"
    ]);
    exit();
}
// Insert a comment for a rental
if ($commentDesc !== null && $rentalId !== null && $userId !== null) {
    $rentalIdInt = (int)$rentalId;
    $userIdInt   = (int)$userId;
    $stmt = $conn->prepare(
        "INSERT INTO huskyrentlens_comment (commentDesc, rentalId, userId) VALUES (?, ?, ?)"
    );
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }
    $stmt->bind_param("sii", $commentDesc, $rentalIdInt, $userIdInt);
    if (!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
        $stmt->close();
        exit();
    }
    echo json_encode([
        "status"      => "success",
        "message"     => "Comment inserted successfully",
        "commentId"   => $conn->insert_id,
        "rentalId"    => $rentalIdInt,
        "userId"      => $userIdInt,
        "commentDesc" => $commentDesc
    ]);
    $stmt->close();
    $conn->close();
    exit();
}
// List all properties
if ((string)$propertyId === '-1') {
    $stmt = $conn->prepare(
        "SELECT * FROM huskyrentlens_property"
    );
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }
    if (!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
        $stmt->close();
        exit();
    }
    $result = $stmt->get_result();
    echo json_encode([
        "status"      => "success",
        "received_id" => $propertyId,
        "count"       => $result->num_rows,
        "data"        => $result->fetch_all(MYSQLI_ASSOC)
    ]);
    $stmt->close();
    $conn->close();
    exit();
}
// Get all rentals for one property
if ($allRentals === 'yes') {
    $propertyIdInt = (int)$propertyId;
    $stmt = $conn->prepare("SELECT * FROM huskyrentlens_rental WHERE propertyId = ?");
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }
    $stmt->bind_param("i", $propertyIdInt);
    if (!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
        $stmt->close();
        exit();
    }
    $result = $stmt->get_result();
    echo json_encode([
        "status"      => "success",
        "received_id" => $propertyIdInt,
        "count"       => $result->num_rows,
        "data"        => $result->fetch_all(MYSQLI_ASSOC)
    ]);
    $stmt->close();
    $conn->close();
    exit();
}
// Get one property by ID
$propertyIdInt = (int)$propertyId;
$stmt = $conn->prepare(
    "SELECT * FROM huskyrentlens_property
     WHERE propertyId = ?"
);
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
    exit();
}
$stmt->bind_param("i", $propertyIdInt);
if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
    $stmt->close();
    exit();
}
$result = $stmt->get_result();
echo json_encode([
    "status"      => "success",
    "received_id" => $propertyIdInt,
    "count"       => $result->num_rows,
    "data"        => $result->fetch_all(MYSQLI_ASSOC)
]);
$stmt->close();
$conn->close();
