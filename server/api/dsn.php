<?php
	$formatType = 'application/json';
	$execString = "python ../python/dsnhandler.py";
	$output = exec($execString);
	
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: {$formatType}");
	echo "{$output}";
?>
