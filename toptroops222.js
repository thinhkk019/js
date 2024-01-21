function checkboxclick(input){
h5gg.require(7.9); 
var h5frida=h5gg.loadPlugin("h5frida", "h5frida-16.0.10.dylib");
if(!h5frida) throw "Failed to load h5frida plugin";

function ActiveCodePatch(fpath, vaddr, bytes) {
    if(!h5frida.ActiveCodePatch(fpath, vaddr, bytes)) {
        var result = h5frida.ApplyCodePatch(fpath, vaddr, bytes);
      return false;
    } return true;
}
function DeactiveCodePatch(fpath, vaddr, bytes) {
    return h5frida.DeactiveCodePatch(fpath, vaddr, bytes);
}
var chucnang1 = document.getElementById('1');
 if (chucnang1.checked == true)
 {

  ActiveCodePatch("Frameworks/UnityFramework.framework/UnityFramework", 0x22bcd9c, "08FEBF12C0035FD6");                ActiveCodePatch("Frameworks/UnityFramework.framework/UnityFramework", 0x441f1e0, "08FEBF12C0035FD6");
 
}
else {

DeactiveCodePatch("Frameworks/UnityFramework.framework/UnityFramework", 0x22bcd9c, "08FEBF12C0035FD6");                DeactiveCodePatch("Frameworks/UnityFramework.framework/UnityFramework", 0x441f1e0, "08FEBF12C0035FD6");

}



}
