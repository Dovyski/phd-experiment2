<?php

/**
 * This script will add HR entries of several subjects to the database. It reads data from a folder
 * and then invokes hr2db.php to parse each CSV file (generated by the TomTom watch) and insert those
 * values in the database as HR entries.
 */

require_once(dirname(__FILE__) . '/config.php');
require_once(dirname(__FILE__) . '/inc/cmd-functions.php');

assertRunningAsCmdScript();

$aOptions = array(
    "data-dir:",
    "test",
    "help"
);

$aArgs = getopt("h", $aOptions);

if(isset($aArgs['h']) || isset($aArgs['help']) || $argc == 1) {
     echo "Usage: \n";
     echo " php ".basename($_SERVER['PHP_SELF']) . " [options]\n\n";
     echo "Options:\n";
     echo " --data-dir=<path>    Path to the folder containing subjects raw data.\n";
     echo "                      Each subject must have its own folder within the\n";
     echo "                      data directory and the folder name must be equal to\n";
     echo "                      the subjects id. E.g. Assuming data dir is /data/,\n";
     echo "                      the script will process dirs /data/400/ as subject 400,\n";
     echo "                      /data/401/ as subject 401, and so on.\n";
     echo " --test               Run in test mode. If present, the script will analyze\n";
     echo "                      the data dir and output the commands to required to insert\n";
     echo "                      the HR data, however nothing is actually inserted.\n";
     echo " --help, -h           Show this help.\n";
     echo "\n";
     exit(1);
}

$aPathToInsertScript = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'hr2db.php';
$aDataFolder = isset($aArgs['data-dir']) ? $aArgs['data-dir'] : '';
$aTestMode = isset($aArgs['test']);

if(empty($aDataFolder)) {
  echo 'Empty or invalid data dir provided: ' . $aDataFolder . "\n";
  exit(2);
}

$aDataFolder .= @$aDataFolder[strlen($aDataFolder) - 1] != DIRECTORY_SEPARATOR ? DIRECTORY_SEPARATOR : '';

if(!file_exists($aDataFolder)) {
    echo 'Unable to access data dir: ' . $aDataFolder . "\n";
    exit(3);
}

// Get ready to use the database
$aDb = new PDO('sqlite:' . DB_FILE);
$aDb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$aCmds = array();
$aSubjectDirectories = findSubjectFolders($aDataFolder);

if(count($aSubjectDirectories) == 0) {
    echo 'No directories found within the data dir ('.$aDataFolder.'). Did you use a valid --data-dir?' . "\n";
    exit(4);
}

echo 'Analyzing data dir "' . $aDataFolder .'"' . "\n";

foreach($aSubjectDirectories as $aSubjectDir) {
    $aSubjectId = trim(basename($aSubjectDir));
    $aSubjectDir .= DIRECTORY_SEPARATOR;

    echo ' subject ' . $aSubjectId . ': ';

    $aCSVFilePath = getHRCSVFilePath($aSubjectDir);

    if(empty($aCSVFilePath) || !file_exists($aCSVFilePath)) {
        echo 'No CSV file or multiple CSV files found in directory "' . $aSubjectDir . '".' . "\n";
        exit(5);
    }

    $aSubjectData = getSubjectData($aDb, $aSubjectId);

    if(!isset($aSubjectData['games']) || count($aSubjectData['games']) == 0) {
        echo 'Subject has no data in the database. Is "'.$aSubjectId.'" a valid subject id?' . "\n";
        exit(6);
    }

    if(subjectHasHRData($aSubjectData)) {
        echo 'IGNORED (already has HR data)' . "\n";
    } else {
        $aImportCmd = 'php "'.$aPathToInsertScript.'" ' . $aSubjectId . ' "' . $aCSVFilePath. '"';
        $aCmds[$aSubjectId] = array('dir' => $aSubjectDir, 'cmd' => $aImportCmd);
        echo 'OK' . "\n";
    }
}

echo "\n";

if(count($aCmds) > 0) {
    echo 'Adding HR data' . "\n";

    foreach($aCmds as $aSubjectId => $aInfo) {
        $aSubjectDir = $aInfo['dir'];
        $aSubjectCmd = $aInfo['cmd'];

        $aLogPath = $aSubjectDir . $aSubjectId . '-hr2db.log';

        echo ' subject ' . $aSubjectId . ': ';

        if($aTestMode) {
            echo $aSubjectCmd . "\n";
        } else {
            // TODO: call runAndExitIfFailed($aSubjectCmd, $aLogPath);
            echo 'DONE' . "\n";
        }
    }

    echo "\n";

    if($aTestMode) {
        echo 'This is a test (param --test was supplied). Nothing was actually ran/inserted.' . "\n";
    } else {
        echo 'HR data inserted successfully!' . "\n";
    }

} else {
    echo 'Warning: all subjects analyzed have HR data already. There is nothing to insert here.' . "\n";
    exit(7);
}

?>
