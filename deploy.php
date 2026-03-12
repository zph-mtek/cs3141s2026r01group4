<?php
// Get the JSON payload from GitHub.
$content = file_get_contents("php://input");
$payload = json_decode($content, true);

// Only proceed if the push was to the 'main' branch
if ($payload['ref'] !== 'refs/heads/main') {
    die("Not the main branch. Skipping deployment.");
}

// Path to your public_html folder
$path = "/home/huskyrentlens/public_html";

// Run the pull command and capture output
$output = shell_exec("cd $path && git pull origin main 2>&1");

// Optional: Log results to a file to check for errors
file_put_contents('deploy_log.txt', date('Y-m-d H:i:s') . " - " . $output . PHP_EOL, FILE_APPEND);

echo "Deployment finished.";