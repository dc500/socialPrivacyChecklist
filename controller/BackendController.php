﻿<?php
include_once 'model/Includer.php';
$includer = new Includer();
$includer->includeShit();
    $db = DbConnector::getInstance()->connect();


//---------------------------- ARTICLES --------------------------------
function newCat($db){
    $cat = $_GET['cat'];
    echo $newCatSql = "INSERT INTO `categorys`(`name`,`position`) VALUES ('".$cat."',0)";
    $db->query($newCatSql);

}

function getCats($db){
   $getCatsSql = "SELECT * FROM `categorys` Order By `position`";
    $result = $db->query($getCatsSql);
    $n = 0;
    $list = "<option></option>";
    while ($row = $result->fetch_object()){
        $list .= "<option id='cat".$n."'>".$row->name."</option>";
        $n++;
    }
    echo $list;
}

function getArticles($db){
    include_once "model/Article.php";
    $article = new Article();
    echo $getArticlesSql = "SELECT * FROM article LEFT JOIN article_cat USING(articleId) LEFT JOIN categorys USING(categoryId) WHERE categorys.name = '".$_GET['cat']."'";

}

//--------------------- FBTYPES -----------------------------------------
function getFbTypes($db){
    $fbtype = new FbType();
    $getFbTypesSql = "SELECT `fbtypeId` FROM `fbtype` ORDER BY `pos`";
    $result = $db->query($getFbTypesSql);
    $typesHtml = "";
    $controlsHtml = "";
    while ($row = $result->fetch_object()){
        $type = new FbType($row->fbtypeId);
        $typesHtml .= $type->getTypesHtml("backend");
        $controlsHtml .= $type->getControlsHtml();
    }
    echo json_encode(array("typesHtml" => $typesHtml,"controls" => $controlsHtml));
}

function addFbType($db){
    $newType = new FbType();
    //set attributes
        $newType->setValue("name", htmlspecialchars($_GET['name']));
        $newType->setValue("pos",$_GET['pos']);
        $newType->setValue("description", str_replace("\r","<br />", str_replace("\n","<br />",$_GET['desc'])));
        $newType->setValue("iconPath",$_GET['icon']);
    $newType->save();
}

function getTypeInfo($db){
    $pos = $_GET['pos'];
    $options = "<option></option>";
    $infos = array();

    $getTypeInfosSql = "SELECT * FROM `fbtype` WHERE `pos`=".$pos;
    $resultInfos = $db->query($getTypeInfosSql);
    $row = $resultInfos->fetch_object();
        $infos['id'] = $row->fbtypeId;
        $infos['name'] = $row->name;
        $infos['description'] = $row->description;
        $infos['pos'] = $row->pos;
        $infos['icon'] = $row->iconPath;
        $infos['checklistId'] = $row->checklistId;

    $getChecklistsSql = "SELECT * FROM `checklist` WHERE 1";
    $resultChecklist = $db->query($getChecklistsSql);
    while($row = $resultChecklist->fetch_object()){
        if($row->checklistId != $infos['checklistId']){
            $options .= "<option value=".$row->checklistId.">".$row->name."</option>";
        }else{
            $options .= "<option selected value=".$row->checklistId.">".$row->name."</option>";
        }
    }

    echo json_encode(array("infos"=>$infos,"checklists"=>array("options"=>$options)));
}

function changeFbTypePosition($db){
        // set positions
    $targetPos = $_GET['values']['currentPos'];
    switch($_GET['values']['operation']){
        case 'lower':
            $neighbourPos = $_GET['values']['currentPos']-1;
            $neighbourSql = "SELECT `fbtypeId` FROM `fbType` WHERE `pos` = ".$neighbourPos;
            break;
        case 'higher':
            $neighbourPos = $_GET['values']['currentPos']+1;
            break;
    }
        //get Id from target and the neighbour element
    $targetSql = "SELECT `fbtypeId` FROM `fbtype` WHERE `pos` = ".$targetPos;
    $neighbourSql = "SELECT `fbtypeId` FROM `fbtype` WHERE `pos` = ".$neighbourPos;

    $tagetId = $db->query($targetSql)->fetch_object()->fbtypeId;
    $neighbourId = $db->query($neighbourSql)->fetch_object()->fbtypeId;

        //change Position
    $target = new FbType($tagetId);
    $neighbour = new FbType($neighbourId);

    $target->setValue("pos", $neighbourPos);
    $neighbour->setValue("pos", $targetPos);

    $target->save();
    $neighbour->save();
}

function saveFbTypeChange(){
    $changedType = new FbType($_GET['values']['fbTypeId']);
        $changedType->setValue("name", $_GET['values']['name']);
        $changedType->setValue("description", $_GET['values']['desc']);
        $changedType->setValue("checklistId", $_GET['values']['checklist']);
    $changedType->save();
}

function delFbType($db){
    $pos = $_GET['pos'];
    $count = $db->query("SELECT count(fbtypeId) AS count FROM `fbtype` WHERE 1")->fetch_object()->count;
    $db->query("DELETE FROM `fbtype` WHERE `pos` = ".$pos);
    for($i = $pos; $i < $count; $i++){
        $db->query("UPDATE `fbtype` SET `pos` = ".($i)." WHERE `pos` = ".($i+1));
    }
}

//--------------------------- CHECKLIST ----------------------------------
function getChecklists($db){
    $checklists = "";
    $getChecklistsSql = "SELECT * FROM `checklist` ORDER BY `checklistId`";
    $checklistIds = $db->query($getChecklistsSql);
    while($row = $checklistIds->fetch_object()){
        $checklists .= '<button class="blueButton"><span class="nameChecklist">'.$row->name.'</span><span class="idHolder" style="display: none;">'.$row->checklistId.'</span></button>';
    }
    echo $checklists;
}

function newChecklist(){
    $checklist = new Checklist();
    $checklist->setValue("name",$_GET['values']['name']);
    $checklist->save();
}

function getChecklistPoints($db){
    $checklistPointsSql = "SELECT `checklistPointId` FROM `checklist_checklistpoints` WHERE `checklistId` = ".$_GET['values']['checklistId']." ORDER BY `position`";
    $checklistPointIds = $db->query($checklistPointsSql);
    $checkpointsHtml = "";
    while($row = $checklistPointIds->fetch_object()){
        $point = new ChecklistPoint($row->checklistPointId);
        $checkpointsHtml .= $point->returnAsHtmlBack();
    }
    echo $checkpointsHtml;
}

function getChecklistPointEdit($db){
    $getChecklistPointSql = "SELECT * FROM `checklistpoints` WHERE `checklistPointId` = ".$_GET['values']['checklistPointId'];
    echo json_encode($db->query($getChecklistPointSql)->fetch_object());
}

/**
 * takes $_GET['values']['current'] + checklistId  (or/and)  $_GET['values']['all']
 *
 * @param object $db
 * @return echoJson all screenshots/ current screenshots
 */
function getScreenshotsChecklistPointAll($db){
    $screenshotsHtmlAll = '';
    $screenshotsHtmlCurrent = array();
    $response = array();
        //all screenshots (for selection)
    if($_GET['values']['all'] == true){
        $allScreenshotsSql = "SELECT `screenshotId` FROM `screenshots` WHERE 1 ORDER BY `screenshotId`";
        $screenshotsAll = $db->query($allScreenshotsSql);
        while($row = $screenshotsAll->fetch_object()){
            $screenshot = new Screenshot($row->screenshotId);
            $screenshotsHtmlAll .= $screenshot->returnThrumnailsAsHtmlBack();
        }
        $response['all'] = $screenshotsHtmlAll;
    }else{
        $response['all'] = NULL;
    }
        //current screenshots
    if($_GET['values']['current'] = true && isset($_GET['values']['checklistPointId'])){
       $currentScreenshotsSql = "SELECT `screenshotId` FROM `screenshots` LEFT JOIN `checklistpoint_screenshot` USING(`screenshotId`) WHERE `checklistPointId` = ".$_GET['values']['checklistPointId']." ORDER BY `position`";
        $screenshotsCurrent = $db->query($currentScreenshotsSql);
        $j = 0;
        $response['current'] = array();
        while($row = $screenshotsCurrent->fetch_object()){
            $screenshot = new Screenshot($row->screenshotId);
            $response['current'][$j] = $screenshot->returnThrumnailsAsHtmlBack();
            $j++;
        }
    }else{
        $response['current'] = NULL;
    }
    echo json_encode($response);
}

function removeScreenshotFromCheckpoint($db){
    $total = $db->query("SELECT COUNT(`position`) AS total FROM `checklistpoint_screenshot` WHERE `checklistPointId` = ".$_GET['checklistPointId'])->fetch_object()->total;
    $pos = $_GET['position'];
    echo $total.'  '.$pos;
    $db->query('DELETE FROM `checklistpoint_screenshot` WHERE `position` = '.$pos.' AND `checklistPointId` = '.$_GET['checklistPointId']);
    echo 'DELETE FROM `checklistpoint_screenshot` WHERE `position` = '.$pos.' AND `checklistPointId` = '.$_GET['checklistPointId'];
    for($i = ($pos+1); $i <= $total; $i++){
        echo 'UPDATE `checklistpoint_screenshot` SET `position` = '.($i-1).' WHERE `position` = '.$i.' AND `checklistPointId` = '.$_GET['checklistPointId'];
        $db->query('UPDATE `checklistpoint_screenshot` SET `position` = '.($i-1).' WHERE `position` = '.$i.' AND `checklistPointId` = '.$_GET['checklistPointId']);
    }
}

function changeScreenshotOrder($db){
    switch($_GET['mode']){
        case 'back':            //right
            $swapId = $db->query("SELECT `screenshotId` FROM `checklistpoint_screenshot` WHERE `checklistPointId` = ".$_GET['checklistPointId']." AND `position` = ".$_GET['position'])->fetch_object()->screenshotId;
            $db->query("UPDATE `checklistpoint_screenshot` SET `position` = ".($_GET['position'])." WHERE `checklistPointId` = ".$_GET['checklistPointId']." AND `position` = ".($_GET['position']+1));
            $db->query("UPDATE `checklistpoint_screenshot` SET `position` = ".($_GET['position']+1)." WHERE `checklistPointId` = ".$_GET['checklistPointId']." AND `screenshotId` = ".$swapId);
            break;
        case 'for':            //left
            if(($_GET['position']-1) > 0){
                $swapId = $db->query("SELECT `screenshotId` FROM `checklistpoint_screenshot` WHERE `checklistPointId` = ".$_GET['checklistPointId']." AND `position` = ".$_GET['position'])->fetch_object()->screenshotId;
                $db->query("UPDATE `checklistpoint_screenshot` SET `position` = ".($_GET['position'])." WHERE `checklistPointId` = ".$_GET['checklistPointId']." AND `position` = ".($_GET['position']-1));
                $db->query("UPDATE `checklistpoint_screenshot` SET `position` = ".($_GET['position']-1)." WHERE `checklistPointId` = ".$_GET['checklistPointId']." AND `screenshotId` = ".$swapId);
            }
            break;
    }
}

function getScreenshotsPath($db){
    $pathsDb = $db->query("SELECT `screenshotId`,`name`,`description` FROM `screenshots` WHERE 1");
    while($row = $pathsDb->fetch_object()){
        $paths[$row->screenshotId]["name"] = $row->name;
        $paths[$row->screenshotId]["desc"] = $row->description;
    }
    echo json_encode($paths);
}

function getExistingChecklistPoints($db){
    $html = "";
    $allPoints = $db->query("SELECT * FROM `checklistpoints` AS c LEFT JOIN `checklist_checklistpoints` AS cc USING(checklistPointId) LEFT JOIN `checklist` USING (checklistId) WHERE cc.checklistId IS NOT NULL ORDER BY cc.checklistId, cc.position");
    $curr;
    while($row = $allPoints->fetch_object()){
        if($curr != $row->checklistId){
          $html .= '<div class="checklistName"><span>'.$row->name.'</span></div>';
          $curr = $row->checklistId;
        }
        $html .= '<div class="allPointsRow"> <div class="allPointsCol1"><input type="checkbox" name="selectedChecklistPoints" value="'.$row->checklistPointId.'"/></div ><div class="allPointsCol2">'.$row->heading.'</div> <div class="allPointsCol3">'.$row->text.'</div> </div>';
    }
    echo $html;
}

function importChecklistPoints($db){
    $ids = $_GET['ids'];
    $pos = $db->query("SELECT COUNT(`position`) AS highPos FROM `checklist_checklistpoints` WHERE `checklistId` = ".$_GET['checklistId'])->fetch_object()->highPos;
    $pos;
    foreach($ids as $id){
        //echo "INSERT INTO `checklist_checklistpoints`(`checklistId`, `checklistPointId`, `position`, `hits`) VALUES (".$_GET['checklistId'].",'".$id."',".$pos.",0)<br />";
        $db->query("INSERT INTO `checklist_checklistpoints`(`checklistId`, `checklistPointId`, `position`, `hits`) VALUES (".$_GET['checklistId'].",".$id.",".$pos.",0)");
        $pos++;
    }
}

function copyChecklistPoints($db){
    $ids = $_GET['ids'];
    $pos = $db->query("SELECT COUNT(`position`) AS highPos FROM `checklist_checklistpoints` WHERE `checklistId` = ".$_GET['checklistId'])->fetch_object()->highPos;
    $pos;
    $nextId = $db->query("SELECT MAX(`checklistPointId`) AS max FROM `checklistpoints`")->fetch_object()->max + 1;
    foreach($ids as $id){
        $copy = $db->query("SELECT * FROM checklistpoints WHERE `checklistPointId` = ".$id)->fetch_object();
        $db->query("INSERT INTO `checklistpoints` (`checklistPointId`,`text`,`heading`) VALUES (".$nextId.",'".$copy->text."','".$copy->heading."')");
        $db->query("INSERT INTO `checklist_checklistpoints`(`checklistId`, `checklistPointId`, `position`, `hits`) VALUES (".$_GET['checklistId'].",".$nextId.",".$pos.",0)");
        $pos++; $nextId++;
    }
}

function addNewChecklistPoint($db){
        //update ChecklistPoint
    if(isset($_POST['values']['checklistPointId'])){
        $id = str_replace("&iuml;", "", str_replace("&raquo;","",str_replace("&iquest;","",htmlentities($_POST['values']['checklistPointId']))));
        $highPos = ($db->query("SELECT COUNT('checklistPointId') AS anzahl FROM checklist_checklistpoints WHERE checklistId = ".$_POST['values']['checklistId'])->fetch_object()->anzahl) - 1;        #new element inc.

            #if($highPos == 0){$highPos = 0;$emptyFlag = true;}
            #newSort
        if(isset($_POST['operator']['newPoint']) && $_POST['values']['pos'] != ""){
            $newPos = $_POST['values']['pos'] - 1;
            if($newPos > $highPos){
                #echo "INSERT INTO `checklist_checklistpoints`(`checklistId`, `checklistPointId`, `position`) VALUES (".$_POST['values']['checklistId'].",".$id.",".($highPos+1).")";
                $checklistSql = "INSERT INTO `checklist_checklistpoints`(`checklistId`, `checklistPointId`, `position`) VALUES (".$_POST['values']['checklistId'].",".$id.",".($highPos+1).")";
            }else{
                #echo "SELECT * FROM checklist_checklistpoints WHERE position >= ".$newPos." AND checklistId = ".$_POST['values']['checklistId'];
                $targets = $db->query("SELECT * FROM checklist_checklistpoints WHERE position >= ".$newPos." AND checklistId = ".$_POST['values']['checklistId']);
                while($row = $targets->fetch_object()){
                    #echo "UPDATE checklist_checklistpoints SET position = position + 1 WHERE checklistId = ".$_POST['values']['checklistId']." AND checklistPointId = ".$row->checklistPointId;
                    $db->query("UPDATE checklist_checklistpoints SET position = position + 1 WHERE checklistId = ".$_POST['values']['checklistId']." AND checklistPointId = ".$row->checklistPointId);

                }
            }
        }else if(!isset($_POST['operator']['newPoint']) && $_POST['values']['pos'] != ""){
            $oldPos = $db->query("SELECT position FROM checklist_checklistpoints WHERE checklistId = ".$_POST['values']['checklistId']." AND checklistPointId = ".$id)->fetch_object()->position;
            $newPos = $_POST['values']['pos'] - 1;

            if($newPos > $oldPos){
                $targets = $db->query("SELECT * FROM checklist_checklistpoints WHERE position <= $newPos AND position > $oldPos AND checklistId = ".$_POST['values']['checklistId']);
                while($row = $targets->fetch_object()){
                    $db->query("UPDATE checklist_checklistpoints SET position = position - 1 WHERE checklistId = ".$_POST['values']['checklistId']." AND checklistPointId = ".$row->checklistPointId);
                }
            }else if($newPos < $oldPos){
                $targets = $db->query("SELECT * FROM checklist_checklistpoints WHERE position >= $newPos AND position < $oldPos AND checklistId = ".$_POST['values']['checklistId']);
                while ($row = $targets->fetch_object()) {
                    $db->query("UPDATE checklist_checklistpoints SET position = position + 1 WHERE checklistId = ".$_POST['values']['checklistId']." AND checklistPointId = ".$row->checklistPointId);
                }
            }else if($newPos == $oldPos) {
                $skipUpdatePos = true;
            }


        }else if($_POST['values']['pos'] == "" && isset($_POST['values']['checklistPointId'])){
            $skipUpdatePos = true;
        }

        $id = str_replace("&iuml;", "", str_replace("&raquo;","",str_replace("&iquest;","",htmlentities($_POST['values']['checklistPointId']))));
        $checklistPoint = new ChecklistPoint($id);
        $checklistPoint->setValue("heading",  strip_tags($_POST['values']['heading']));
        $checklistPoint->setValue("text",$_POST['values']['text']);
        $checklistPoint->save();
        if(isset($_POST['values']['pos']) && $_POST['values']['pos'] != "" && !$skipUpdatePos){
            #echo "UPDATE checklist_checklistpoints SET position = ".$newPos." WHERE checklistId = ".$_POST['values']['checklistId']." AND checklistPointId = ".$id;
            $db->query("UPDATE checklist_checklistpoints SET position = ".$newPos." WHERE checklistId = ".$_POST['values']['checklistId']." AND checklistPointId = ".$id);
        }else if(!$skipUpdatePos){
            #echo "UPDATE checklist_checklistpoints SET position = ".($highPos)." WHERE checklistId = ".$_POST['values']['checklistId']." AND checklistPointId = ".$id;
            $db->query("UPDATE checklist_checklistpoints SET position = ".($highPos)." WHERE checklistId = ".$_POST['values']['checklistId']." AND checklistPointId = ".$id);
        }


    }
        //create ChecklistPoint
    else{
        $checklistPoint = new ChecklistPoint();
        $checklistPoint->save();
            //link to checklist
        $checklistSql = "INSERT INTO `checklist_checklistpoints`(`checklistId`, `checklistPointId`) VALUES (".$_POST['values']['checklistId'].",".$checklistPoint->getValue("id").")";
        $db->query($checklistSql);
        #echo $checklistSql;
        echo $checklistPoint->getValue("id");
    }
}

    function getCountChecklistPoints($db){
        $count =  $db->query("SELECT COUNT('checklistPointId') AS anzahl FROM checklist_checklistpoints WHERE checklistId = ".$_GET['values']['checklistId'])->fetch_object()->anzahl;
        echo htmlentities(($count - 1));
    }

function checkForChecklistPointCreate($db){
    $id = str_replace("&iuml;", "", str_replace("&raquo;","",str_replace("&iquest;","",htmlentities($_GET['checklistPointId']))));
    $heading = $db->query("SELECT `heading` FROM `checklistpoints` WHERE `checklistPointId` = ".$id)->fetch_object()->heading;
    if($heading == "" || $heading == NULL){
        $db->query("DELETE FROM `checklistpoint_screenshot` WHERE `checklistPointId` = ".$id);
        $db->query("DELETE FROM `checklist_checklistpoints` WHERE `checklistPointId` = ".$id);
        $db->query("DELETE FROM `checklistpoints` WHERE `checklistPointId` = ".$id);
    }else{}

}

function deleteChecklistPointFromList($db){
        $checklistIds = $db->query("SELECT checklistId FROM checklist_checklistpoints WHERE checklistPointId = ".$_GET['checkpointId']);
        #echo "SELECT checklistId FROM checklist_checklistpoints WHERE checklistPointId = ".$_GET['checkpointId']."<br />";
        while($row = $checklistIds->fetch_object()){
            $db->query("UPDATE checklist_checklistpoints SET position = position - 1 WHERE position > ".$db->query("SELECT position FROM checklist_checklistpoints WHERE checklistPointId = ".$_GET['checkpointId']." AND checklistId = ".$row->checklistId)->fetch_object()->position." AND checklistId = ".$row->checklistId);
            #echo "SELECT position FROM checklist_checklistpoints WHERE checklistPointId = ".$_GET['checkpointId']." AND checklistId = ".$row->checklistId."<br />";
            #echo "     UPDATE checklist_checklistpoints SET position = position - 1 WHERE position > ".$db->query("SELECT position FROM checklist_checklistpoints WHERE checklistPointId = ".$_GET['checkpointId']." AND checklistId = ".$row->checklistId)->fetch_object()->position." AND checklistId = ".$row->checklistId."<br />";
            $db->query("DELETE FROM checklist_checklistpoints WHERE checklistPointId = ".$_GET['checkpointId']." AND checklistId = ".$row->checklistId);
            #echo "     DELETE FROM checklist_checklistpoints WHERE checklistPointId = ".$_GET['checkpointId']." AND checklistId = ".$row->checklistId."<br />";
        }
}

function screenshotToChecklist($db){
    $db->query("DELETE FROM `checklistpoint_screenshot` WHERE `checklistPointId` = ".$_GET['checklistPointId']." AND `position` = ".$_GET['position']);
    $db->query("INSERT INTO `checklistpoint_screenshot`(`checklistPointId`, `screenshotId`, `position`) VALUES (".$_GET['checklistPointId'].",".$_GET['screenshotId'].",".$_GET['position'].")");
}

function saveScreenshot($db){
    $screenshot = new Screenshot();
    $screenshot->setValue("name",$_GET['filename'])->setValue("description",$_GET['description'])->save();
}

function changeTypeIcon($db){
    $db->query('Update `fbtype` SET `iconPath` = "'.$_GET['filename'].'" WHERE `fbtypeId` = '.$_GET['id']);
}

function deleteChecklist($db){
    $db->query("DELETE FROM `checklist` WHERE `checklistId`=".$_GET['checklistId']);
    $db->query("DELETE FROM `checklist_checklistpoints` WHERE `checklistId`=".$_GET['checklistId']);
    $db->query("UPDATE `fbtype` SET `checklistId`= NULL WHERE `checklistId`=".$_GET['checklistId']);
}

function editChecklist($db){
    $db->query('UPDATE `checklist` SET `name`= "'.$_GET['values']['name'].'" WHERE `checklistId`='.$_GET['values']['id']);
}

function changeChecklistPointOrder($db){
    switch($_GET['mode']){
        case 'down':
            $pos = $db->query("SELECT `position` FROM `checklist_checklistpoints` WHERE `checklistId` = ".$_GET['checklistId']." AND `checklistPointId` = ".$_GET['checklistPointId'])->fetch_object()->position;
            $db->query("UPDATE `checklist_checklistpoints` SET `position` = ".$pos." WHERE `checklistId` = ".$_GET['checklistId']." AND `position` = ".($pos+1));
            $db->query("UPDATE `checklist_checklistpoints` SET `position` = ".($pos+1)." WHERE `checklistId` = ".$_GET['checklistId']." AND `checklistPointId` = ".$_GET['checklistPointId']);
            break;
        case 'up':
            $pos = $db->query("SELECT `position` FROM `checklist_checklistpoints` WHERE `checklistId` = ".$_GET['checklistId']." AND `checklistPointId` = ".$_GET['checklistPointId'])->fetch_object()->position;
            $db->query("UPDATE `checklist_checklistpoints` SET `position` = ".$pos." WHERE `checklistId` = ".$_GET['checklistId']." AND `position` = ".($pos-1));
            $db->query("UPDATE `checklist_checklistpoints` SET `position` = ".($pos-1)." WHERE `checklistId` = ".$_GET['checklistId']." AND `checklistPointId` = ".$_GET['checklistPointId']);
            break;
    }
}

function showAll($db){
        $html = "<table>";
        $checklistCount = $_GET['anzahl'];
        for($i = 1; $i<=$checklistCount;$i++){
            $html .= "<tr><td>ChecklistId = $i</td></tr>";
            $all = $db->query("SELECT * FROM checklist_checklistpoints WHERE checklistId = $i ORDER BY position");
            while($row = $all->fetch_object()){
                $html .= "<tr><td>$row->checklistPointId</td><td>$row->position</td></tr>";
            }
        }
        $html .= "</table>";
        echo $html;
    }


?>
