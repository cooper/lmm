<?php

require_once('functions/date-input.php');
$theme = isset($_SESSION['theme']) ? $_SESSION['theme'] : 'crimson';
$pdf = isset($_GET['pdf']) ? true : null;

?>
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title><?= "$monthName $year" ?> menu</title>
    <link href="styles/calendar.css" type="text/css" rel="stylesheet" />
    <link href="styles/<?= $theme ?>/calendar.css" type="text/css" rel="stylesheet" />
    <link href="http://fonts.googleapis.com/css?family=Open+Sans:400,600" rel="stylesheet" type="text/css" />
    <link rel="icon" type="image/png" href="images/favicon.png" />
    <script type="text/javascript" src="scripts/vendored/mootools.min.js"></script>
    <script type="text/javascript" src="scripts/calendar.js"></script>
</head>
<body>
    <?php
        require_once('templates/calendar.php');
    ?>
</body>
</html>
