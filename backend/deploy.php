<?php
// 1. Log the attempt immediately
file_put_contents('deploy_log.txt', date('Y-m-d H:i:s') . " - Webhook Received\n", FILE_APPEND);

// 2. Get the GitHub payload
$content = file_get_contents("php://input");
$payload = json_decode($content, true);

// 3. Keep your branch safety gate
if (($payload['ref'] ?? '') !== 'refs/heads/main') {
    file_put_contents('deploy_log.txt', "Skipped: Push was not to main branch.\n--–\n", FILE_APPEND);
    die("Not main branch.");
}

// 4. THE MAGIC SETTINGS (From your terminal test)
$git = "/usr/local/cpanel/3rdparty/lib/path-bin/git";
$path = "/itss/home/huskyrentlens/public_html";

// 5. Provide the SSH environment context
putenv("HOME=/home/huskyrentlens");

// 6. Execute the pull
// We use the exact command that worked in your terminal
$cmd = "$git -C $path pull origin main 2>&1";
$output = shell_exec($cmd);

// 7. Log the final output
file_put_contents('deploy_log.txt', "COMMAND: $cmd\nOUTPUT: $output\n---\n", FILE_APPEND);

echo "Deployment complete. Check deploy_log.txt";
