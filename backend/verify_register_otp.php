<?php
// OTP verification endpoint for student account activation.

session_start();
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
        require_once $candidate;
        $bootstrapLoaded = true;
        break;
    }
}

if (!$bootstrapLoaded || !isset($conn)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database bootstrap not found"]);
    exit();
}

// Parse request body.
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$userId = intval($input['userId'] ?? 0);
$otp = trim($input['otp'] ?? '');

if (!$userId || !preg_match('/^\d{6}$/', $otp)) {
    echo json_encode(["status" => "error", "message" => "Invalid OTP"]);
    exit();
}

// Load the newest OTP record for this user.
$stmt = $conn->prepare("SELECT id, otpHash, expiresAt, attempts FROM huskyrentlens_otps WHERE userId = ? ORDER BY createdAt DESC LIMIT 1");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Database error"]);
    exit();
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if (!$row) {
    echo json_encode(["status" => "error", "message" => "OTP not found or expired"]);
    exit();
}

if ((int)$row['attempts'] >= 5) {
    $deleteStmt = $conn->prepare("DELETE FROM huskyrentlens_otps WHERE userId = ?");
    if ($deleteStmt) {
        $deleteStmt->bind_param("i", $userId);
        $deleteStmt->execute();
    }
    echo json_encode(["status" => "error", "message" => "Too many attempts"]);
    exit();
}

if (new DateTime() > new DateTime($row['expiresAt'])) {
    $deleteStmt = $conn->prepare("DELETE FROM huskyrentlens_otps WHERE userId = ?");
    if ($deleteStmt) {
        $deleteStmt->bind_param("i", $userId);
        $deleteStmt->execute();
    }
    echo json_encode(["status" => "error", "message" => "OTP expired"]);
    exit();
}

if (!password_verify($otp, $row['otpHash'])) {
    $up = $conn->prepare("UPDATE huskyrentlens_otps SET attempts = attempts + 1 WHERE id = ?");
    if ($up) {
        $up->bind_param("i", $row['id']);
        $up->execute();
    }
    echo json_encode(["status" => "error", "message" => "Incorrect OTP"]);
    exit();
}

// OTP valid; activate account and clear OTP records.
$deleteStmt = $conn->prepare("DELETE FROM huskyrentlens_otps WHERE userId = ?");
if ($deleteStmt) {
    $deleteStmt->bind_param("i", $userId);
    $deleteStmt->execute();
}

$verifyStmt = $conn->prepare("UPDATE huskyrentlens_users SET is_verified = 1 WHERE userId = ?");
if (!$verifyStmt) {
    echo json_encode(["status" => "error", "message" => "Database error"]);
    exit();
}
$verifyStmt->bind_param("i", $userId);
$verifyStmt->execute();

echo json_encode(["status" => "success", "message" => "Account verified"]);