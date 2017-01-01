<?php
header("Content-type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$debug = false;

require_once("antidupe.php");

$foxes = array();

function fetchFoxes($dirxxx)
{
    global $foxes;
    if ($handle = opendir($dirxxx)) 
    {
        while (false !== ($entry = readdir($handle))) 
        {
            if(($entry) != "." && ($entry) != ".." && (!fileUsed($entry)) )
            {
                $foxes[count($foxes)] = $entry;
            }
        }
        closedir($handle);
    }
}

function randomFox($dirToFetch, $fieldName)
{
    global $foxes, $debug;
    initSQL($dirToFetch);
    //echo totalFiles()."\n\n";    
    $foxes = array();
    fetchFoxes('./'.$dirToFetch.'/');
    
    if($debug) echo count($foxes);

    if(count($foxes)==0)
    {
        $foxes = array();
        clearDB();
        fetchFoxes('./'.$dirToFetch.'/');
        //echo "->".count($foxes);
    }

    $fox = $foxes[rand(0, count($foxes)-1)];
    addUsed($fox);

    if($debug) echo "\nadded: ".totalFiles()."\n";

    echo "{\"file\": \"http://wohlsoft.ru/images/foxybot/".$dirToFetch."/" . $fox . "\" }";
}


