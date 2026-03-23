<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once __DIR__ . '/../../backend/collectSet.php';
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$input = json_decode(file_get_contents('php://input'), true);
$email = strtolower(trim($input['email'] ?? ''));

if (!$email) {
    echo json_encode(["status" => "error", "message" => "Email required"]);
    exit();
}

$stmt = $conn->prepare("SELECT userId FROM huskyrentlens_users WHERE email = ? AND is_verified = 0");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "User not found or already verified"]);
    exit();
}

$user = $result->fetch_assoc();
$userId = $user['userId'];

$otp = random_int(100000, 999999);
$otpHash = password_hash((string)$otp, PASSWORD_DEFAULT);
$expiresAt = (new DateTime('+5 minutes'))->format('Y-m-d H:i:s');

$conn->query("DELETE FROM huskyrentlens_otps WHERE userId = {$userId}");
$insertOtp = $conn->prepare("INSERT INTO huskyrentlens_otps (userId, otpHash, expiresAt, attempts, createdAt) VALUES (?, ?, ?, 0, NOW())");
$insertOtp->bind_param("iss", $userId, $otpHash, $expiresAt);
$insertOtp->execute();

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'groups-2024.it.mtu.edu';
    $mail->SMTPAuth = true;
    $mail->Username = 'huskyrentlens@huskyrentlens.cs.mtu.edu';
    $mail->Password = 'mmROqc.6I.Bn61L=';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;

    $mail->setFrom('huskyrentlens@huskyrentlens.cs.mtu.edu', 'HuskyRentLens');
    $mail->addAddress($email);
    $mail->Subject = 'HuskyRentLens verification code';
    $mail->Body = "Your verification code: $otp\nExpires in 5 minutes.";

    $mail->send();
    echo json_encode(["status" => "success", "message" => "Verification code sent", "userId" => $userId]);
} catch (Exception $e) {
    error_log('Mail error: ' . $mail->ErrorInfo);
    echo json_encode(["status" => "error", "message" => "Unable to send verification code"]);
}
?>
