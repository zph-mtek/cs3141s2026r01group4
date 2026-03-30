<?php
// Zack Horsch
// This file allows us to automate git pull on the server when we push to the main branch on github
// This is the only file the public can see.

$private_path = __DIR__ . '/../server_backend/deploy_logic.php';

if (file_exists($private_path)) {
    require_once($private_path);
} else {
    header("HTTP/1.1 404 Not Found");
    die("Deployment engine offline.");
}