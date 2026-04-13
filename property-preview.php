<?php
/**
 * property-preview.php  —  upload to public_html/
 *
 * Social media link preview for individual property pages.
 * Bots (Discord, iMessage, Slack, Twitter/X…) read the OG tags.
 * Real browsers are instantly redirected to the React SPA.
 *
 * Share URL: https://huskyrentlens.cs.mtu.edu/property-preview.php?id=5
 */

$propertyId = isset($_GET['id']) ? intval($_GET['id']) : 0;
$siteUrl    = 'https://huskyrentlens.cs.mtu.edu';

// Defaults — shown when no id is given or the fetch fails
$title       = 'HuskyRentLens | Student Housing Near MTU';
$description = 'Find the best student apartments near Michigan Technological University. Real reviews from Huskies, compare housing with confidence.';
$image       = "$siteUrl/logo.png";
$pageUrl     = $propertyId ? "$siteUrl/properties/$propertyId" : $siteUrl;

if ($propertyId > 0) {
    $apiUrl = "$siteUrl/backend/fetchPropertyById.php?id=$propertyId";
    $ctx    = stream_context_create(['http' => ['timeout' => 5]]);
    $json   = @file_get_contents($apiUrl, false, $ctx);

    if ($json !== false) {
        $data = json_decode($json, true);

        if (($data['status'] ?? '') === 'success') {
            $prop    = $data['data']['property'] ?? [];
            $images  = $data['data']['images']   ?? [];
            $rentals = $data['data']['rentals']  ?? [];

            $name    = htmlspecialchars($prop['name']        ?? '',  ENT_QUOTES);
            $address = htmlspecialchars($prop['address']     ?? '',  ENT_QUOTES);
            $desc    = htmlspecialchars($prop['description'] ?? '',  ENT_QUOTES);
            $price   = htmlspecialchars($rentals[0]['cost']  ?? '',  ENT_QUOTES);
            $imgPath = $images[0]['imageUrl'] ?? null;

            if ($name) {
                $title = "$name | HuskyRentLens";
            }

            $parts = array_filter([$address, $price ? "From \$$price/mo" : '', $desc]);
            $description = mb_strimwidth(implode(' · ', $parts), 0, 200, '…');

            if ($imgPath) {
                $image = "$siteUrl/backend/" . htmlspecialchars($imgPath, ENT_QUOTES);
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title><?= $title ?></title>

  <!-- Open Graph (Discord, iMessage, Slack, LinkedIn, Facebook) -->
  <meta property="og:type"         content="website" />
  <meta property="og:url"          content="<?= $pageUrl ?>" />
  <meta property="og:site_name"    content="HuskyRentLens" />
  <meta property="og:title"        content="<?= $title ?>" />
  <meta property="og:description"  content="<?= $description ?>" />
  <meta property="og:image"        content="<?= $image ?>" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter / X -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="<?= $title ?>" />
  <meta name="twitter:description" content="<?= $description ?>" />
  <meta name="twitter:image"       content="<?= $image ?>" />

  <!-- Redirect real browsers straight to the React SPA -->
  <meta http-equiv="refresh" content="0;url=<?= $pageUrl ?>" />
  <script>window.location.replace("<?= $pageUrl ?>");</script>
</head>
<body>
  <p>Redirecting… <a href="<?= $pageUrl ?>">Click here if not redirected</a></p>
</body>
</html>
