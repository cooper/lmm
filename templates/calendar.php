<?php

require_once(__DIR__.'/../functions/date-input.php');

function draw_calendar ($month, $year) {
    global $month, $year;

	$running_day       = date('w', mktime(0, 0, 0, $month, 1, $year));
	$days_in_month     = date('t', mktime(0, 0, 0, $month, 1, $year));
	$days_in_this_week = 1;
    $m_f_in_this_week  = 1;
    $weeks_in_month    = 0;
    $cell_id           = 1;
    $calendar          = '';

	/* row for week one */

    // if the month starts on a Saturday,
    // just skip the entire first week
    $skip_first_week = false;
    if ($running_day == 6)
        $skip_first_week = true;

    // otherwise, start the first week
    else
        $calendar .= '<tr>';

    // if the month does not start on a Saturday (!$skip_first_week),
    // add and possible blank days at the beginning of the calendar.
    // these are days from the previous month.
    if (!$skip_first_week) for ($x = 0; $x < $running_day; $x++) {

        // if it's not Sunday or Saturday, add the cell.
        if ($x != 0 && $x != 6) {
            $calendar.= '<td data-cell="'. $cell_id++ .'"></td>';
            $m_f_in_this_week++;
        }

		$days_in_this_week++;
    }

    // start at the first, and move through the whole month.
    $month_over = false;
	for ($list_day = 1; $list_day <= $days_in_month; $list_day++) {

        // if it is Monday through Friday, add a cell.
        if ($running_day != 0 && $running_day != 6) {

            // is this the current day?
            $is_today = "$year-$month-$list_day" == date('Y-n-j');
            $today_html = $is_today ? ' today' : '';

            // add the cell for the day.
            $calendar.= '<td data-cell="'        . $cell_id++   .
                          '" data-year="'        . $year        .
                          '" data-month="'       . $month       .
                          '" data-day="'         . $list_day    .
                          '" data-running-day="' . $running_day .
                          '" class="edit-button' . $today_html  . '">';
            $calendar .=      '<span class="day-number">'.$list_day.'</span>';
            $calendar .=      '<span class="menu-items"></span>';
            $calendar .= '</td>';

            $m_f_in_this_week++;
        }

        // this is Saturday, the end of the week.
		if ($running_day == 6) {

            // if we're skipping the first week,
            // do so, and unset the skipper
            if ($skip_first_week) {
                $skip_first_week = false;
            }

            // otherwise, close the week row
            // and increase the week count
            else {
                $calendar.= '</tr>';
                $weeks_in_month++;
            }

            // this is the last day of the month
            if ($list_day >= $days_in_month)
                $month_over = true; // force end of month

            // this is not the last day of the month.
            // start a new week row if there are at least two more days
            // in the month (Sunday, Monday)
            elseif ($days_in_month - $list_day >= 2)
                $calendar.= '<tr>';

            // start the week over
			$running_day = -1;
			$days_in_this_week = 0;
            $m_f_in_this_week  = 0;

        }

		$days_in_this_week++;
        $running_day++;

        // this is the end of the month.
        if ($month_over)
            break;

    }

    // for whatever is left of the five weeks...
    while ($weeks_in_month < 5) {

        // for the current day of the week until Saturday...
        while ($running_day < 6) {

            // add empty cells for any M-F.
            if ($running_day != 0 && $running_day != 6)
                $calendar .= '<td data-cell="'. $cell_id++ .'"></td>';

            $running_day++;
        }

        // finish the week
        $calendar.= '</tr>';
        $weeks_in_month++;

    }

    return $calendar;
}

$mode = isset($_GET['mode']) && $_GET['mode'] == 'breakfast' ?
    'breakfast' : 'lunch';
$consistent = isset($_GET['ref']) && $_GET['ref'] == 'week';

?>

<table class="lunch-calendar mode-<?php echo $mode; if (isset($administrator)) echo ' administrator'; ?>" data-year="<?= $year ?>" data-month="<?= $month ?>">
    <caption>
        <span class="right" id="caption-mode"><?= ucfirst($mode) ?> menu</span>
        <span class="left" id="caption-left"></span>
        <?= "$monthName $year" ?>
    </caption>
    <thead>
        <tr<?php if ($consistent) echo ' class="consistent"' ?>>
            <td>Monday</td>
            <td>Tuesday</td>
            <td>Wednesday</td>
            <td>Thursday</td>
            <td>Friday</td>
        </tr>
    </thead>
    <tbody>
        <?= draw_calendar($month, $year) ?>
    </tbody>
</table>
<?php
    if (!isset($administrator) && !isset($pdf))
        require(__DIR__.'/footer-navigation.php');
?>
<div id="menu-notes">
</div>
