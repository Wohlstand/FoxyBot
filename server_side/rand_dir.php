<?php
header("Content-type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$debug = false;

function fetchFoxesNoDb($dirxxx)
{
    $foxes = array();
    if ($handle = opendir($dirxxx))
    {
        while(false !== ($entry = readdir($handle)))
        {
            if($entry != "." && $entry != "..")
                array_push($foxes, $entry);
        }
        closedir($handle);
    }
    return $foxes;
}

function randomFoxArr($dirs)
{
    global $debug;

    $foxes = array();

    foreach($dirs as $dd)
    {
        $ds = fetchFoxesNoDb('./' . $dd . '/');
        foreach($ds as $de)
            array_push($foxes, $dd . "/" . $de);
    }

    $subfox = $foxes[random_int(0, count($foxes) - 1)];

    $reply["file"] = "http://wohlsoft.ru/images/foxybot/" . $subfox . "";

    echo json_encode($reply);
}

