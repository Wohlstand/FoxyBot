<?php
require_once("rand_dir.php");

if(!isset($_GET["which"]))
{
    die('{"error" : "invalid argument"}');
}

$wanted = explode(",", $_GET["which"]);

if(empty($wanted) || (count($wanted) == 1 && $wanted[0] == ""))
    die('{"error" : "empty request"}');

$g_raw = file_get_contents(dirname(__FILE__) . "/galleries.json");

$g = json_decode($g_raw, true);

if(empty($g))
    die('{"error" : "Server errir: invalid gallery list"}');

foreach($wanted as $f)
{
    if(!in_array($f, $g["galleries"], true))
        die('{"error" : "wrong gallery"}');
}

randomFoxArr($wanted);

