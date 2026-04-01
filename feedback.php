<?php
header("Content-Type: application/json; charset=UTF-8");

// 1. Check DB connection
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
    die(json_encode(["step" => "FAILED", "reason" => "No DB connection"]));
}
echo json_encode(["step" => "1 - DB connected"]) . "\n";

// 2. Check input parsing
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
echo json_encode(["step" => "2 - raw input", "body" => $rawBody, "parsed" => $input]) . "\n";

// 3. Check field extraction
$propertyId  = $input['propertyId']  ?? $_POST['propertyId']  ?? null;
$rentalId    = $input['rentalId']    ?? $_POST['rentalId']    ?? null;
$commentDesc = $input['commentDesc'] ?? $_POST['commentDesc'] ?? null;
$userId      = $input['userId']      ?? $_POST['userId']      ?? null;
echo json_encode(["step" => "3 - fields", "propertyId" => $propertyId, "rentalId" => $rentalId, "commentDesc" => $commentDesc, "userId" => $userId]) . "\n";

// 4. Check null gate
if ($propertyId === null || $propertyId === ''
 || $rentalId   === null || $rentalId   === ''
 || $commentDesc === null || $commentDesc === ''
 || $userId     === null || $userId     === '') {
    die(json_encode(["step" => "FAILED", "reason" => "Null check failed", "propertyId" => $propertyId, "rentalId" => $rentalId, "commentDesc" => $commentDesc, "userId" => $userId]));
}
echo json_encode(["step" => "4 - null check passed"]) . "\n";

// 5. Check prepare  <-- also verify your exact table name here
$stmt = $conn->prepare("INSERT INTO huskyrentlens_comment (propertyId, rentalId, userId, commentDesc) VALUES (?,?,?,?)");
if (!$stmt) {
    die(json_encode(["step" => "FAILED", "reason" => "Prepare failed", "error" => $conn->error]));
}
echo json_encode(["step" => "5 - prepare ok"]) . "\n";

// 6. Check bind + execute
$propertyIdInt = (int)$propertyId;
$rentalIdInt   = (int)$rentalId;
$userIdInt     = (int)$userId;
$stmt->bind_param("iiis", $propertyIdInt, $rentalIdInt, $userIdInt, $commentDesc);
if (!$stmt->execute()) {
    die(json_encode(["step" => "FAILED", "reason" => "Execute failed", "error" => $stmt->error]));
}
echo json_encode(["step" => "6 - execute ok", "insert_id" => $stmt->insert_id]) . "\n";

$stmt->close();
$conn->close();
?>
