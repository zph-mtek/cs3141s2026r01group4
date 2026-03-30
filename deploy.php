<?php
// Zack Horsch
// This file allows us to automate git pull on the server when we push to the main branch on github

$logic_path = '/itss/home/huskyrentlens/server_backend/deploy_logic.php';

if (file_exists($logic_path)) {
    require_once($logic_path);
} else {
    // If you see this, the path above is wrong or the file is missing
    header("HTTP/1.1 404 Not Found");
    die("Deployment engine not found at: " . $logic_path);
}