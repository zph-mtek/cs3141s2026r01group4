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
$pickedClubId   = $input['assocClubId']   ?? $_POST['assocClubId'] ?? $_GET['assocClubId']        ?? null;

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

    // Get results from query
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
    || ($commentDesc === null || $commentDesc === '')
    || ($starCt === null || $starCt === '')
    || ($pickedClubId === null || $pickedClubId === '')) {

    echo json_encode([
        "status" => "error",
        "message" => "Misconfigured property"
    ]);
    exit();
}

//-- We have been given a custom club name
// Thanks @Claude!
if (!is_int($pickedClubId)) { // we have been given an alphanumeric string instead of an integer for the club Id
    //-- Check if this club already exists
    $checkStmt = $conn->prepare("select cId from huskyrentlens_communityTags where clubName = ?");
    $checkStmt->bind_param("s", $pickedClubId);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows > 0) {
        //-- Club exists, grab its id
        $checkStmt->bind_result($existingClubId);
        $checkStmt->fetch();
        $pickedClubId = $existingClubId;
    } else {
        //-- Club does not exist, insert it into communityTags
        $insertClubStmt = $conn->prepare("insert into huskyrentlens_communityTags (clubName,communityType) values (?,?)");
        
        $communityType = "C"; // default value as club
        $insertClubStmt->bind_param("ss", $pickedClubId, $communityType);

        $insertClubStmt->execute();
        $pickedClubId = $conn->insert_id; // we are going to upload this comment with this id
        $insertClubStmt->close();
    }

    $checkStmt->close();
}

if ($userId) {
    echo json_encode([
        "status" => "error",
        "message" => "Debugging",
        "userId" => $userId
    ]);
    exit();
}

// Make an integer
$propertyIdInt = (int)$propertyId;
$rentalIdInt = (int)$rentalId;
$userIdInt   = (int)$userId;
$stars       = (int)$starCt;
$rentalUtilityCost = (int)$utilityCost;
$clubId = (int)$pickedClubId;

// Prepare a statement
$stmt = $conn->prepare(
    "insert into huskyrentlens_comments (commentDesc,rentalId,userId,propertyId,stars,costOfUtilities,clubId) values (?, ?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
    exit();
}

$stmt->bind_param("siiiiii", $commentDesc, $rentalIdInt, $userIdInt, $propertyIdInt,$stars,$rentalUtilityCost,$clubId);
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
    "clubId" => $clubId,
    "stars" => $stars,
    "costOfUtilities" => $rentalUtilityCost
]);

$stmt->close();
$conn->close();
exit();
?>
