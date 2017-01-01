<?

//error_reporting(-1);
//ini_set('display_errors', 'On');

$mydb = NULL;

function initSQL($dbName)
{
    global $mydb;
    // Create (connect to) SQLite database in file
    $mydb = new PDO('sqlite:'.$dbName.'.sqlite3');
    // Set errormode to exceptions
    $mydb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Create table messages
    $mydb->exec("CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY, filename TEXT);");
}

function clearDB()
{
    global $mydb;
    $mydb->exec("DELETE FROM files;");
}

function totalFiles()
{
    global $mydb;
    $result = $mydb->query('SELECT count(*) FROM files;');
    return $result->fetchColumn();
}

function fileUsed($fileName)
{
    global $mydb;
    $insert = "SELECT count(*) FROM files WHERE filename=:filename;";
    $stmt = $mydb->prepare($insert);
    $stmt->bindValue(':filename', $fileName, SQLITE3_TEXT);
    $stmt->execute();
    $clmn = $stmt->fetchColumn();
    return ($clmn>0);
}

function addUsed($fileName)
{
    global $mydb;
    $insert = "INSERT INTO files (filename) VALUES (:filename)";
    $stmt = $mydb->prepare($insert);
    $stmt->bindValue(':filename', $fileName, SQLITE3_TEXT);
    $stmt->execute();
}


