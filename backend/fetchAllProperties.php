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

// Fetch all property rows from current active table.
// Aliases keep compatibility with frontend fields used in cards/details.
$sql = "
    SELECT p.*, r_min.lowest_price
    FROM huskyrentlens_property p 
    LEFT JOIN (
        SELECT propertyId, MIN(cost) AS lowest_price 
        FROM huskyrentlens_rental 
        GROUP BY propertyId
    ) r_min ON p.propertyId = r_min.propertyId
";

// $stmt = $conn->prepare(
//     "SELECT p.*, MIN(r.cost) AS lowest_price
//     FROM huskyrentlens_property p 
//     LEFT JOIN huskyrentlens_rental r ON p.propertyId = r.propertyId
//     GROUP BY p.propertyId"
// );
$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_all(MYSQLI_ASSOC);

$stmt2 = $conn->prepare("SELECT * FROM huskyrentlens_property_image WHERE propertyId = ?");
$stmt2->bind_param("i", $id);
$stmt2->execute();
$imagesData = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

$stmt3 = $conn->prepare("SELECT * FROM huskyrentlens_reviews WHERE propertyId = ?");
$stmt3->bind_param("i", $id);
$stmt3->execute();
$reviewsData = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);



echo json_encode([
    "status" => "success",
    "data" => $data,
    "images" => $imagesData,
    "reviews" => $reviewsData
]);

if (isset($conn)) {
    $conn->close();
}
?>
