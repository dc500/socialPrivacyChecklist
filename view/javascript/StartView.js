StartView = function(){
    
    this.init = function(html){
        document.location.hash = "#typeSelection";        
        $('#mainContent').load(html,function(){
             $('#tippDialog').dialog('close');
             $('.welcomeTextBox').show();
             $('#welcomeTextHeading').css({"float": "none", "font-size": "1.3em", "margin-left": "35px"});
             $.get("index.php",{"from": "front","op":'getFbTypes'},function(types){           
                flyin(types);
            });
        });       
    }
    
     
};   

function typeChosenFunction(id,source,callback){
   //window.setTimeout(function(){alert("time out");}, 1500);
   $('#welcomeTextHeading').text("");  
   $.map($('.nav li a'),function(value,key){
      if($(value).attr("href") == ('#'+source)){
         $('.shareBar').css({"top": "60px","right": "234px"});               
         //chosen element    
          $('.nav li:eq('+key+')').removeAttr("onClick");
          window.setTimeout(function(e){               
                $('.nav li:eq('+key+')').attr("id","chosen"); 
                var left = parseInt($('#header').offset().left) + parseInt($('#header').width()) - parseInt($('#chosen').width() / 2);
                var top = parseInt($('#header').height()) + (parseInt($('#progressBar').height()) + parseInt($('#progress').css("margin-top"))) - parseInt($('#chosen').height()/2);
                $('#chosen').appendTo('#chosenElementList');               
                               
                $('#chosen').css("position","absolute");
                $('#chosen').css("top",top);
                $('#chosen').css("left",left);                 
                $('#chosen .typeButtonText').html("");
                $('#chosen a').unbind("mouseenter");
                $('.welcomeTextBox').hide();
                $('#hoverText, #tooltip').hide();
                $('#welcomeTextHeading').attr("title",$('#chosen').find('.typeDesc').text());
                           
                window.setTimeout(function(){                              
                    $('#chosen a').unbind("click").click(function(){return true;}); //restore default click behaveor from linkclick
                    $('#chosen a').css("box-shadow","none");
                    $('#chosen a').css("border-color","#a7a7a7");
                    $('#chosen a').attr("href",document.location);
                    $('#chosen a').attr("title",$('#chosen').find('.typeDesc').text());
                    $('#chosen').addClass('chosen');
                    $('#hoverText, #tooltip').hide();
                    callback();
                },1050);                
          },500);
       }else{
           $('.nav li:eq('+key+')').css("opacity","0");
       } 
   }); 
}

/**
 * let types fly in
 */
function flyin(types){
    $('.nav').html("");
    $('.nav').html(types);
    var cols = 4;
    var y = 0;//$('#header').height()+$('#welcomeText').height();
    var x = (($('#mainContent').width()-($('#.nav li').width()*4))/2)
    
    $.map($('.nav li'),function(value,key){
       $(value).find('a').click(function(e){
           e.preventDefault();
           var id = $(this).find('.idHolder').html();
           var source = $(this).attr("href");
           if($.browser.msie){
              window.location.href = source;
              window.location.reload();
           }else{
              typeChosenFunction(id,source.replace("#",""),function(){
                window.location.href = source;               
              });
           }
       });
       
       $(value).find('a').mouseenter(function(event){
           var top = parseInt($(value).offset().top);
           var left = parseInt($(value).offset().left);
           var text = $(this).find('.typeDesc').text();
           var hoverText = new HoverText({"target": "#hoverText","text": text, "top": top, "left": ( (left+$(this).width()/2) + ( parseInt($(this).css("margin-left")) /2 ) )});
       });
       
       $(value).find('a').mouseleave(function(){
           $('#hoverText, #tooltip').hide();
       });
       
       if((key/cols) == 1){
           x = (($('#mainContent').width()-($('#.nav li').width()*4))/2);
       }       
       x = x+$('.nav li').width();  
             
       if(((key/cols)%1) == 0 && key != 0){  // new col
          x = (($('#mainContent').width()-($('#.nav li').width()*4))/2);
          y = y+$('.nav li').height();
       }     
        
       if(key == 0){
           x = (($('#mainContent').width()-($('#.nav li').width()*4))/2);
       } 
       window.setTimeout("animationToPoint("+y+","+x+","+key+")",key*400);
    });
}

function animationToPoint(y,x,key,callback){   
    $('.nav li:eq('+key+')').css("left",parseInt(x));
    $('.nav li:eq('+key+')').css("top",parseInt(y));
    window.setTimeout(function(){        
        if(typeof(callback)  != "undefined"){callback();}
    },1000);
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

function getView(){
    return StartView;
};