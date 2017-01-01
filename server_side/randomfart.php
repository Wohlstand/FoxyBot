<?php
require_once("rand_dir.php");

$dirToFetch = "farts";
$fieldName  = "fart";
randomFox($dirToFetch, $fieldName);

/*
initSQL($dirToFetch);

$foxes = array();

function fetchFoxes($dirxxx)
{
    global $foxes;
    if ($handle = opendir($dirxxx)) 
    {
        while (false !== ($entry = readdir($handle))) 
        {
            if ($entry != "." && $entry != ".." && !fileUsed($entry))
            {
                $foxes[count($foxes)] = $entry;
            }
        }
        closedir($handle);
    }
}

fetchFoxes('./'.$dirToFetch.'/');
if(count($foxes))
{
    clearDB();
    fetchFoxes('./'.$dirToFetch.'/');
}
$fox = $foxes[rand(0, count($foxes)-1)];
addUsed($fox);

echo "{\"".$fieldName."\": \"http://wohlsoft.ru/images/foxybot/".$dirToFetch."/" . $foxes[rand(0, count($foxes)-1)] . "\" }";

*/

