<?php $link = mysql_connect('localhost', 'root', 'darmEa6d'); if (!$link) {
die('Could not connect: ' . mysql_error()); } echo 'Connected successfully'; mysql_close($link); ?>
