if(typeof $ == 'undefined') alert("网络连接失败, 请重新启动!");

$(document).ready(function(){
    //alert();
    //绑定菜单点击切换子页面
    $("div.menubox").click(function(){
        $("div.menubox").removeClass("current");
        $("div.menuview").removeClass("current");
        $(this).addClass("current");
        
        var menuid = $(this).attr("menu");
        $("div#"+menuid).addClass("current");
    });
    
    /*禁止文本Option和拖动*/
    document.body.onselectstart = document.body.ondrag =function(){
        return false;
    }
    
    $("input").blur(function(){
        window.scroll(0,0); //文本框等输入完毕后页面自动滚动到顶部
    });
    
    //激活webkit的button:active
    document.body.addEventListener('touchstart', function () {});

    if(typeof h5gg!='undefined') {
        //设置标题栏区域可拖动悬浮窗
        setWindowDrag(0, 0, 400, 80);
        //设置尺寸和位置
        setWindowRect(60,60,300,315);
    }
});
