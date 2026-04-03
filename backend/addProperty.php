<?php
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


if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $name = $_POST['name'] ?? '';
    $address = $_POST['address'] ?? '';
    $city = $_POST['city'] ?? '';
    $distance = $_POST['distance'] ?? '';
    $description = $_POST['description'] ?? '';

    $amenities = isset($_POST['amenities']) ? json_decode($_POST['amenities'], true) : [];
    $roomsInfo = isset($_POST['roomsInfo']) ? json_decode($_POST['roomsInfo'], true) : [];

    $propertyImages = $_FILES['propertyImages'] ?? null;


    $testResponse = [
            "status" => "success",
            "message" => "to php data ok",
            "received_text" => [
                "name" => $name,
                "address" => $address,
                "room_count" => count($roomsInfo) 
            ],
            "received_files" => [
                "property_images" => isset($_FILES['propertyImages']) ? "public place image ok" : "no public place image",
                "all_files_raw_data" => $_FILES 
            ]
        ];

    echo json_encode($testResponse);

    if (isset($conn)) {
        $conn->close();
    }

    exit();
}

echo json_encode(["status" => "error", "message" => "Invalid Request Method"]);

if (isset($conn)) {
    $conn->close();
}
?>
