if(typeof $ == 'undefined');
$(document).ready(function(){
    $("div.menubox").click(function(){
        $("div.menubox").removeClass("current");
        $("div.menuview").removeClass("current");
        $(this).addClass("current");
        
        var menuid = $(this).attr("menu");
        $("div#"+menuid).addClass("current");
    });
    
    document.body.onselectstart = document.body.ondrag =function(){
        return false;
    }
    
    $("input").blur(function(){
        window.scroll(0,0); 
    });
    
    document.body.addEventListener('touchstart', function () {});

    if(typeof h5gg!='undefined') {
        //设置标题栏区域可拖动悬浮窗
        setWindowDrag(0, 0, 400, 80);
        //设置尺寸和位置
        setWindowRect(60,60,300,315);
    }
});
