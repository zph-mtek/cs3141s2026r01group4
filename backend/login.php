<?php
// Login endpoint: validates credentials and returns a JWT for verified users.

session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

include_once __DIR__ . '/../../server_backend/collectSet.php';
require_once __DIR__ . '/../../server_backend/vendor/autoload.php';

use Firebase\JWT\JWT;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Read request payload.
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Extract credentials from request body.
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Load user account by email.
$stmt = $conn->prepare("SELECT userId, firstName, lastName, email, password, role, is_verified FROM huskyrentlens_users WHERE email = ?");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Database error"]);
    exit();
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Only verified users can sign in.
    if ((int)$user['is_verified'] !== 1) {
        echo json_encode(["status" => "error", "message" => "Please verify your email before signing in"]);
        exit();
    }

    // Validate password and issue token.
    if (password_verify($password, $user['password'])) {
        $secretKey = getenv('JWT_SECRET');
        if (!$secretKey) {
            echo json_encode(["status" => "error", "message" => "Server configuration error"]);
            exit();
        }

        $issuedTime = time();
        $expireTime = $issuedTime + (60 * 60);

        $payload = [
            "iat" => $issuedTime,
            "exp" => $expireTime,
            "data" => [
                "id" => $user['userId'],
                "firstName" => $user['firstName'],
                "email" => $email,
                "role" => $user['role']
            ]
        ];
        $jwt = JWT::encode($payload, $secretKey, 'HS256');

        echo json_encode(["status" => "success", "message" => "Login successful", "token" => $jwt]);
        exit();
    }

    echo json_encode(["status" => "error", "message" => "User does not exist or password is incorrect"]);
    exit();
} else {
    // Generic message avoids exposing account existence details.
        echo json_encode(["status" => "error", "message" => "User does not exist or password is incorrect"]);
        exit();
}
?>