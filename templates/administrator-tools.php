<?php

function previousMonth() {
    global $year, $month;
    $newYear  = $year;
    $newMonth = $month;
    if ($month == 1) {
        $newYear--;
        $newMonth = 12;
    }
    else
        $newMonth--;
    return "administrator.php?year=$newYear&month=$newMonth";
}

function nextMonth() {
    global $year, $month;
    $newYear  = $year;
    $newMonth = $month;
    echo "PREVIOUS YEAR: $newYear";
    if ($month == 12) {
        $newYear++;
        $newMonth = 1;
    }
    else
        $newMonth++;
    echo "NEW YEAR: $newYear";
    return "administrator.php?year=$newYear&month=$newMonth";
}

?>

<div class="administrator-tools-container">
    <div style="width: 1000px; margin: auto;">
        <ul class="administrator-tools">
            <li><a href="<?php echo previousMonth(); ?>">&larr;</a></li>
            <li><a href="<?php echo nextMonth(); ?>">&rarr;</a></li>
            <li><a id="mode-trigger" href="#">Breakfast</a></li>
            <li><a id="print-button" href="#">Print</a></li>
            <li><a id="email-button" href="#">E-mail</a></li>
            <li><a href="#">Log out</a></li>
        </ul>
    </div>
</div>