<?php
// OTP resend endpoint for unverified users.

session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$bootstrapCandidates = [
    __DIR__ . '/../../server_backend/collectSet.php',
    __DIR__ . '/../server_backend/collectSet.php'
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

function sendSMTPEmail($to, $subject, $body, $from = '') {
    // SMTP values come from server_backend/keys/.env
    $host = getenv('SMTP_HOST');
    $port = getenv('SMTP_PORT');
    $username = getenv('SMTP_USER');
    $password = getenv('SMTP_PASS');
    $from = getenv('SMTP_FROM') ?: ($from ?: $username);

    if (!$host || !$port || !$username || !$password || !$from) {
        return false;
    }

    $port = intval($port);

    // Reads one SMTP server response (supports multiline replies).
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
        // Open secure SMTP socket.
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
        // Authenticate with AUTH LOGIN.
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

        // Submit message payload.
        $headers = "MIME-Version: 1.0\r\nFrom: HuskyRentLens <{$from}>\r\nTo: <{$to}>\r\nSubject: {$subject}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n";
        fwrite($connection, $headers . $body . "\r\n.\r\n");
        [$code] = $readReply($connection);
        fwrite($connection, "QUIT\r\n");
        fclose($connection);

        return $code === '250';
    } catch (Exception $e) {
        return false;
    }
}

// Parse request body.
$input = json_decode(file_get_contents('php://input'), true);
$email = strtolower(trim($input['email'] ?? ''));
if (!$email) {
    echo json_encode(["status" => "error", "message" => "Email required"]);
    exit();
}

// Find unverified user account.
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

// Replace old OTP with a new 5-minute code.
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

$digitHtml = implode('', array_map(function ($d) {
    return '<span style="display:inline-block;width:52px;height:64px;line-height:64px;text-align:center;font-size:34px;font-weight:800;color:#1a1a2e;background:#f7c948;border-radius:12px;margin:0 5px;font-family:monospace;">' . $d . '</span>';
}, str_split((string)$otp)));

$emailSubject = 'Your HuskyRentLens verification code';
$emailBody = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d1b2a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1b2a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:36px 48px;text-align:center;border-bottom:4px solid #f7c948;">
            <div style="font-size:26px;font-weight:800;color:#f7c948;letter-spacing:3px;text-transform:uppercase;">HUSKY<span style="color:#ffffff;">RENT</span>LENS</div>
            <div style="color:#94a3b8;font-size:12px;margin-top:6px;letter-spacing:1px;text-transform:uppercase;">Student Housing Platform</div>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:44px 48px 36px;">
            <h1 style="margin:0 0 10px;font-size:24px;font-weight:700;color:#1a1a2e;">Verify your account</h1>
            <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.7;">Use the one-time code below to complete your registration. This code expires in <strong style="color:#1a1a2e;">5&nbsp;minutes</strong>.</p>
            <div style="text-align:center;margin:0 0 36px;padding:24px 0;background:#f8fafc;border-radius:12px;">
              {$digitHtml}
            </div>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;">
            <table cellpadding="0" cellspacing="0" width="100%"><tr>
              <td style="background:#fefce8;border-left:4px solid #f7c948;border-radius:0 8px 8px 0;padding:14px 18px;">
                <p style="margin:0;font-size:13px;color:#713f12;line-height:1.6;"><strong>Security reminder:</strong> HuskyRentLens will never ask for this code by phone or chat. Never share it with anyone.</p>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:24px 48px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">This email was sent because an account was created using this address.</p>
            <p style="margin:0 0 14px;font-size:12px;color:#94a3b8;">If you didn&rsquo;t create an account, you can safely ignore this email.</p>
            <p style="margin:0;font-size:11px;color:#cbd5e1;">&copy; 2026 HuskyRentLens</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
if (sendSMTPEmail($email, $emailSubject, $emailBody)) {
    echo json_encode(["status" => "success", "message" => "Verification code sent", "userId" => $userId]);
} else {
    echo json_encode(["status" => "error", "message" => "Unable to send verification code"]);
}
