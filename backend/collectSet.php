<?php
// Public backend bridge file.
// Keeps legacy includes working by forwarding to private server backend setup.

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

if (!$bootstrapLoaded) {
	http_response_code(500);
	die('Missing private backend bootstrap file.');
}
