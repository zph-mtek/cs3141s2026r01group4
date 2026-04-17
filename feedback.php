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
$commentDesc  = $input['commentDesc']  ?? $_POST['commentDesc']  ?? $_GET['commentDesc']  ?? null;
$rentalId     = $input['rentalId']     ?? $_POST['rentalId']     ?? $_GET['rentalId']     ?? null;
$userId       = $input['userId']       ?? $_POST['userId']       ?? $_GET['userId']       ?? null;
$starCt       = $input['stars']        ?? $_POST['stars']        ?? $_GET['stars']        ?? null;
$getReviews   = $input['getReviews']   ?? $_POST['getReviews'] ?? $_GET['reviews']        ?? null;
$utilityCost = $input['rentalUtilityCost'] ?? $_POST['rentalUtilityCost'] ?? $_GET['rentalUtilityCost'] ?? 0;
$clubId = $input['clubId'] ?? $_POST['clubId'] ?? $_GET['clubId'] ?? null;

error_log("commentDesc=$commentDesc, rentalId=$rentalId, userId=$userId");

//-- INFORMATION FOR GETTING ALL FEEDBACK FOR A PROPERTY
if ($getReviews === 'yes' && $propertyId !== null && $propertyId !== ''){
    // Prepare a statement
    $propertyIdInt = (int)$propertyId;
    
    $stmt = $conn->prepare(
        "select * from huskyrentlens_comments where propertyId = ?"
    );
    
    // Statement error handling
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }
    
    // Bind parameters
    $stmt->bind_param("i", $propertyIdInt);   

    // Attempt to execute statement
    if (!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
        $stmt->close();
        exit();
    }

    // Get results from queryy
    $result = $stmt->get_result();
    echo json_encode([
        "status" => "success",
        "received_id" => $propertyIdInt,
        "count" => $result->num_rows,
        "data" => $result->fetch_all(MYSQLI_ASSOC)
    ]);

    // Close connection
    $stmt->close();
    $conn->close();
    exit();
} else if ($getReviews !== null) { // we have something for getReviews
     echo json_encode([
        "status" => "error",
        "message" => "Misconfigured property"
    ]);
    exit();
}


//-- ALL INFORMATION FOR GIVING FEEDBACK
// Ensure that these are not null
if ( ($propertyId === null || $propertyId === '')
    || ($rentalId === null || $rentalId === '' )
    || ($userId === null || $userId === '')
    || $commentDesc === null || $commentDesc === '' 
    || $starCt === null || $commentDesc === ''
       || $clubId === null || ($clubId !== null && (int)$clubId) > -1) {
    
    echo json_encode([
        "status" => "error",
        "message" => "Misconfigured property"
    ]);
    exit();
}

// Make an integer
$propertyIdInt = (int)$propertyId;
$rentalIdInt = (int)$rentalId;
$userIdInt   = (int)$userId;
$stars       = (int)$starCt;
$rentalUtilityCost = (int)$utilityCost;
$clubIdInt = (int)$clubId;

// Prepare a statement
$stmt = $conn->prepare(
    "INSERT INTO huskyrentlens_comments (commentDesc, rentalId, userId,propertyId,stars,costOfUtilities,clubId) VALUES (?, ?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
    exit();
}

$stmt->bind_param("siiiii", $commentDesc, $rentalIdInt, $userIdInt, $propertyIdInt,$stars,$rentalUtilityCost,$clubIdInt);
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
    "commentDesc" => $commentDesc,
    "stars" => $stars,
    "costOfUtilities" => $rentalUtilityCost,
    "clubId" => $clubIdInt
]);

$stmt->close();
$conn->close();
exit();
?>
