<?php
// 1. Get and decode the GitHub payload
// testing update, 10:17
$content = file_get_contents("php://input");
$payload = json_decode($content, true);

// 2. Only proceed if the push was to the 'main' branch
// Use null coalescing ?? to prevent errors if the payload is empty
if (($payload['ref'] ?? '') !== 'refs/heads/main') {
    die("Not the main branch or empty payload. Skipping deployment.");
}

// 3. Define the path (Added the missing leading slash)
$path = "/home/huskyrentlens/public_html";

// 4. Set the HOME environment variable so Git can find your SSH keys
putenv("HOME=/home/huskyrentlens");

// 5. Run the Force Update command
// This fetches the latest and forces the local files to match exactly
$cmd = "cd $path && git fetch origin main 2>&1 && git reset --hard origin/main 2>&1";
$output = shell_exec($cmd);

// 6. Log results
file_put_contents('deploy_log.txt', date('Y-m-d H:i:s') . " - COMMAND: $cmd \nOUTPUT: $output" . PHP_EOL, FILE_APPEND);

echo "Deployment finished.";
