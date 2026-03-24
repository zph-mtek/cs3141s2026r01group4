
<?php
/* Database connection for HuskyRentLens */

$servername = getenv('DB_HOST') ?: 'localhost';
$username = getenv('DB_USER') ?: 'huskyrentlens_huskyrentlens';
$password = getenv('DB_PASS') ?: 'mmROqc.6I.Bn61L=';
$dbname = getenv('DB_NAME') ?: 'huskyrentlens_coreapp';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log('[DB] Connection failed: ' . $conn->connect_error);
    http_response_code(500);
    die('Connection failed.');
}

$conn->set_charset('utf8mb4');