<?php

/**
 * This file contains several functions that are used to create command line tools
 * related to the experiment. One example of such tool is a script to export HR
 * data or to load CSV files.
 */

// Include all backend functions because we need a few of them
require_once(dirname(__FILE__) . '/functions.php');

function runAndExitIfFailed($theCmd, $theLogPath) {
    $aOutput = array();
    $aReturn = -1;
    exec($theCmd . ' 2>&1', $aOutput, $aReturn);

    if($aReturn != 0) {
        echo 'Command failed (returned '.$aReturn.'): ' . $theCmd . "\n";
        exit(5);
    }

    file_put_contents($theLogPath, implode("\n", $aOutput));
}

function getHRCSVFilePath($theSubjectFolderPath) {
    $aPath = null;
    $aFiles = glob($theSubjectFolderPath . 'Treadmill_*.csv');

    if(count($aFiles) == 1) {
        $aPath = $aFiles[0];
    }

    return $aPath;
}

function findSubjectFolders($theDataDirPath) {
    $aDirs = glob($theDataDirPath . '*', GLOB_ONLYDIR);
    return $aDirs;
}

function subjectHasHRData($thePDO, $theSubjectId) {
    // TODO: implement this function by calling getSubjectData($thePDO, $theSubjectId);
    return false;
}

function assertRunningAsCmdScript($theExitError = 10) {
    if (php_sapi_name() != 'cli') {
        echo 'This script should be run from the command line.';
        exit($theExitError);
    }
}

?>
