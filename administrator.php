<?php
    $LOGIN_REQUIRED = true;
    require_once('functions/session.php');
    $theme = isset($_SESSION['theme']) ? $_SESSION['theme'] : 'red-and-black';
?>
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Menu editor</title>
    <link href="styles/calendar.css" type="text/css" rel="stylesheet" />
    <link href="styles/menu-editor.css" type="text/css" rel="stylesheet" />
    <link href="styles/administrator-tools.css" type="text/css" rel="stylesheet" />
    <link href="styles/<?php echo $theme; ?>/calendar.css" type="text/css" rel="stylesheet" />
    <link href="styles/<?php echo $theme; ?>/menu-editor.css" type="text/css" rel="stylesheet" />
    <link href="styles/<?php echo $theme; ?>/administrator-tools.css" type="text/css" rel="stylesheet" />
    <link href="http://fonts.googleapis.com/css?family=Open+Sans:400,600" rel="stylesheet" type="text/css" />
    <link rel="icon" type="image/png" href="images/favicon.png" />
    <script type="text/javascript" src="scripts/mootools.js"></script>
    <script type="text/javascript" src="scripts/calendar.js"></script>
    <script type="text/javascript" src="scripts/menu-editor.js"></script>
    <script type="text/javascript" src="scripts/administrator-tools.js"></script>
</head>
<body>
    <?php
        $administrator = true;
        require_once('templates/calendar.php');
        require_once('templates/administrator-tools.php');
        require_once('templates/menu-editor.php');
    ?>
</body>
</html>