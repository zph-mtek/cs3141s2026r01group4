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

// Get needed things for inserting the comment
$propertyId = $input['propertyId'] ?? $_POST['propertyId'] ?? $_GET['propertyId'] ?? null;
$rentalId = $input['rentalId'] ?? $_POST['rentalId'] ?? $_GET['rentalId'] ?? null;
$commentDesc = $input['rentalId'] ?? $_POST['rentalId'] ?? $_GET['rentalId'] ?? null;
$userId = $input['userId'] ?? $_POST['userId'] ?? $_GET['userId'] ?? null;

//-- NULL CHECKING
if (($propertyId === null || $propertyId === '')
       || ($commentDesc === null || $commentDesc === '')
        || ($rentalId === null || $rentalId === '')
    || ($userId === null || $userId === '')
   ) {
    echo json_encode([
        "status" => "error",
        "message" => "No propertyId detected"
    ]);
    exit();
}

// Escalate propertyId and rentalId to integer
$propertyIdInt = (int)$propertyId;
$rentalIdInt = (int)$rentalId;
$userId = (int)$userId;

// Prepare the statement
$stmt = $conn->prepare(
    "insert into huskyrentlens_comment (propertyId,rentalId,userId,commentDesc)
        values (?,?,?,?)"
);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
    exit();
}

//-- Bind parameters into database
$stmt->bind_param("i", $propertyIdInt);
$stmt->bind_param("i",$rentalId);
$stmt->bind_param("i",$userId);
$stmt->bind_param("s",$commentDesc);

//-- Execute statement
if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
    $stmt->close();
    exit();
}

$result = $stmt->get_result();
echo json_encode([
    "status" => "success",
    "received_id" => $propertyIdInt,
    "count" => $result->num_rows,
    "data" => $result->fetch_all(MYSQLI_ASSOC)
]);

$stmt->close();
$conn->close();

?>
