<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once __DIR__ . '/../../backend/collectSet.php';
$input = json_decode(file_get_contents('php://input'), true);
$userId = intval($input['userId'] ?? 0);
$otp = trim($input['otp'] ?? '');
if (!$userId || !preg_match('/^\d{6}$/', $otp)) { echo json_encode(["status"=>"error","message"=>"Invalid OTP"]); exit(); }

$stmt = $conn->prepare("SELECT id, otpHash, expiresAt, attempts FROM huskyrentlens_otps WHERE userId = ? ORDER BY createdAt DESC LIMIT 1");
$stmt->bind_param("i", $userId);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
if (!$row) { echo json_encode(["status"=>"error","message"=>"OTP not found or expired"]); exit(); }
if ($row['attempts'] >= 5) { $conn->query("DELETE FROM huskyrentlens_otps WHERE userId=$userId"); echo json_encode(["status"=>"error","message"=>"Too many attempts"]); exit(); }
if (new DateTime() > new DateTime($row['expiresAt'])) { $conn->query("DELETE FROM huskyrentlens_otps WHERE userId=$userId"); echo json_encode(["status"=>"error","message"=>"OTP expired"]); exit(); }
if (!password_verify($otp, $row['otpHash'])) { $up=$conn->prepare("UPDATE huskyrentlens_otps SET attempts=attempts+1 WHERE id=?"); $up->bind_param("i",$row['id']); $up->execute(); echo json_encode(["status"=>"error","message"=>"Incorrect OTP"]); exit(); }

$conn->query("DELETE FROM huskyrentlens_otps WHERE userId=$userId");
$conn->query("UPDATE huskyrentlens_users SET is_verified=1 WHERE userId=$userId");
echo json_encode(["status"=>"success","message"=>"Account verified"]);