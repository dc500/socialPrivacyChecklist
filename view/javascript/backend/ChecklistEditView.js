ChecklistEditView = function(){
    
    this.init = function(html){
        $('#col3').html("");        
        $("#col2").load(html,function(){
                        //add checklist button
            $('#addChecklistButton').unbind("click").click(function(){
                $('#addNewChecklistDialog').dialog({height: 150});
            });

                $('#submitCreateNewChecklistButton').click(function(){
                    if($('#newChecklistInputName').val() != ""){
                        var values = {"name": $('#newChecklistInputName').val()};
                        $.get("../index.php",{"from": "back", "op": "newChecklist","values": values},function(){
                            $('#newChecklistInputName').val("");
                            $('#addNewChecklistDialog').dialog("close");
                            getChecklists();
                        });
                    }
                });           
        });        
        this.getChecklists();
        
    }
    
    this.getChecklists = function(){
        $.get("../index.php",{"from": "back", "op": "getChecklists"},function(checklists){
            $('#col3').html("");
            $('#checklistEditContainer').html(checklists);            
            
                     //checklistbutton clickevent
            $.map($('#checklistEditContainer button'),function(value,key){               
                $('#checklistEditContainer button:eq('+key+')').unbind("click").click(function(){
                    triggerChecklistPointView($(this).find('.idHolder').html(),$(this).find('.nameChecklist').text());
                });                              
            }); 
        });
    }
    
    var getChecklists = this.getChecklists; 
    
    this.triggerChecklistPointView = function(checklistId,name){
        $('#col3').html("");
        $('#addChecklistPointNew,#editChecklistPointNew,#addChecklistPointOptionsDialog').remove();
        $(".ui-dialog-content").dialog("close");        
        loadNewView("checklistPointsEdit.html","cssPc/backend/checklistPointsEdit.css","ChecklistPointEditView.js",{"id":checklistId,"name": name,"getChecklists": getChecklists});  //load checklistView
    }
    
    var triggerChecklistPointView = this.triggerChecklistPointView;
    
}

function getView(){
    return ChecklistEditView;
}