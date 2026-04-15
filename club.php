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

//-- Retrieve signature data
$propertyId   = $input['propertyId']   ?? $_POST['propertyId']   ?? $_GET['propertyId']   ?? null;
$clubId = $input['clubId']            ?? $_POST['clubId']    ?? $_GET['clubId']    ?? null;
$countClubs = $input['countClubs'] ??    $_POST['countClubs'] ?? $_GET['countClubs']    ?? null;

error_log("propertyId=$propertyId, clubId=$clubId");

//-- INFORMATION FOR GETTING ALL FEEDBACK FOR A PROPERTY
if ($propertyId !== null && $propertyId !== '' && $clubId !== null && $clubId !== '' ){
    // Prepare a statement
    $propertyIdInt = (int)$propertyId;
    $clubIdInt = (int)$clubId;

    //-- Should match comments with specific property and inclusion of certain clubId
    $stmt = $conn->prepare(
        "select * from huskyrentlens_comments where propertyId = ? and clubId = ?"
    );
    
    //-- Statement error handling
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }
    
    // Bind parameters
    $stmt->bind_param("ii", $propertyIdInt,$clubIdInt);   

    //-- Attempt to execute statement
    if (!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
        $stmt->close();
        exit();
    }

    //-- Get results from Query
    $result = $stmt->get_result();
    echo json_encode([
        "status" => "success",
        "received_property_id" => $propertyIdInt,
        "received_club_id" => $clubIdInt,
        "count" => $result->num_rows,
        "data" => $result->fetch_all(MYSQLI_ASSOC)
    ]);

    // Close connection
    $stmt->close();
    $conn->close();
    exit();
} else if ($propertyId !== null && $propertyId !== '' && $countClubs !== null && $countClubs === 'yes'){

    // Prepare a statement
    $propertyIdInt = (int)$propertyId;

    //-- Should match comments with specific property and inclusion of certain clubId
    $stmt = $conn->prepare("SELECT *
        from huskyrentlens_comments as commentTbl
        left join huskyrentlens_communityTags as tagTbl
            on tagTbl.clubId = commentTbl.cId
        where propertyId = ?");
    
    //-- Statement error handling
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }
    
    // Bind parameters
    $stmt->bind_param("i", $propertyIdInt);   

    //-- Attempt to execute statement
    if (!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
        $stmt->close();
        exit();
    }

    //-- Get results from Query
    $result = $stmt->get_result();
    echo json_encode([
        "status" => "success",
        "received_property_id" => $propertyIdInt,
        "count_clubs" => $countClubs,
        "count" => $result->num_rows,
        "data" => $result->fetch_all(MYSQLI_ASSOC)
    ]);

    // Close connection
    $stmt->close();
    $conn->close();
    exit();
} else { // we have something for getReviews
     echo json_encode([
        "status" => "error",
        "message" => "Misconfigured property"
    ]);
    exit();
}
?>
