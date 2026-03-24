<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
include_once __DIR__ . '/collectSet.php';
require_once __DIR__ . '/vendor/autoload.php';
use Firebase\JWT\JWT;

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    //get data as json
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    //get emial and password from react
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    //check if email exist in the database
    $stmt = $conn->prepare("SELECT userId, firstName, lastName, email, password, role, is_verified FROM huskyrentlens_users WHERE email = ?");
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Database error"]);
        exit();
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    //if there is more than 1 row user exist
    if($result -> num_rows > 0){
        //get the data from that user
        $user = $result->fetch_assoc();

        if ((int)$user['is_verified'] !== 1) {
            echo json_encode(["status" => "error", "message" => "Please verify your email before signing in"]);
            exit();
        }

        //check if password matches
        if(password_verify($password, $user['password'])){
            $secretKey = getenv('JWT_SECRET');
            if (!$secretKey) {
                echo json_encode(["status" => "error", "message" => "Server configuration error"]);
                exit();
            }

            $issuedTime = time();
            $expireTime = $issuedTime + (60 * 60);

            //payload to store in JWT
            $payload = array(
                "iat" => $issuedTime,
                "exp" => $expireTime,
                "data" => array(
                    "id" => $user['userId'],
                    "firstName" => $user['firstName'],
                    "email" => $email,
                    "role" => $user['role']
                )
            );
            //create JWT
            $jwt = JWT::encode($payload, $secretKey, 'HS256');

            //return response
            echo json_encode(["status" => "success", "message" => "Login successful", "token" => $jwt]);

            exit();
        }
        //If the password is wrong
        else{
            //return response
            echo json_encode(["status" => "error", "message" => "User does not exist or password is incorrect"]);
            exit();
        }
    }
    //If the user does not exist
    else{
        //return response
        echo json_encode(["status" => "error", "message" => "User does not exist or password is incorrect"]);
        exit();
    }


    
?>