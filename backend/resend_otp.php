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

include_once __DIR__ . '/collectSet.php';

function sendSMTPEmail($to, $subject, $body, $from = '') {
    $host = getenv('SMTP_HOST');
    $port = getenv('SMTP_PORT');
    $username = getenv('SMTP_USER');
    $password = getenv('SMTP_PASS');
    $from = getenv('SMTP_FROM') ?: ($from ?: $username);

    if (!$host || !$port || !$username || !$password || !$from) {
        return false;
    }

    $port = intval($port);

    $readReply = function ($connection) {
        $lines = [];
        $code = null;

        while (!feof($connection)) {
            $reply = fgets($connection, 1024);
            if ($reply === false) {
                break;
            }

            $reply = rtrim($reply, "\r\n");
            $lines[] = $reply;

            if (preg_match('/^(\d{3})([ -])/', $reply, $matches)) {
                $code = $matches[1];
                if ($matches[2] === ' ') {
                    break;
                }
            } else {
                break;
            }
        }

        return [$code, $lines];
    };

    try {
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
            ],
        ]);

        $connection = stream_socket_client('ssl://' . $host . ':' . $port, $errno, $errstr, 30, STREAM_CLIENT_CONNECT, $context);
        if (!$connection) {
            return false;
        }

        $readReply($connection);
        fwrite($connection, "EHLO husky.local\r\n");
        [$code] = $readReply($connection);
        if ($code !== '250') {
            fclose($connection);
            return false;
        }

        fwrite($connection, "AUTH LOGIN\r\n");
        [$code] = $readReply($connection);
        if ($code !== '334') {
            fclose($connection);
            return false;
        }

        fwrite($connection, base64_encode($username) . "\r\n");
        [$code] = $readReply($connection);
        if ($code !== '334') {
            fclose($connection);
            return false;
        }

        fwrite($connection, base64_encode($password) . "\r\n");
        [$responseCode, $responseLines] = $readReply($connection);
        $response = implode("\n", $responseLines);
        if ($responseCode !== '235' && strpos($response, '2.7.0') === false) {
            fclose($connection);
            return false;
        }

        fwrite($connection, "MAIL FROM:<{$from}>\r\n");
        [$code] = $readReply($connection);
        if ($code !== '250') {
            fclose($connection);
            return false;
        }

        fwrite($connection, "RCPT TO:<{$to}>\r\n");
        [$code] = $readReply($connection);
        if ($code !== '250' && $code !== '251') {
            fclose($connection);
            return false;
        }

        fwrite($connection, "DATA\r\n");
        [$code] = $readReply($connection);
        if ($code !== '354') {
            fclose($connection);
            return false;
        }

        $headers = "From: HuskyRentLens <{$from}>\r\nTo: <{$to}>\r\nSubject: {$subject}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n";
        fwrite($connection, $headers . $body . "\r\n.\r\n");
        [$code] = $readReply($connection);
        fwrite($connection, "QUIT\r\n");
        fclose($connection);

        return $code === '250';
    } catch (Exception $e) {
        return false;
    }
}

$input = json_decode(file_get_contents('php://input'), true);
$email = strtolower(trim($input['email'] ?? ''));
if (!$email) {
    echo json_encode(["status" => "error", "message" => "Email required"]);
    exit();
}

$stmt = $conn->prepare("SELECT userId FROM huskyrentlens_users WHERE email = ? AND is_verified = 0");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Database error"]);
    exit();
}

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
if (!$insertOtp) {
    echo json_encode(["status" => "error", "message" => "Database error"]);
    exit();
}

$insertOtp->bind_param("iss", $userId, $otpHash, $expiresAt);
if (!$insertOtp->execute()) {
    echo json_encode(["status" => "error", "message" => "Database error"]);
    exit();
}

$emailSubject = 'HuskyRentLens verification code';
$emailBody = "Your verification code: $otp\nExpires in 5 minutes.";
if (sendSMTPEmail($email, $emailSubject, $emailBody)) {
    echo json_encode(["status" => "success", "message" => "Verification code sent", "userId" => $userId]);
} else {
    echo json_encode(["status" => "error", "message" => "Unable to send verification code"]);
}
