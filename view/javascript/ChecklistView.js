var ChecklistView = function(){
    this.id = null;
                
    //load template
    this.init = function(html,params){
        this.id = params.id;        
            //coming from hashNav
        $.get("index.php",{"from": "front","op": "createChecklistView","id": params.id},function(checklist){   //get Checklist           
            if($('#chosen').length == 0){       //user comes from direct url
                $('#mainContent').html("").load("view/templates/start.html",function(){                    
                    $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'css/cssPc/start.css') );
                    createTypeButton(params,function(){});
                    loadingContent(html,params,checklist,function(){
                            //setting up lightbox and hovereffect for screenshots
                        //imageTasks(); 
                            //check for checked points ? "" : create new field in checkstate with empty array
                        var exist = false;
                        var index = document.location.hash.replace("#","");
                        if(checkstate.lenght == 0){
                            checkstate[index] = [];
                        }else{
                            $.map(checkstate,function(points,type){
                                if(index == type){
                                    exist = true; 
                                }
                            });
                            if(!exist){
                                checkstate[index] = [];
                            }
                       }
                            //setting up progessBar
                            
                        progressBar = new ProgressBar($('.checklistPoint').length,document.location.hash.replace("#",""));
                        var stickyNav = new Sticky();
                        stickyNav.init($('.checklistControlSticky'));
                    });
                });
            }else{                      //user comes from selection  
                loadingContent(html,params,checklist,function(){
                    //setting up lightbox and hovereffect for screenshots
                    //imageTasks();
                    //check for checked points ? "" : create new field in checkstate with empty array
                    var exist = false;
                    var index = document.location.hash.replace("#","");
                    if(checkstate.lenght == 0){
                        checkstate[index] = [];
                    }else{
                        $.map(checkstate,function(points,type){
                            if(index == type){
                                exist = true; 
                            }
                        });
                        if(!exist){
                            checkstate[index] = [];
                        }
                    }
                        //setting up progessBar
                    progressBar = new ProgressBar($('.checklistPoint').length,document.location.hash.replace("#",""));       
                    var stickyNav = new Sticky();
                    stickyNav.init($('.checklistControlSticky'));
                }); 
            }            
            $(window).resize(function(){handleResize(params);});
            
       });

       $.getScript("tools/mailingWork/mailingWork.js");      
       
    }  
    
    this.imageTasks = function(){
        $('head').append('<link rel="stylesheet" type="text/css" href="tools/lightbox/lightbox.css" media="screen" />');
        //$.getScript("tools/lightbox/lightbox.js",function(){
        $.getScript("tools/lightbox/lightbox.js",function(){
            $.map($('.checklistPoint'),function(value,key){
                var targets = $(value).find('.textContainer img');                           //find                     
                if(typeof(targets) != "undefined"){
                    $(targets).lightBox({
                        overlayBgColor: '#F4F4F4',
                        overlayOpacity: 0.6,
                        imageLoading: 'tools/lightbox/images/lightbox-ico-loading.gif',
                        imageBtnClose: 'tools/lightbox/images/lightbox-btn-close.gif',
                        imageBtnPrev: 'tools/lightbox/images/lightbox-btn-prev.gif',
                        imageBtnNext: 'tools/lightbox/images/lightbox-btn-next.gif',
                        imageBlank: 'tools/lightbox/images/lightbox-blank.gif',
                        txtImage: 'Schritt',
                        txtOf: 'von',
                        fixedNavigation:true
                    });
                    //applyHoverZoom(targets);
                }
            });
            
            $.map($('.textContainer img'),function(value,key){
                if($(value).attr("href").indexOf("image") > -1){        //found link to screenshot image
                    $(value).unbind('click').click(function(event){
                        event.preventDefault(); 
                        var href = $(value).attr("href");
                        var src = "images/screenshots/" + href.substring(href.indexOf("image/")+6);
                        $('#screenshotSwap').attr("href",src);
                        $('#screenshotSwap img').attr("src", src).attr("title","sdf");
                        $('#screenshotSwap').lightBox({
                            overlayBgColor: '#F4F4F4',
                            overlayOpacity: 0.6,
                            imageLoading: 'tools/lightbox/images/lightbox-ico-loading.gif',
                            imageBtnClose: 'tools/lightbox/images/lightbox-btn-close.gif',
                            imageBtnPrev: 'tools/lightbox/images/lightbox-btn-prev.gif',
                            imageBtnNext: 'tools/lightbox/images/lightbox-btn-next.gif',
                            imageBlank: 'tools/lightbox/images/lightbox-blank.gif',
                            txtImage: 'Schritt',
                            txtOf: 'von',
                            fixedNavigation:true
                        });
                        $('#screenshotSwap').trigger("click");                        
                    });
                }
            });
        });
    }
    
    this.applyHoverZoom = function(targets){
        $.map(targets,function(value,key){
            $(value).unbind("mouseenter").mouseenter(function(){var offsetImage = {"top": $(value).find("img").offset().top, "left": $(value).find("img").offset().left};
                var imageSize = {"width": $(value).find("img").width(), "height": $(value).find("img").height()};
                var that = $(value).find("img");    //that = small imageScreenshot
                window.setTimeout(function(){
                            //window.setTimeout(function(){         
                            //    $(that).unbind("mousemove");
                            //},300);       
                     $(that).unbind("mousemove").mousemove(function(ev){
                        if(ev.pageY > offsetImage.top && ev.pageY < (offsetImage.top+imageSize.height) && ev.pageX > offsetImage.left && ev.pageY < (offsetImage.left+imageSize.width)){
                            $(that).unbind("mousemove");
                            var src = $('#screenshotZoom').find("img").attr("src");
                            if(src != $('#screenshotZoom').find("img").attr("src") || typeof(src) == "undefined"){
                                
                                $('#screenshotZoom').css({
                                    "top": ev.pageY-50,
                                    "left": ev.pageX-50,
                                    "width": 45,
                                    "height": 45
                                }).show();
                                var eventTmp = ev;
                                var offset = {"top": 20, "left": 20};
                                $.getJSON("index.php",{"from": "front", "op": "getScreenshotData", "source": $(that).attr("src")},function(imageData){
                                    var eventSave = eventTmp;
                                    var image = '<img src="'+$(that).attr("src")+'" class="hoverZoom" />';
                                    $('#screenshotZoom').html(image);
                                   
                                   $('#screenshotZoom').css({
                                        "width": $('.hoverZoom').width()+10,
                                        "height": $('.hoverZoom').height()+10});
                                     var sizeScreenshotZoom = {"height": $('#screenshotZoom').height(), "width": $('#screenshotZoom').width()}; 
                                    $('#screenshotZoom').css({
                                        "top": (eventSave.pageY - sizeScreenshotZoom.height - offset.top)+"px",
                                        "left": (eventSave.pageX - sizeScreenshotZoom.width - offset.left)+"px"
                                    }).show();      //hoverzoomed screenshot
                                   $('body').unbind("mousemove").mousemove(function(event){
                                        var top = sizeScreenshotZoom.height;
                                        var left = sizeScreenshotZoom.width;                                        
                                        $('#screenshotZoom').css({
                                                        "top": (event.pageY - top - offset.top)+"px",  // - $('#screenshotZoom').find("img").height()),
                                                        "left": (event.pageX - left - offset.left)+"px" // - $('#screenshotZoom').find("img").width())
                                        });                                   
                                    });                                  
                                });
                                
                            }
                        }
                    });
                    $(value).mouseout(function(){
                        $('body').unbind("mousemove"); 
                        $(that).unbind("mousemove");
                        $('#screenshotZoom').html("").hide();                        
                    });
                },300);
            });

        });
    }
    
    
    
    this.loadingContent = function(html,params,checklist,callback){
        $('#typeSelection').remove(); 
        $('.welcomeTextBox').hide();
        $('#welcomeTextHeading').css({"float": "right", "font-size": "2em", "margin-right": "110px"});
        $('#welcomeTextHeading').text(params.name);        
        
        $('#checklistDummy').load(html,function(){
                    //display Checklist
                while(checklist.charAt(0) != "<"){checklist = checklist.substring(1);}
                $('#checklistContainer').html(checklist);
                    //setting up checklistNavigation [back,check,forward]
                $('.checklistControlCheck,#checklistOptionsTopCheck').click(function(){                             //show checkicon if checkbutton pressed
                    var checkPoint = $('.curr').index();
                    if($('.checklistPoint:eq('+checkPoint+')').hasClass('check')){                                               
                        $('.checklistPoint:eq('+checkPoint+')').removeClass('check');
                        $('.checklistControlCheck,#checklistOptionsTopCheck').attr("src","images/circlecheck.png");
                        progressBar.uncheck(checkPoint+1);
                    }else{                        
                        $('.checklistPoint:eq('+checkPoint+')').addClass('check');
                        $('#checklistOptionsTopCheck, .checklistControlCheck').attr("src","images/circleuncheck.png");
                        progressBar.check(checkPoint+1);
                        setTimeout(function(){$('.checklistControlRight').trigger("click")},200);
                    }
                    if($('.check').length > $('.checklistPoint').length){
                        loadNewView("thanks.html","cssPc/thanks.css","ThanksView.js");
                    }
                }); 
                
                $('.checklistControlLeft,#checklistOptionsTopLeft').click(function(){
                    var checkPoint = $('.curr').index();
                    if(checkPoint > 0){
                        $('.checklistPoint:eq('+(checkPoint)+')').fadeOut(function(){
                            $('.checklistPoint:eq('+(checkPoint-1)+')').fadeIn(); 
                            if($('.checklistPoint:eq('+(checkPoint-1)+')').hasClass('check')){
                                $('#checklistOptionsTopCheck, .checklistControlCheck').attr("src","images/circleuncheck.png");
                            }else{
                                $('#checklistOptionsTopCheck, .checklistControlCheck').attr("src","images/circlecheck.png");
                            }
                            $('#progress span:eq('+checkPoint+')').css("border-color","lightgray");
                            $('#progress span:eq('+(checkPoint-1)+')').css("border-color","#719EBB");
                            $('.checklistPoint:eq('+(checkPoint)+')').removeClass("curr");   
                            $('.checklistPoint:eq('+(checkPoint-1)+')').addClass("curr");                            
                        });  
                    }                   
                });
                
                $('.checklistControlRight,#checklistOptionsTopRight').click(function(){
                    var checkPoint = $('.curr').index();
                    if(checkPoint < $('.checklistPoint').length-1){    
                        $('.checklistPoint:eq('+(checkPoint)+')').fadeOut(function(){                        
                            $('.checklistPoint:eq('+(checkPoint+1)+')').fadeIn();
                            if($('.checklistPoint:eq('+(checkPoint+1)+')').hasClass('check')){
                                $('#checklistOptionsTopCheck, .checklistControlCheck').attr("src","images/circleuncheck.png");
                            }else{
                                $('#checklistOptionsTopCheck, .checklistControlCheck').attr("src","images/circlecheck.png");
                            }
                            $('#progress span:eq('+checkPoint+')').css("border-color","lightgray");
                            $('#progress span:eq('+(checkPoint+1)+')').css("border-color","#719EBB");
                            $('.checklistPoint:eq('+(checkPoint)+')').removeClass("curr");   
                            $('.checklistPoint:eq('+(checkPoint+1)+')').addClass("curr");
                        }); 
                    }                                                      
                });

                $('#sendMailButton,#cancelSendMailButton').button();

                $('#printChecklistButton').click(function(){
                    var clone = $('#checklistContainer').clone();
                    clone.find('.controls').remove();
                    printContent(clone.html());
                    return false;
                });

                $('#mailChecklistButton').click(function(){
                    $('#mailDialog').dialog({close: function(){$('#mailDialog input').val("");}});
                });

                    $('#cancelSendMailButton').click(function(){
                        $('#mailDialog').dialog("close");
                        $('#mailDialog input').val("");                    
                    });



                    $('#sendMailButton').click(function(){
                        $('#mailDialogError').html("");
                        $('.mailDialogErrorIndicator').hide();
                        $('#mailAgreements').css("color","black");
                        var email = $('#emailFirst').val();
                        if(email == $('#emailSecond').val()){
                            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                            if (filter.test(email)) {                                
                                $.get("index.php",{"from":"front","op": "sendListAsMail","checklistId": params.id,"to": $('#emailFirst').val()},function(status){
                                    alert("Deine Checkliste wurde versandt.");
                                        $('#mailDialog').dialog("close");
                                        $('#mailDialogError').html("");
                                        $('.mailDialogErrorIndicator').hide();
                                        $('#mailAgreements').css("color","black");
                                });                                
                            }else{
                                $('#emailFirstLabel .mailDialogErrorIndicator').show();
                                $('#emailFirstLabel').css("color","red");
                                $('#emailSecond').val("");
                                $('#mailDialogError').html("Adresse ist keine gültige E-Mailadresse");
                            }
                        }else{
                            $('#emailSecondLabel .mailDialogErrorIndicator').show();
                            $('#emailSecondLabel').css("color","red");
                            $('#mailDialogError').html("Adressen stimmen nicht überein");
                        }                    
                    });
            
            $("#followSubscribeButton,#tippButton").button();
            
            $('#followButton').unbind("click").click(function(){
                $('#followDialog').dialog();
            });
            
                $("#followSubscribeButton").unbind("click").click(function(){
                    mailingWorkSubcribe();
                });                
            
            $('.checklistPoint:eq(0)').find('.checklistControlLeft').css("opacity",".3");
            $('.checklistPoint:eq('+($('.checklistPoint').length-1)+')').find('.checklistControlRight').css("opacity",".3");
            
            $('#tippButton').unbind('click').click(function(){
                $('#tippDialog').dialog('open');
            });
            
            if(tippDialog){
                $('#tippDialog').dialog({
                        modal: true,
                        resizable: false,
                        draggable: false,
                        width: 480                        
                    });
                tippDialog = false;
            }            
            
            
            if(typeof(callback) == "function"){
                callback();
            }
        });       
    }
    
    /**
    * creates a button like the navButtons when page is called per hashCall
    */
    this.createTypeButton = function(params,callback){
        window.setTimeout(function(){
            $('#welcomeTextHeading').attr("title",params.description);
            var typeButtonHtml = '<li id="chosen" class="chosen" style="display: none;">';
            typeButtonHtml += '<a href="#typeSelection" title="'+params.description+'"><span><img class="typeIcon" src="images/typeIcons/'+params.iconPath+'" /></span>';
            typeButtonHtml += '<span class="screen-reader-text">'+params.name+'</span></a></li>';
            $('#chosenElementList').append(typeButtonHtml);
               //top
            var yTypeButton = parseInt($('#header').height()) + (parseInt($('#progressBar').height()) + parseInt($('#progress').css("margin-top"))) - parseInt($('#chosen').height()/2);            
                //left
            var xTypeButton =  parseInt($('#header').offset().left) + parseInt($('#header').width()) - parseInt($('#chosen').width() / 2);
            $('#chosen').css({
                "position": "absolute",
                "top": yTypeButton,
                "left": xTypeButton
            }).addClass('chosen');

            $('#chosen a').css({
                "box-shadow": "none",
                "boder-color": "#a7a7a7"
            });           
            
            $('#chosen, #welcomeText').css("transition", "none");
            $('#chosen').css("display","block");
            
            $('#chosenElementList .chosen').css("background-image","url('images/background/pattern.png')");
            
            if(typeof(callback) == "function"){
                callback();
            }
        },100);   
    }
    
    this.printContent = function(content){
        var popup = window.open('', 'printPopup', 'height=600, width=1000');
        var html = '<html><head><title>FacebookSecurity - Checklist '+document.location.hash.replace("#","")+'</title>'+
                    '<link rel="stylesheet" type="text/css" href="css/cssPrint/printChecklist.css" />'+
                    '</head><body><div id="checklistContainer">'+content+'</div>'+
                    '<script type="text/javascript" src="tools/print/printFunctions.js"></script>'+
                    '</body></html>';
        popup.document.write(html);
        popup.document.close();
        setTimeout(function(){
            popup.print();
            popup.close();
        },1000);
    }
    
    this.handleResize = function(params){
        createTypeButton(params,null);
    }

    var handleResize = this.handleResize;
    var applyHoverZoom = this.applyHoverZoom;
    var imageTasks = this.imageTasks;
    var createTypeButton = this.createTypeButton;
    var loadingContent = this.loadingContent;
    var printContent = this.printContent;
}

function getView(){
    return ChecklistView;
}

/**
 * ProgressBar object
 * @param int to    --> total
 */
ProgressBar = function(to,typeName){
    var total = to;
    this.typeName = typeName;
    
    this.check = function(checkPoint){
        $('.progress'+checkPoint).css("background-color","#329932");
        checkstate[this.typeName].push(checkPoint);
    }
    var check = this.check;
    
    this.uncheck = function(checkPoint){
        $('.progress'+checkPoint).css("background-color","white");
        var typeName = this.typeName;
        $.each(checkstate[this.typeName],function(key,point){
            if(point == checkPoint){
                checkstate[typeName].splice(key,1);               
                return false;
            }
        });
    }
    var uncheck = this.uncheck;   
    
    var setLines = function(){
        var length = $('#progressBar').width();
        for(var i=1; i<=total; i++){            
            $('#progress').append('<span class="progress'+i+'"></span>');
            $('.progress'+i).width( ((length*((1/total)*100))/100) -2 );    //-2 for borders
            $('.progress'+i).mouseenter(function(){
                var index = $(this).index();
                var clone = $('.heading:eq('+index+')').clone();
                    clone.find('input').remove();
                var text = clone.html();
                var hoverText = new HoverText({"target": "#hoverText","top": ($(this).offset().top-15), "left": ($(this).offset().left + $(this).width()/2), "text": text});
            });
            $('.progress'+i).mouseleave(function(){
                $('#hoverText, #tooltip').hide();
            });
        }
    }  
    
    var checkForChecked = function(typeName){
        $.map(checkstate,function(points,type){
            if(type == typeName){
                if(points.length > 0){
                    $.each(points,function(key,point){
                        $('.progress'+point).css("background-color","#329932");
                        $('.checklistPoint:eq('+(point-1)+')').find('.checklistControlCheck').removeClass('check').addClass('uncheck');
                        $('.checklistPoint:eq('+(point-1)+')').find('.checklistControlCheck').attr("src","images/circleuncheck.png");
                    });
                }
            }
        });
    }    
    
    var setClickEvent = function(){
        $('#progress').children().click(function(){
            var destinationPoint = $(this).index();
            var currentPoint = $('.curr').index(); 
            $('.checklistPoint:eq('+(currentPoint)+')').fadeOut(function(){                   
                $('.checklistPoint:eq('+(destinationPoint)+')').fadeIn();
                if($('.checklistPoint:eq('+destinationPoint+')').hasClass('check')){
                    $('#checklistOptionsTopCheck, .checklistControlCheck').attr("src","images/circleuncheck.png");
                }else{
                    $('#checklistOptionsTopCheck, .checklistControlCheck').attr("src","images/circlecheck.png");
                } 
            });               
            $('#progress span:eq('+currentPoint+')').css("border-color","lightgray");
            $('#progress span:eq('+destinationPoint+')').css("border-color","#719EBB");          
            $('.checklistPoint:eq('+destinationPoint+')').addClass("curr");
            $('.checklistPoint:eq('+currentPoint+')').removeClass("curr");
        });
    }    
    $('.checklistPoint:eq(0)').fadeIn().addClass('curr');
    setLines();
    setClickEvent();
    checkForChecked(typeName);
       
    
}

/**
 * creates div on hover over fbtype filled with text
 */
var HoverText = function(attr){
    this.target = attr.target;
    this.top = attr.top;
    this.left = attr.left;
    this.text = attr.text;    
    $(this.target+' p').text(this.text);
    $(this.target).css({"top": (this.top-$(this.target).height()-10),"left": (this.left-5)}).show();
    $('#tooltip').css({"top": this.top+1,"left": this.left}).show();
};

var Sticky = function(){
    this.init = function(target){
        $(window).scroll(function(e){
            if($(window).scrollTop() > 210){
                $(target).css({
                    "right": $('#wrapper').offset().left + 20,
                    "display": "block"
                });
            }else{target.hide();}
        });
    }        
}
