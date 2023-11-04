        var h5gg_jquery_stub;

        if (typeof $ == 'undefined')
            

        //æ ¹æ®éæ©çæç¬¦å·/æ ç¬¦å·æ°ç¡®å®æç´¢ç±»å
        function h5ggType(type) {
            if ($("input:radio[name=numtype]:checked").val() == "unsigned") {
                switch (type) {
                    case "I8":
                        return "U8";
                    case "I16":
                        return "U16";
                    case "I32":
                        return "U32";
                    case "I64":
                        return "U64";
                }
            }

            return type;
        }

        //é¡µé¢æ¾ç¤ºå®æ¯äºä»¶
        document.addEventListener("DOMContentLoaded", function () {

            if (typeof $ == 'undefined') {
                alert("jquery load failed!");
                return;
            }

            /*ç¦æ­¢ææ¬éæ©åæå¨*/
            document.body.onselectstart = document.body.ondrag = function () {
                return false;
            }
            //ææ¬æ¡ç­è¾å¥å®æ¯åé¡µé¢èªå¨æ»å¨å°é¡¶é¨
            $("input").blur(function () {
                window.scroll(0, 0);
            });

            //æ¿æ´»webkitçbutton:active
            document.body.addEventListener('touchstart', function () { });

            //ç»å®èåç¹å»åæ¢å­é¡µé¢
            $("div.menubox").unbind('click').click(function () {
                $("div.menubox").removeClass("current");
                $("div.menuview").removeClass("current");
                $(this).addClass("current");

                var menuid = $(this).attr("menu");
                $("div#" + menuid).addClass("current");
            });

            $("#datavalue").focus(function () {
                var input = $(this);
                input.attr("type", "number");
                setTimeout(function () {
                    input.attr("type", "text");
                }, 500);
            });


            $("#crossproc").click(function () {
                $("#popup_proclist").show();
                $("#maskview").show();
            });

            dragElement(document.getElementById("popup_writeinstruction"));
            dragTableElement(document.getElementById("memoryinfoList"));
            autoLoadJSPlugin();
            window.gDebug = [];
            window.gUnityAssemblyImages = ["Assembly-CSharp"];
            window.gUnityClasses = {};
            window.gUnityObj = [];
            window.gUnityObjNav = [];
            window.gIl2cppInit = false;

            if (typeof h5gg != 'undefined') {

                $("#version").text(h5gg_internel_version);

                //æ¸é¤è®¾è®¡æ¼ç¤ºçç»æåè¡¨
                onClickClearResults();

                //è®¾ç½®æ é¢æ åºåå¯æå¨æ¬æµ®çª
                setWindowDrag(0, 0, 400, 80);

                //å¸å±è°æ´å½æ°
                setLayoutAction(function (w, h) {
                    var width = 300; var height = 315; //é»è®¤å°ºå¯¸370
                    if (w < h) {
                        height = 315; //ç«å±æ¨¡å¼å å¤§æ¾ç¤ºé«åº¦
                    }
                    width = Math.min(width, w); //ééiPadæµ®çª, æå¤§å®½åº¦ä¸è¶åº
                    height = Math.min(height, h); //ééèè®¾å¤, æå¤§é«åº¦ä¸è¶åº
                    var x = (w - width) / 2;
                    var y = (h - height) / 2;
                    if (w < h) {
                        y = Math.max(20, y);
                        height = Math.min(height, h - y);
                    }
                    setWindowRect(x, y, width, height);
                });

                var checkprocs = function () {
                    var procs = h5gg.getProcList();
                    if (procs)  //ä¸ä¸ºç©º(null)è¯´ææ¯å·æè·¨è¿ç¨æé
                    {
                        refreshProcList(procs);
                        $("#crossproc").show();
                        $("#closeMenu").hide();

                        if (!$("#procname").attr('pid')) {
                            $("#popup_proclist").show();
                            $("#maskview").show();
                            $("#procname").text('');
                        }

                        setInterval(function () {
                            if ($("#popup_proclist").is(":visible"))
                                refreshProcList(h5gg.getProcList());

                            if ($("#procname").attr('pid')) {
                                var procs = h5gg.getProcList();
                                var alive = false;
                                for (var i = 0; i < procs.length; i++) {
                                    if (procs[i].pid == $("#procname").attr('pid')) {
                                        alive = true;
                                        break;
                                    }
                                }

                                if (!alive) {
                                    alert("Target process terminated\n\nPlease click on the title bar to select a new target");
                                    $("#procname").removeAttr('pid');
                                    $("#procname").text('');
                                }
                            }

                        }, 1500);

                    } else {
                        $("#crossproc").hide();
                    }

                }; //end of checkprocs

                checkprocs();

            } //end of h5gg check

            //ç¹å»ç»æåè¡¨éé¢çå°åæ¶å¼¹åºä¿®æ¹çªå£, è¦å¨listdivå·æ°htmlä¹åç»å®
            $("table#resultList").on('click', 'tr', function () {
                $("table#resultList tr").removeClass("hilight");
                $(this).addClass("hilight");

                var address = $(this).attr("address");
                var datatype = $(this).attr("datatype");
                var datavalue = $(this).attr("datavalue");

                //è¯»åè¯¥å°åææ°æ°æ®
                if (typeof h5gg != 'undefined')
                    datavalue = h5gg.getValue(address, h5ggType(datatype));

                showPopView("&nbsp;&nbsp;Edit&nbsp;&nbsp;", function (type, value) {

                    if (!h5gg.setValue(address, value, h5ggType(type))) {
                        alert("The modification failed, the address may be invalid!");
                    }

                    onClickRefreshResults();

                }, datatype, datavalue);
            });

        });

        function refreshProcList(procs) {
            $("#proctable button").remove();

            for (var i = 0; i < procs.length; i++) {
                var proc = procs[i];
                var btn = $("<button>" + proc.name + "</button>");
                btn.attr("pid", proc.pid);
                btn.click(function () {
                    if (!h5gg.setTargetProc($(this).attr('pid'))) {
                        alert("Cannot Select Target!");
                        return;
                    }

                    onClickClearResults();

                    $("#procname").attr('pid', $(this).attr('pid'));
                    $("#procname").text($(this).text());
                    $("#popup_proclist").hide();
                    $("#maskview").hide();
                });

                $("#proctable").append(btn);
            }
        }

        function refreshLocalSrcipts() {
            $("table#localjslist tr").remove();

            var jsfiles = h5gg.getLocalScripts();

            setTimeout(function () {

                if (jsfiles.length == 0) {
                    $("table#localjslist tbody").append("<tr><td colspan=2>Searching App's Documents Directory...<br/>Searching .app Bundle Directory...<br/>No (*.js) or (*.html) files found!</td></td>");
                }

                $("table#localjslist tbody").append('<tr><td style="border-right-style:none; color:blue">Browser on File App</td><td style="border-left-style:none;width:45px"><button onclick="h5gg.pickScriptFile(onClickLoadScript)">Load</button></td></tr>');

                for (var i = 0; i < jsfiles.length; i++) {
                    var row = '<tr><td style="border-right-style:none;font-weight:bold;color:green">' + jsfiles[i].name + '</td><td style="border-left-style:none;width:45px"><button onclick="onClickLoadScript(\'' + jsfiles[i].path + '\')">Load</button></td></tr>';
                    $("table#localjslist tbody").append(row);
                }
            }, 300);
        }

        function autoLoadJSPlugin() {
            var jsfiles = h5gg.getLocalScripts();

            setTimeout(function () {

                if (jsfiles.length > 0) {
                    for (var i = 0; i < jsfiles.length; i++) {

                        if (jsfiles[i].path.match(/[^/]+$/)[0].startsWith("H5JSPlugin - ")) {
                            loadJSPlugin(jsfiles[i].path);
                        }
                    }
                }
            }, 300);

            function loadJSPlugin(path) {
                var script = document.createElement("script");

                script.type = "text/javascript";

                script.onload = function () {

                };

                script.onerror = function () {
                    alert("JS Plugin Load Error!\nURL Invalid or Network Exception!");
                };

                script.src = path;
                document.body.appendChild(script);
            }
        }

        function onShowLoadScript(show) {
            if (show) {
                $("#maskview").show();
                $("#popup_loadscripts").show();

                if (typeof h5gg != 'undefined') refreshLocalSrcipts();
            } else {
                $("#maskview").hide();
                $("#popup_loadscripts").hide();
            }
        }

        function onClickLoadScript(url, type) {
            if (!url) return;

            if (/^\w+\:/.test(url) == false) url = "file://" + url;

            try {
                url = new URL(url);
                url.searchParams.append("_", Math.random());
            } catch (e) {
                alert("invliad URL!");
                return;
            }

            $("#popup_progress").show();
            $("#maskview_script").show();

            if (type == 'h5' || (!type && !/\.js$/.test(url.pathname))) {
                window.location = url.href;
                return;
            }

            var script = document.createElement("script");

            script.type = "text/javascript";

            script.onload = function () {
                alert("JS Run Complete!");
                $("#popup_progress").hide();
                $("#maskview_script").hide();
            };

            script.onerror = function () {
                alert("Load Error!\nURL Invalid or Network Exception!");
                $("#popup_progress").hide();
                $("#maskview_script").hide();
            };

            script.src = url.href;
            document.body.appendChild(script);
        }


        //å¼¹åºæç´¢æä¿®æ¹çªå£
        function showPopView(name, action, type, value) {
            $("#maskview").show();
            $("#popup_search_edit").show();
            $("#popup_search_edit").find("B#titleBar").html(name);
            $("#popup_search_edit").find("button#action").html(name);

            if (type) {
                $("table#datatype td").each(function () {
                    if ($(this).text() == type)
                        $(this).addClass("selected");
                    else
                        $(this).removeClass("selected");
                });
            }

            if (value) {
                $("input#datavalue").val(value);
            }

            $("input#datavalue").focus();

            $("#popup_search_edit").find("button#action").unbind("click").click(function () {
                var type = $("table#datatype td.selected").text();
                var value = $("input#datavalue").val();

                $("#popup_search_edit").hide();
                $("#popup_progress").show();

                setTimeout(function () {

                    action(type, value);

                    $("#popup_progress").hide();
                    $("#maskview").hide();
                }, 200);

            });

            $("#popup_search_edit").find("button#cancel").unbind("click").click(function () {
                $("#maskview").hide();
                $("#popup_search_edit").hide();
            });

            $("table#datatype td").unbind("click").click(function () {
                $("table#datatype td").removeClass("selected");
                $(this).addClass("selected");
                $("input#datavalue").focus();
            });
        }

        function onClickClearResults() {
            $("input#datavalue").val("");
            $("#results_count").hide();
            $("table#resultList tr").remove();
            $("table#resultList").attr("currentCount", 0);
            if (typeof h5gg != 'undefined') h5gg.clearResults();
        }

        function loadResults(from, count) {
            var maxCount = count;
            var skipCount = from;

            var results = h5gg.getResults(maxCount, skipCount);

            for (var i = 0; i < results.length; i++) {
                if (results[i].type == 'F32' || results[i].type == 'F64')
                    results[i].value = '(' + results[i].value + ')';
                //Enhanced to include Unity support
                var row = '<tr address="' + results[i].address + '" datatype="' + results[i].type + '" datavalue="' + results[i].value + '" ontouchstart="longTouchOpenUnityObj(' + results[i].address + ')" ontouchend="resetTouch()"><td>' + (from + i + 1) + '. ' + results[i].address + '<br/><font>' + results[i].value + '</font></td></tr>';

                $("table#resultList tbody").append(row);
            }
        }

        function onClickRefreshResults(clean) {
            $("table#resultList tr").remove();

            if (clean) {
                $("#listdiv").get(0).scroll(0, 0);
                $("table#resultList").attr("currentCount", 0);
            }

            var count = h5gg.getResultsCount();
            $("#results_count").text("Results Count: " + count);
            $("#results_count").show();

            var currentCount = Number($("table#resultList").attr("currentCount"));
            if (isNaN(currentCount) || currentCount == 0) {
                currentCount = 100;
                $("table#resultList").attr("currentCount", 100);
            }

            loadResults(0, currentCount);
        }

        function loadMoreResults() {
            console.log("load more data!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" + Math.random());

            //å½åæ¾ç¤ºæ°é
            var currentCount = Number($("table#resultList").attr("currentCount"));

            //æ¯æ¬¡å¢å æ¾ç¤º100æ¡
            $("table#resultList").attr("currentCount", currentCount + 100);

            loadResults(currentCount, 100);
        }

        function showMoreResults(div) {
            var lh = div.scrollHeight - div.scrollTop;
            console.log(div.clientHeight + "," + div.offsetHeight + " : " + div.scrollTop + "," + div.scrollHeight + " : " + lh);

            if (lh <= div.clientHeight) {
                console.log("trigger bottom!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                loadMoreResults();
            }
        }

        function onClickEditAll() {

            showPopView("EditAll", function (type, value) {

                var count = h5gg.editAll(value, h5ggType(type));

                onClickRefreshResults();

                alert("Success to modify count: " + count);
            });
        }

        function onClickSearchNumber() {
            showPopView("Search Number", function (type, value) {

                h5gg.setFloatTolerance($("#float_tolerance").val());

                var memoryFrom = $("input#range_min").val();
                var memoryTo = $("input#range_max").val();
                h5gg.searchNumber(value, h5ggType(type), memoryFrom, memoryTo);

                onClickRefreshResults(true);
            });
        }

        function onClickSearchNearby() {

            showPopView("Nearby Search", function (type, value) {

                h5gg.setFloatTolerance($("#float_tolerance").val());

                var nearbyRange = $("input#nearby_range").val();
                h5gg.searchNearby(value, h5ggType(type), nearbyRange);

                onClickRefreshResults(true);
            });
        }

        function onClickMakeTweak() {
            alert("Make your custom dylib\n\nStep 1: Select a picture file for float button");
            h5gg.pickScriptFile(function (icon) {

                alert("Step 2: Select a html file that needs to load automatically");

                h5gg.pickScriptFile(function (html) {

                    alert(h5gg.makeTweak(icon, html));

                }, ["public.html"]);

            }, ["public.image"]);
        }

        /***************************************************************
         * Core UI Function defined to support enhanced menu features
         * 
         * *************************************************************/

        function onShowReadInstruction(show) {
            if (show) {
                showReadInstruction(function (value) {
                    var value = $("input#addressvalue").val();
                    if (value == "0x") {
                        value = "0x100000";
                        $("input#addressvalue").val(value);
                    }
                    readInstruction(value);

                }, "0x");
            } else {
                $("#maskview").hide();
                $("#popup_writeinstruction").hide();
                $("#popup_readinstruction").hide();
            }
        }

        function showReadInstruction(action, value) {
            $("#maskview").show();
            $("#popup_readinstruction").show();

            if (value && $("input#addressvalue").val().length < 5) {
                $("input#addressvalue").val(value);
            }

            $("input#addressvalue").focus();

            $("#popup_readinstruction").find("button#action").unbind("click").click(function () {

                setTimeout(function () {

                    action(value);


                }, 200);

            });

            $("#popup_readinstruction").find("button#cancel").unbind("click").click(function () {
                $("#maskview").hide();
                $("#popup_readinstruction").hide();
            });

        }

        function onShowWriteInstruction(show, addr, hexvalue, inst) {
            if (show) {
                //$("#maskview").show();
                $("#popup_writeinstruction").find("button#action").unbind("click").click(function () {
                    let newhexvalue = $("input#hexvalue").val();
                    newhexvalue = newhexvalue.replace(/ /g, '');
                    //alert(addr +":"+newhexvalue);
                    writeInstruction(addr, newhexvalue);
                    $("#popup_writeinstruction").hide();
                    readInstruction(addr, true);
                });

                $("#popup_writeinstruction").find("button#cancel").unbind("click").click(function () {
                    //$("#maskview").hide();
                    $("#popup_writeinstruction").hide();
                });


                $("#popup_writeinstruction").show();
                if (addr) {
                    $("label#patchaddress").text("0x" + addr.toString(16));
                }
                if (hexvalue) {
                    $("input#hexvalue").val(hexvalue);
                }
                if (inst) {
                    $("input#Instvalue").val(inst);
                }

            } else {
                //$("#maskview").hide();
                $("#popup_writeinstruction").hide();
            }
        }

        function writeInstruction(addr, hexvalue) {
            h5gg.require(7.9);

            patchBytes(addr, hexvalue);

            /********************************************************/
            //only jailbroken devices or under Debug state (or JIT) can do this
            function patchBytes(addr, hex) {
                for (i = 0; i < hex.length / 2; i++) {
                    var item = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
                    //alert("length:"+hex.length+",item:"+item+",addr+i:"+Number(addr+i).toString(16)+",i:"+i);
                    h5gg.setValue(addr + i, item, "U8");
                }
            }
            /********************************************************/
        }

        function quickARMInput(value) {
            switch (value) {
                case "nop":
                    $("input#hexvalue").val("1F2003D5");
                    $("input#Instvalue").val("nop");
                    break;
                case "ret":
                    $("input#hexvalue").val("C0035FD6");
                    $("input#Instvalue").val("ret");
                    break;
                case "retTrue":
                    $("input#hexvalue").val("200080D2 C0035FD6");
                    $("input#Instvalue").val("mov x0, #1\nret");
                    break;
                case "retFalse":
                    $("input#hexvalue").val("000080D2 C0035FD6");
                    $("input#Instvalue").val("mov x0, #0\nret");
                    break;
                case "custom":
                    $("input#hexvalue").val("007D80D2");
                    $("input#Instvalue").val("mov x0, #1000");
                    break;
            }


            toggleDropdown();
        }

        /* When the user clicks on the button, 
        toggle between hiding and showing the dropdown content */
        function toggleDropdown() {
            //document.getElementById("dropdown-list").classList.toggle("show");
            var div = document.getElementById("dropdown-list");
            if (div.style.display === "none") {
                div.style.display = "block";
            } else {
                div.style.display = "none";
            }
        }

        function onConvertARM64toHEX() {
            var inst = $("input#Instvalue").val();
            var hex;
            if (inst) {
                hex = convertARM64toHEX(inst.trim().toLowerCase());
            }


            if (!hex) {
                hex = "";
                alert("Not a valid instruction");
            }
            $("input#hexvalue").val(hex);

        }

        //Simple ARM64 to HEX function, can only handle MOV, ADD, SUB, NOP, RET for X and W Register
        function convertARM64toHEX(arm64) {
            //var arm64 = document.getElementById('arm64').value.trim().toLowerCase();
            var hex;
            if (arm64.startsWith("mov")) {
                var operands = arm64.trim().split(/[\s,]+/);
                if (operands[2].startsWith("x") || operands[2].startsWith("w")) { // Two register operands
                    var rd = bigInt(parseInt(operands[1].substring(1).trim().replace("x", "").replace("w", "").replace("s", "").replace("d", ""), 10));
                    var rn = bigInt(parseInt(operands[2].substring(1).trim().replace("x", "").replace("w", "").replace("s", "").replace("d", ""), 10));
                    if (operands[1].startsWith("w")) {
                        hex = bigInt(0x2A0003e0);
                    } else if (operands[1].startsWith("x")) {
                        hex = bigInt(0xAA0003e0);
                    }
                    hex = hex.or(rd.shiftLeft(rd.greaterOrEquals(bigInt(31)) ? bigInt(5) : bigInt(0))); // Shift rd value to bits 0-4 for x registers, or to bits 5-9 for w registers
                    hex = hex.or(rn.shiftLeft(bigInt(16)));


                } else if (operands[2].startsWith("#")) { // register + imm operands
                    var rd = bigInt(parseInt(operands[1].substring(1).trim().replace("x", "").replace("w", "").replace("s", "").replace("d", ""), 10));
                    var imm = bigInt(parseInt(operands[2].substring(1).trim(), 10));
                    if (imm < 0) {
                        imm = (imm.and(bigInt("0xffffffffffffffff")));
                    }
                    if (operands[1].startsWith("w")) {
                        hex = bigInt(0x52800000);
                        hex = hex.or(bigInt("0x52").shiftLeft(bigInt(24))); // Set opc bits to 0xd2
                        hex = hex.or(rd.shiftLeft(rd.greaterOrEquals(bigInt(31)) ? bigInt(5) : bigInt(0))); // Shift rd value to bits 0-4 for x registers, or to bits 5-9 for w registers
                        hex = hex.or(((imm.shiftRight(bigInt(12))).and(bigInt(0x3ff))).shiftLeft(bigInt(10))); // Shift immediate value to bits 10-21
                        hex = hex.or((imm.and(bigInt(0xfff))).shiftLeft(bigInt(5))); // Shift immediate value to bits 5-9 for x registers, or to bits 0-4 for w registers
                    } else if (operands[1].startsWith("x")) {
                        hex = bigInt(0xD2800000);
                        hex = hex.or(bigInt("0xd2").shiftLeft(bigInt(24))); // Set opc bits to 0xd2
                        hex = hex.or(rd.shiftLeft(rd.greaterOrEquals(bigInt(31)) ? bigInt(5) : bigInt(0))); // Shift rd value to bits 0-4 for x registers, or to bits 5-9 for w registers
                        hex = hex.or(((imm.shiftRight(bigInt(12))).and(bigInt(0x3ff))).shiftLeft(bigInt(10))); // Shift immediate value to bits 10-21
                        hex = hex.or((imm.and(bigInt(0xfff))).shiftLeft(bigInt(5))); // Shift immediate value to bits 5-9 for x registers, or to bits 0-4 for w registers

                    }
                }
            } else if (arm64.startsWith("add")) {
                var operands = arm64.trim().split(/[\s,]+/);
                console.log(operands[0] + " : " + operands[1] + " : " + operands[2] + " : " + operands[3]);
                var rd = bigInt(parseInt(operands[1].substring(1).trim().replace("x", "").replace("w", "").replace("s", "").replace("d", ""), 10));
                var rn = bigInt(parseInt(operands[2].substring(1).trim().replace("x", "").replace("w", "").replace("s", "").replace("d", ""), 10));
                if (operands[3].startsWith("#")) {
                    var imm = bigInt(parseInt(operands[3].substring(1), 10));
                    if (imm.greaterOrEquals(bigInt(4096)) || imm.lesser(bigInt(-4096))) {
                        console.log("Error: Immediate value out of range");
                        return;
                    }
                    if (imm.lesser(bigInt(0))) {
                        imm = bigInt(4096).plus(imm);
                    }
                    if (operands[1].startsWith("w")) {
                        hex = bigInt(0x11000000);
                    } else if (operands[1].startsWith("x")) {
                        hex = bigInt(0x91000000);
                    }

                    hex = hex.or(rd.shiftLeft(rd.greaterOrEquals(bigInt(31)) ? bigInt(5) : bigInt(0))); // Shift rd value to bits 0-4 for x registers, or to bits 5-9 for w registers
                    hex = hex.or(rn.shiftLeft(bigInt(5)));
                    hex = hex.or(imm.shiftLeft(bigInt(10)));
                } else {
                    var rm = bigInt(parseInt(operands[3].substring(1).trim().replace("x", "").replace("w", "").replace("s", "").replace("d", ""), 10));
                    if (operands[1].startsWith("w")) {
                        hex = bigInt(0x0B000000);
                    } else if (operands[1].startsWith("x")) {
                        hex = bigInt(0x8B000000);
                    }

                    hex = hex.or(rd.shiftLeft(rd.greaterOrEquals(bigInt(31)) ? bigInt(5) : bigInt(0))); // Shift rd value to bits 0-4 for x registers, or to bits 5-9 for w registers
                    hex = hex.or(rm.shiftLeft(bigInt(16)));
                    hex = hex.or(rn.shiftLeft(bigInt(5)));
                    hex = hex.or(bigInt(0x2000000));
                }
                hex = hex.toString(16).padStart(8, "0");
            } else if (arm64.startsWith("sub")) {
                var operands = arm64.trim().split(/[\s,]+/);
                console.log(operands[0] + " : " + operands[1] + " : " + operands[2] + " : " + operands[3]);
                var rd = bigInt(parseInt(operands[1].substring(1).trim().replace("x", "").replace("w", "").replace("s", "").replace("d", ""), 10));
                var rn = bigInt(parseInt(operands[2].substring(1).trim().replace("x", "").replace("w", "").replace("s", "").replace("d", ""), 10));
                if (operands[3].startsWith("#")) {
                    var imm = bigInt(parseInt(operands[3].substring(1), 10));
                    if (imm.greaterOrEquals(bigInt(4096)) || imm.lesser(bigInt(-4096))) {
                        console.log("Error: Immediate value out of range");
                        return;
                    }
                    if (imm.lesser(bigInt(0))) {
                        imm = bigInt(4096).plus(imm);
                    }
                    if (operands[1].startsWith("w")) {
                        hex = bigInt(0x51000000);
                    } else if (operands[1].startsWith("x")) {
                        hex = bigInt(0xD1000000);
                    }
                    hex = hex.or(rd.shiftLeft(rd.greaterOrEquals(bigInt(31)) ? bigInt(5) : bigInt(0))); // Shift rd value to bits 0-4 for x registers, or to bits 5-9 for w registers
                    hex = hex.or(rn.shiftLeft(bigInt(5)));
                    hex = hex.or(imm.shiftLeft(bigInt(10)));
                } else {
                    var rm = bigInt(parseInt(operands[3].substring(1).trim().replace("x", "").replace("w", "").replace("s", "").replace("d", ""), 10));
                    if (operands[1].startsWith("w")) {
                        hex = bigInt(0x4B000000);
                    } else if (operands[1].startsWith("x")) {
                        hex = bigInt(0xCB000000);
                    }

                    hex = hex.or(rd.shiftLeft(rd.greaterOrEquals(bigInt(31)) ? bigInt(5) : bigInt(0))); // Shift rd value to bits 0-4 for x registers, or to bits 5-9 for w registers
                    hex = hex.or(rm.shiftLeft(bigInt(16)));
                    hex = hex.or(rn.shiftLeft(bigInt(5)));
                    hex = hex.or(bigInt(0x2000000));
                }
                hex = hex.toString(16).padStart(8, "0");
            } else if (arm64 == "nop") {
                hex = "D503201F"
            } else if (arm64 == "ret") {
                hex = "D65F03C0"
            }
            //At this point hex is in Big Endian form

            //We need little Endian form
            var littleHex = "";

            hex = hex.toString(16).toUpperCase();

            if (hex) {
                for (i = hex.length / 2 - 1; i >= 0; i--) {
                    littleHex = littleHex.concat(hex.substring(i * 2, i * 2 + 2));

                }
                hex = littleHex;
            }

            return hex;
        }

        function onShowDebugInfo(show) {
            if (show) {
                $("#maskview").show();
                $("#popup_debuginfo").show();

                refreshDebugInfo();
            } else {
                $("#maskview").hide();
                $("#popup_debuginfo").hide();
            }
        }

        function refreshDebugInfo() {
            $("#popup_progress").show();
            $("table#debuginfoList tr").remove();
            var row = '<tr><td >Message</td><td >Address</td></tr>';
            $("table#debuginfoList tbody").append(row);
            let debugSummary = [];
            for (var i = 0; i < gDebug.length; i++) {
                if (!debugSummary[gDebug[i].text])
                    debugSummary[gDebug[i].text] = { count: 1, address: [], objData: [] };
                else
                    debugSummary[gDebug[i].text].count = debugSummary[gDebug[i].text].count + 1;

                for (var j = 0; j < gDebug[i].address.length; j++) {
                    debugSummary[gDebug[i].text].address[j] = gDebug[i].address[j];
                    if (typeof gDebug[i].objData != 'undefined')
                        debugSummary[gDebug[i].text].objData[j] = gDebug[i].objData[j];
                    else debugSummary[gDebug[i].text].objData[j] = '';
                }
            }

            let loadedImages = getLoadedAssemblyImages()

            const keys = Object.keys(debugSummary);
            for (var j = 0; j < keys.length; j++) {
                var item = keys[j];
                let tmp;

                for (var i = 0; i < debugSummary[item].address.length; i++) {
                    if (!tmp)
                        tmp = '<a href=# onclick="onShowMemoryInfo(true,' + debugSummary[item].address[i] + ',\'' + debugSummary[item].objData[i] + '\')">' + debugSummary[item].address[i] + '</a>';
                    else
                        tmp = tmp + ', ' + '<a href=# onclick="onShowMemoryInfo(true,' + debugSummary[item].address[i] + ',\'' + debugSummary[item].objData[i] + '\')">' + debugSummary[item].address[i] + '</a>';
                }
                if (item.indexOf("[*]") == 0) {
                    let itemImage = itemGetImageName(item)
                    if (loadedImages.includes(itemImage)) row = '<tr bgcolor=\"yellow\"'
                    else row = '<tr '
                    row += ' onclick="loadAssemblyImage(\'' + itemImage + '\')"><td >' + item + ' (' + debugSummary[item].count + ')</td><td >' + tmp + '</td></tr>';
                } else
                    row = '<tr><td >' + item + ' (' + debugSummary[item].count + ')</td><td >' + tmp + '</td></tr>';

                $("table#debuginfoList tbody").append(row);
            }

            $("#popup_progress").hide();

            function itemGetImageName(item) {
                let imageName = item.lastIndexOf("[")
                imageName = item.substring(3, imageName).trim()
                return imageName
            }
            function getLoadedAssemblyImages() {
                let images = [];
                let keys = Object.keys(gUnityClasses);
                for (let i = 0; i < keys.length; i++) {
                    if (!images.includes(gUnityClasses[keys[i]].klassImageName))
                        images.push(gUnityClasses[keys[i]].klassImageName)
                }
                return images
            }
        }

        function onClickClearDebugInfo() {
            gDebug = [];
            $("table#debuginfoList tr").remove();
            var row = '<tr><td >Message</td><td >Address</td></tr>';
            $("table#debuginfoList tbody").append(row);
        }

        function onShowMemoryInfo(show, address, objData) {
            var popupMem = document.getElementById("popup_memoryinfo");
            var popupUnity = document.getElementById("popup_unityobjectinfo");
            if (show) {
                popupUnity.style.zIndex = ""
                popupMem.style.zIndex = getRealZIndex(popupUnity) + 1
                $("#maskview").show();
                $("#popup_memoryinfo").show();
                $("#popup_memoryinfo").find("button#btnUnityObj").unbind("click").click(function () {
                    var input = $("label#memaddress").text();
                    var result = onShowUnityObjInfo(true, input, true);
                });

                refreshMemoryInfo(address, objData);
            } else {
                popupMem.style.zIndex = ""
                $("#maskview").hide();
                $("#popup_memoryinfo").hide();
            }
        }

        function refreshMemoryInfo(address, objData) {
            $("#popup_progress").show();
            if (address) {
                address = "0x" + address.toString(16);
                $("label#memaddress").text(address);
            } else {
                address = $("label#memaddress").text();
            }
            $("label#memoffset").text("0");
            $("table#memoryinfoList tr").remove();
            var row = '<tr><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th></tr>';
            $("table#memoryinfoList tbody").append(row);

            if (typeof objData === 'undefined' || !objData || objData.length == 0) {

                objData = get_objectdata(address.toString(16)); //[NOTE: TO BE UPDATED]
            }


            var objDataAry = objData.trim().toUpperCase().split(" ");
            row = '<tr>';
            for (var i = 0; i < objDataAry.length; i++) {
                if (i > 0 && i % 16 == 0) {
                    row = row + '</tr>';
                    $("table#memoryinfoList tbody").append(row);
                    row = '<tr><td offset=' + i.toString(16) + '>' + objDataAry[i] + '</td>';
                } else {
                    row = row + '<td offset=' + i.toString(16) + '>' + objDataAry[i] + '</td>';
                }
            }
            row = row + '</tr>';
            $("table#memoryinfoList tbody").append(row);

            $("#popup_progress").hide();
        }

        function refreshUnityObjInfo(address, isConfirmedObjAddr) {

            $("#popup_progress").show();
            if ((window.gUnityObjNav.length == 0) || (window.gUnityObjNav[window.gUnityObjNav.length - 1] != address))
                window.gUnityObjNav.push(address);

            var unityObjInfo = get_UnityObjInfo(address, isConfirmedObjAddr);
            if (unityObjInfo.length == 0) {
                $("label#objclassname").text("Placeholder");
                $("label#objaddress").text("Placeholder");
                $("table#unityobjectinfoList tr").remove();
                $("#popup_progress").hide();
                return false;
            }
            unityObjInfo = unityObjInfo[0];

            //if (!lastoffset) lastoffset = unityObjInfo.objectOffset;
            $("label#objclassname").text(unityObjInfo.objectClassName);
            $("label#objaddress").text(unityObjInfo.object.toString(16));
            $("table#unityobjectinfoList tr").remove();
            var row = '<tr><th>Offset</th><th>Name</th><th>Value</th><th>Type</th><th>Access</th></tr>'
            $("table#unityobjectinfoList tbody").append(row);
            for (let i = 0; i < unityObjInfo.fieldDetails.length; i++) {
                if (unityObjInfo.objectOffset == unityObjInfo.fieldDetails[i].offset && unityObjInfo.objectOffset != 0x0) row = '<tr bgcolor=\"yellow\">'
                else row = '<tr>';
                row += '<td onclick="onShowEditUnityObjField(' + unityObjInfo.fieldDetails[i].fieldValue + ',' + unityObjInfo.fieldDetails[i].offset + ',\'' + unityObjInfo.fieldDetails[i].fieldClassName + '\')">' + unityObjInfo.fieldDetails[i].offset + '</td>';


                row += '<td>' + unityObjInfo.fieldDetails[i].fieldName + '</td>';
                let tmpNameSpace = unityObjInfo.fieldDetails[i].fieldNameSpace.replace(/\./g, '$');
                if (isObjectClass(tmpNameSpace + "$" + unityObjInfo.fieldDetails[i].fieldClassName) && unityObjInfo.fieldDetails[i].fieldValue != 0x0)
                    //row += '<td style="color:blue" onclick=\"refreshUnityObjInfo(' + unityObjInfo.fieldDetails[i].fieldValue + ',' + unityObjInfo.fieldDetails[i].offset + ')\">' + unityObjInfo.fieldDetails[i].fieldValue + '</td>';
                    row += '<td style="color:blue" onclick=\"refreshUnityObjInfo(' + unityObjInfo.fieldDetails[i].fieldValue + ',true)\">' + unityObjInfo.fieldDetails[i].fieldValue + '</td>';
                else if (isMemoryAddress(unityObjInfo.fieldDetails[i].fieldValue))
                    row += '<td style="color:orange" onclick=\"onShowMemoryInfo(true,' + unityObjInfo.fieldDetails[i].fieldValue + ')\">' + unityObjInfo.fieldDetails[i].fieldValue + '</td>';
                else
                    row += '<td>' + unityObjInfo.fieldDetails[i].fieldValue + '</td>';
                row += '<td>' + unityObjInfo.fieldDetails[i].fieldClassName + '</td>';
                row += '<td>' + unityObjInfo.fieldDetails[i].access + '</td></tr>';
                $("table#unityobjectinfoList tbody").append(row);
            }
            if (unityObjInfo.objectOffset == 0)
                $("#offsetPath").html('')
            else
                $("#offsetPath").html('Data value located at offset - ' + unityObjInfo.objectOffset);

            $("#popup_progress").hide();
            return true;

            function isObjectClass(className) {
                var klassInfo = gUnityClasses[className];
                if (klassInfo) {
                    return true;
                }
                return false;
            }
            function isMemoryAddress(Addr) {
                if (Addr > 0x100000000 && Addr < 0x3F0000000) return true;
                return false
            }
        }

        function onShowEditMemoryInfo(show) {
            var address = $("label#memaddress").text();
            var offset = $("label#memoffset").text();
            address = parseInt(address, 16) + parseInt(offset, 16);
            var datatype = "I16";
            var datavalue = 0;
            if (typeof h5gg != 'undefined')
                datavalue = h5gg.getValue(address, h5ggType(datatype));

            var popup = document.getElementById("popup_search_edit");

            popup.style.zIndex = 15000

            showPopView("&nbsp;&nbsp;Edit&nbsp;&nbsp;", function (type, value) {

                if (!h5gg.setValue(address, value, h5ggType(type))) {
                    alert("The modification failed, the address may be invalid!");
                }
                refreshMemoryInfo();
            }, datatype, datavalue);
        }

        function onShowSearchHexUTF8(show) {
            if (show) {

                $("#popup_searchhexutf8").find("button#actionHex").unbind("click").click(function () {
                    var input = $("#hexTextInput").val();
                    var type = $('input[name=radio-hexutf8]:checked').val();
                    if (searchHexUTF8(type))
                        alert("Search: " + input + " successfully.\nYou may find result in DebugInfo window");
                    else
                        alert("Search: " + input + " failed.\nPlease check your input.");

                });

                $("#maskview").show();
                $("#popup_searchhexutf8").show();


            } else {
                $("#maskview").hide();
                $("#popup_searchhexutf8").hide();
            }
        }

        function onShowUnityObjInfo(show, address, isConfirmedObjAddr) {
            var popupMem = document.getElementById("popup_memoryinfo");
            var popupUnity = document.getElementById("popup_unityobjectinfo");
            if (show) {
                popupMem.style.zIndex = ""
                popupUnity.style.zIndex = getRealZIndex(popupMem) + 1
                $("#maskview").show();
                $("#popup_unityobjectinfo").show();
                $("#popup_unityobjectinfo").find("button#action").unbind("click").click(function () {
                    var input = $("label#objaddress").text();
                    if (!isNaN(input))
                        var result = refreshUnityObjInfo(input, isConfirmedObjAddr);
                });

                if (address) {
                    if (address == -1) {
                        if (window.gUnityObjNav.length > 1) {
                            var tmp = window.gUnityObjNav.pop();
                            address = window.gUnityObjNav[window.gUnityObjNav.length - 1];
                        }
                        else return;
                    }
                    var result = refreshUnityObjInfo(address, isConfirmedObjAddr);
                }

            } else {
                popupUnity.style.zIndex = ""
                $("#maskview").hide();
                $("#popup_unityobjectinfo").hide();
                $("#popup_locateunityobject").hide();
            }
        }

        function onShowLocateUnityObj(show) {
            var popupLocate = document.getElementById("popup_locateunityobject");
            var popupUnity = document.getElementById("popup_unityobjectinfo");
            if (show) {
                popupUnity.style.zIndex = ""
                popupLocate.style.zIndex = getRealZIndex(popupUnity) + 1

                //$("#maskview").show();
                $("#popup_locateunityobject").show();
                $("#popup_locateunityobject").find("button#btnLocate").unbind("click").click(function () {
                    var input = $("#searchUnityObjAddress").val();
                    if (input == "0x") return;
                    if (isNaN(input)) {
                        input = findUnityObjectOfType(input.trim());
                        if (input.length == 0) {
                            alert("Cannot Found Object of this Type");
                            return
                        }
                        input = input[0];
                    }
                    var result = refreshUnityObjInfo(input);
                    if (result)
                        $("#popup_locateunityobject").hide();
                    else
                        alert("Search: " + input + " failed.\nPlease check your input.");

                });

            } else {
                $("#popup_locateunityobject").hide();
            }
        }

        function onShowEditUnityObjField(datavalue, offset, type) {
            var address = $("label#objaddress").text();

            address = parseInt(address, 16) + offset;

            var datatype = getEditType(type);
            if (datatype == "string") return;

            var popup = document.getElementById("popup_search_edit");

            popup.style.zIndex = 15000

            //popup.style.zIndex = "100";//move pop up edit to front

            showPopView("&nbsp;&nbsp;Edit&nbsp;&nbsp;", function (type, value) {

                if (!h5gg.setValue(address, value, h5ggType(type))) {
                    alert("The modification failed, the address may be invalid!");
                }

                refreshUnityObjInfo($("label#objaddress").text());
            }, datatype, datavalue);

            function getEditType(type) {

                switch (type.toLowerCase()) {
                    case "boolean":
                        return "I8";
                    case "int32":
                        return "I32";
                    case "biginteger":
                        return "I64";
                    case "single":
                        return "F32";
                    case "double":
                        return "F64";
                    case "string":
                        return "string"
                    default:
                        return "I16";
                }
            }
        }

        /***************************************************************
         * Core Frida Related Function defined to support enhanced menu features
         * 
         * *************************************************************/

        function readInstruction(value, virtual) {

            $("#popup_progress").show();
            $("table#instructionList tr").remove();
            var row = '<tr><td style="border-right-style:none;">Address</td><td style="border-left-style:none;">Bytes</td><td style="border-left-style:none;">Instruction</td></tr>';
            $("table#instructionList tbody").append(row);

            h5gg.require(7.9);
            var h5frida = h5gg.loadPlugin("h5frida", "h5frida-16.0.10.dylib");
            if (!h5frida) throw "å è½½h5fridaæä»¶å¤±è´¥\n\nFailed to load h5frida plugin";


            if (!h5frida.loadGadget("frida-gadget-16.0.10.dylib"))
                throw "å è½½frida-gadgetå®æ¤æ¨¡åå¤±è´¥\n\nFailed to load frida-gadget daemon module";

            var procs = h5frida.enumerate_processes();
            if (!procs || !procs.length) throw "fridaæ æ³è·åè¿ç¨åè¡¨\n\nfrida can't get process list";

            var frontapp = h5frida.get_frontmost_application();

            if (!frontapp) throw "frida can't get frontapp";
            // ADDED TO TEST NEED REVISIT
            var pid = frontapp.pid;

            while (pid > 0) {
                frontapp = h5frida.get_frontmost_application();
                if (frontapp && frontapp.pid == pid) break;

                alert("è¯·å°ç®æ APPåæ¢è³åå°è¿è¡, åç¹å»ç¡®å®ç»§ç»­...\n"
                    + "Please switch the target APP to the foreground to run, and then click OK to continue...");
            }
            // END ADDED TO TEST NEED REVISIT
            var session = h5frida.attach(frontapp.pid);
            if (!session) throw "fridaéå è¿ç¨å¤±è´¥\n\nfrida attach process failed.";

            //çå¬fridaç®æ è¿ç¨è¿æ¥ç¶æ, æ¯å¦å¼å¸¸éåº
            session.on("detached", function (reason) {
                //alert("fridaç®æ è¿ç¨ä¼è¯å·²ç»æ­¢(frida target process session terminated):\n"+reason);
                gIl2cppInit = false;
            });

            var frida_script_line = h5gg_frida_script("getline"); //safari console will auto add 2 line
            var frida_script_code = "(" + h5gg_frida_script.toString() + ")()"; //å°fridaèæ¬è½¬æ¢æå­ç¬¦ä¸²
            var script = session.create_script(frida_script_code); //æ³¨å¥fridaçjsèæ¬ä»£ç 

            if (!script) throw "fridaæ³¨å¥èæ¬å¤±è´¥\n\nfrida inject script failed!";

            /*å¯å¨èæ¬ååè®¾ç½®fridaèæ¬æ¶æ¯æ¥æ¶å½æ°, ä¸è¦å¨fridaèæ¬éåå¤ªå¤é«é¢æ¶æ¯è¿æ¥è®©h5ggå¼¹åºalert, æ¶æ¯å¤ªå¤è®©alerté»å¡å¨åå°åå­ä¼çå¯¼è´éªéå´©æº
            Set the frida script message receiving function before starting the script,
            Don't send too many high-frequency messages in the frida script to let h5gg show alerts,
            because too many messages to alert will block h5frida in the background, and cause out-of-memory and crashes.
            */
            script.on('message', function (msg) {
                if (msg.type == 'error') {
                    script.unload(); //å¦æèæ¬åçéè¯¯å°±åæ­¢fridaèæ¬
                    try { if (msg.fileName == "/h5gg_frida_script.js") msg.lineNumber += frida_script_line - 1; } catch (e) { }
                    if (Array.isArray(msg.info)) msg.info.map(function (item) {
                        try {
                            if (item.fileName == "/h5gg_frida_script.js")
                                item.lineNumber += frida_script_line - 1;
                        } catch (e) { }; return item;
                    });
                    var errmsg = JSON.stringify(msg, null, 1).replace(/\/frida_script\.js\:(\d+)/gm,
                        function (m, c, o, a) { return "/h5gg_frida_script.js:" + (Number(c) + frida_script_line - 1); });
                    alert("frida(èæ¬éè¯¯)script error:\n" + errmsg.replaceAll("\\n", "\n"));
                }

                if (msg.type == 'send')
                    //alert("frida(èæ¬æ¶æ¯)srcipt msg:\n"+JSON.stringify(msg.payload,null,1));
                    recv_frida_data(msg.payload);
                if (msg.type == 'log')
                    alert("frida(èæ¬æ¥å¿)script log:\n" + msg.payload);
            });

            if (!script.load()) throw "fridaå¯å¨èæ¬å¤±è´¥\n\nfrida load script failed"; //å¯å¨èæ¬

            /**********************************************************************************/

            //è·åfridaèæ¬ä¸­çrpc.exportså¯¼åºå½æ°åè¡¨
            //alert("fridaèæ¬å¯¼åºå½æ°åè¡¨:\nfrida export method list:\n" + script.list_exports());

            var modules = h5gg.getRangesList("UnityFramework"); //module file name
            if (typeof modules[0] === "undefined") modules = h5gg.getRangesList(0);
            var base = modules[0].start; //module base addr in runtime memory

            if (virtual) {
                $("label#previousaddress").text($("input#addressvalue").val());
                value = Number(value) - Number(base);

            }
            if (!value.toString(16).includes("0x")) $("input#addressvalue").val("0x" + value.toString(16))
            else $("input#addressvalue").val(value.toString(16));

            var addr = Number(base) + Number(value); //offset

            setTimeout(function () {

                var results = script.call("getInstruction", [addr]);
                setTimeout(function () {

                    for (var i = 0; i < results.length; i++) {
                        var row;
                        if (i == 10) {
                            row = '<tr bgcolor=\"yellow\">';
                        } else {
                            row = '<tr>';
                        }
                        if (results[i].inst.includes("#0x") && results[i].inst.substring(results[i].inst.indexOf("#0x") + 1).length > 6) {
                            var tmp = results[i].inst.indexOf("#0x");
                            tmp = results[i].inst.substring(tmp + 1);
                            row = row + '<td style="border-right-style:none;color:blue" onclick=\"readInstruction(' + results[i].address + ',true)\">' + results[i].address + '</td><td style="border-left-style:none;" onclick=\"onShowWriteInstruction(true,' + results[i].address + ',\'' + results[i].hex + '\',\'' + results[i].inst + '\')\">' + results[i].hex + '</td><td style="border-left-style:none;color:blue" onclick=\"readInstruction(' + tmp + ',true)\">' + results[i].inst + '</td></tr>';

                        } else {
                            row = row + '<td style="border-right-style:none;color:blue" onclick=\"readInstruction(' + results[i].address + ',true)\">' + results[i].address + '</td><td style="border-left-style:none;" onclick=\"onShowWriteInstruction(true,' + results[i].address + ',\'' + results[i].hex + '\',\'' + results[i].inst + '\')\">' + results[i].hex + '</td><td style="border-left-style:none;">' + results[i].inst + '</td></tr>';
                        }

                        $("table#instructionList tbody").append(row);

                    }
                    $("#popup_progress").hide();


                }, 200);
            }, 200);
        }

        function loadAssemblyImage(imageName) {
            var confirmed = confirm("Are you sure you want to load additional image library -> \n" + imageName + "?");
            if (confirmed) {
                var script = initializeUnitySupport();
                gUnityClasses = script.call("listUnityClasses", [imageName, true])
                gUnityAssemblyImages.push(imageName)
                alert("Load image: " + imageName + " successfully!")
            }
        }

        function get_objectdata(address) {


            h5gg.require(7.9);
            var h5frida = h5gg.loadPlugin("h5frida", "h5frida-16.0.10.dylib");

            if (!h5frida) throw "å è½½h5fridaæä»¶å¤±è´¥\n\nFailed to load h5frida plugin";


            if (!h5frida.loadGadget("frida-gadget-16.0.10.dylib"))
                throw "å è½½frida-gadgetå®æ¤æ¨¡åå¤±è´¥\n\nFailed to load frida-gadget daemon module";

            var procs = h5frida.enumerate_processes();
            if (!procs || !procs.length) throw "fridaæ æ³è·åè¿ç¨åè¡¨\n\nfrida can't get process list";

            var frontapp = h5frida.get_frontmost_application();

            if (!frontapp) throw "frida can't get frontapp";

            var session = h5frida.attach(frontapp.pid);
            if (!session) throw "fridaéå è¿ç¨å¤±è´¥\n\nfrida attach process failed.";

            //çå¬fridaç®æ è¿ç¨è¿æ¥ç¶æ, æ¯å¦å¼å¸¸éåº
            session.on("detached", function (reason) {
                //alert("fridaç®æ è¿ç¨ä¼è¯å·²ç»æ­¢(frida target process session terminated):\n"+reason);
                gIl2cppInit = false;
            });

            var frida_script_line = h5gg_frida_script("getline"); //safari console will auto add 2 line
            var frida_script_code = "(" + h5gg_frida_script.toString() + ")()"; //å°fridaèæ¬è½¬æ¢æå­ç¬¦ä¸²
            var script = session.create_script(frida_script_code); //æ³¨å¥fridaçjsèæ¬ä»£ç 

            if (!script) throw "fridaæ³¨å¥èæ¬å¤±è´¥\n\nfrida inject script failed!";

            /*å¯å¨èæ¬ååè®¾ç½®fridaèæ¬æ¶æ¯æ¥æ¶å½æ°, ä¸è¦å¨fridaèæ¬éåå¤ªå¤é«é¢æ¶æ¯è¿æ¥è®©h5ggå¼¹åºalert, æ¶æ¯å¤ªå¤è®©alerté»å¡å¨åå°åå­ä¼çå¯¼è´éªéå´©æº
            Set the frida script message receiving function before starting the script,
            Don't send too many high-frequency messages in the frida script to let h5gg show alerts,
            because too many messages to alert will block h5frida in the background, and cause out-of-memory and crashes.
            */
            script.on('message', function (msg) {
                if (msg.type == 'error') {
                    script.unload(); //å¦æèæ¬åçéè¯¯å°±åæ­¢fridaèæ¬
                    try { if (msg.fileName == "/h5gg_frida_script.js") msg.lineNumber += frida_script_line - 1; } catch (e) { }
                    if (Array.isArray(msg.info)) msg.info.map(function (item) {
                        try {
                            if (item.fileName == "/h5gg_frida_script.js")
                                item.lineNumber += frida_script_line - 1;
                        } catch (e) { }; return item;
                    });
                    var errmsg = JSON.stringify(msg, null, 1).replace(/\/frida_script\.js\:(\d+)/gm,
                        function (m, c, o, a) { return "/h5gg_frida_script.js:" + (Number(c) + frida_script_line - 1); });
                    alert("frida(èæ¬éè¯¯)script error:\n" + errmsg.replaceAll("\\n", "\n"));
                }

                if (msg.type == 'send')
                    //alert("frida(èæ¬æ¶æ¯)srcipt msg:\n"+JSON.stringify(msg.payload,null,1));
                    recv_frida_data(msg.payload);
                if (msg.type == 'log')
                    alert("frida(èæ¬æ¥å¿)script log:\n" + msg.payload);
            });

            if (!script.load()) throw "fridaå¯å¨èæ¬å¤±è´¥\n\nfrida load script failed"; //å¯å¨èæ¬

            /**********************************************************************************/

            //è·åfridaèæ¬ä¸­çrpc.exportså¯¼åºå½æ°åè¡¨
            //alert("fridaèæ¬å¯¼åºå½æ°åè¡¨:\nfrida export method list:\n" + script.list_exports());

            var objectData = script.call("getObjectData", [address]);

            return objectData;
        }

        function searchHexUTF8(Type) {
            h5gg.require(7.9);
            var h5frida = h5gg.loadPlugin("h5frida", "h5frida-16.0.10.dylib");
            if (!h5frida) throw "å è½½h5fridaæä»¶å¤±è´¥\n\nFailed to load h5frida plugin";


            if (!h5frida.loadGadget("frida-gadget-16.0.10.dylib"))
                throw "å è½½frida-gadgetå®æ¤æ¨¡åå¤±è´¥\n\nFailed to load frida-gadget daemon module";

            var procs = h5frida.enumerate_processes();
            if (!procs || !procs.length) throw "fridaæ æ³è·åè¿ç¨åè¡¨\n\nfrida can't get process list";

            var frontapp = h5frida.get_frontmost_application();

            if (!frontapp) throw "frida can't get frontapp";

            var session = h5frida.attach(frontapp.pid);
            if (!session) throw "fridaéå è¿ç¨å¤±è´¥\n\nfrida attach process failed.";

            //çå¬fridaç®æ è¿ç¨è¿æ¥ç¶æ, æ¯å¦å¼å¸¸éåº
            session.on("detached", function (reason) {
                //alert("fridaç®æ è¿ç¨ä¼è¯å·²ç»æ­¢(frida target process session terminated):\n"+reason);
                gIl2cppInit = false;
            });

            var frida_script_line = h5gg_frida_script("getline"); //safari console will auto add 2 line
            var frida_script_code = "(" + h5gg_frida_script.toString() + ")()"; //å°fridaèæ¬è½¬æ¢æå­ç¬¦ä¸²
            var script = session.create_script(frida_script_code); //æ³¨å¥fridaçjsèæ¬ä»£ç 

            if (!script) throw "fridaæ³¨å¥èæ¬å¤±è´¥\n\nfrida inject script failed!";

            /*å¯å¨èæ¬ååè®¾ç½®fridaèæ¬æ¶æ¯æ¥æ¶å½æ°, ä¸è¦å¨fridaèæ¬éåå¤ªå¤é«é¢æ¶æ¯è¿æ¥è®©h5ggå¼¹åºalert, æ¶æ¯å¤ªå¤è®©alerté»å¡å¨åå°åå­ä¼çå¯¼è´éªéå´©æº
            Set the frida script message receiving function before starting the script,
            Don't send too many high-frequency messages in the frida script to let h5gg show alerts,
            because too many messages to alert will block h5frida in the background, and cause out-of-memory and crashes.
            */
            script.on('message', function (msg) {
                if (msg.type == 'error') {
                    script.unload(); //å¦æèæ¬åçéè¯¯å°±åæ­¢fridaèæ¬
                    try { if (msg.fileName == "/h5gg_frida_script.js") msg.lineNumber += frida_script_line - 1; } catch (e) { }
                    if (Array.isArray(msg.info)) msg.info.map(function (item) {
                        try {
                            if (item.fileName == "/h5gg_frida_script.js")
                                item.lineNumber += frida_script_line - 1;
                        } catch (e) { }; return item;
                    });
                    var errmsg = JSON.stringify(msg, null, 1).replace(/\/frida_script\.js\:(\d+)/gm,
                        function (m, c, o, a) { return "/h5gg_frida_script.js:" + (Number(c) + frida_script_line - 1); });
                    alert("frida(èæ¬éè¯¯)script error:\n" + errmsg.replaceAll("\\n", "\n"));
                }

                if (msg.type == 'send')
                    //alert("frida(èæ¬æ¶æ¯)srcipt msg:\n"+JSON.stringify(msg.payload,null,1));
                    recv_frida_data(msg.payload);
                if (msg.type == 'log')
                    alert("frida(èæ¬æ¥å¿)script log:\n" + msg.payload);
            });

            if (!script.load()) throw "fridaå¯å¨èæ¬å¤±è´¥\n\nfrida load script failed"; //å¯å¨èæ¬

            /**********************************************************************************/

            var hexUTF8 = {
                sText: "",
                hex: "",
                pointer: "",
            }
            if (Type == "hex") {
                hexUTF8.hex = $("#hexTextInput").val();
            } else if (Type == "pointer") {
                hexUTF8.pointer = get64bitBigEndian($("#hexTextInput").val());
            } else {
                hexUTF8.sText = $("#hexTextInput").val();
            }

            var result = script.call("searchHexUTF8", [hexUTF8]);

            return result;


        }

        function get_UnityObjInfo(address, isConfirmedObjAddr) {

            h5gg.require(7.9);
            var h5frida = h5gg.loadPlugin("h5frida", "h5frida-16.0.10.dylib");

            if (!h5frida) throw "å è½½h5fridaæä»¶å¤±è´¥\n\nFailed to load h5frida plugin";


            if (!h5frida.loadGadget("frida-gadget-16.0.10.dylib"))
                throw "å è½½frida-gadgetå®æ¤æ¨¡åå¤±è´¥\n\nFailed to load frida-gadget daemon module";

            var procs = h5frida.enumerate_processes();
            if (!procs || !procs.length) throw "fridaæ æ³è·åè¿ç¨åè¡¨\n\nfrida can't get process list";

            var frontapp = h5frida.get_frontmost_application();

            if (!frontapp) throw "frida can't get frontapp";

            var session = h5frida.attach(frontapp.pid);
            if (!session) throw "fridaéå è¿ç¨å¤±è´¥\n\nfrida attach process failed.";

            //çå¬fridaç®æ è¿ç¨è¿æ¥ç¶æ, æ¯å¦å¼å¸¸éåº
            session.on("detached", function (reason) {
                //alert("fridaç®æ è¿ç¨ä¼è¯å·²ç»æ­¢(frida target process session terminated):\n"+reason);
                gIl2cppInit = false;
            });

            var frida_script_line = h5gg_frida_script("getline"); //safari console will auto add 2 line
            var frida_script_code = "(" + h5gg_frida_script.toString() + ")()"; //å°fridaèæ¬è½¬æ¢æå­ç¬¦ä¸²
            var script = session.create_script(frida_script_code); //æ³¨å¥fridaçjsèæ¬ä»£ç 

            if (!script) throw "fridaæ³¨å¥èæ¬å¤±è´¥\n\nfrida inject script failed!";

            /*å¯å¨èæ¬ååè®¾ç½®fridaèæ¬æ¶æ¯æ¥æ¶å½æ°, ä¸è¦å¨fridaèæ¬éåå¤ªå¤é«é¢æ¶æ¯è¿æ¥è®©h5ggå¼¹åºalert, æ¶æ¯å¤ªå¤è®©alerté»å¡å¨åå°åå­ä¼çå¯¼è´éªéå´©æº
            Set the frida script message receiving function before starting the script,
            Don't send too many high-frequency messages in the frida script to let h5gg show alerts,
            because too many messages to alert will block h5frida in the background, and cause out-of-memory and crashes.
            */
            script.on('message', function (msg) {
                if (msg.type == 'error') {
                    script.unload(); //å¦æèæ¬åçéè¯¯å°±åæ­¢fridaèæ¬
                    try { if (msg.fileName == "/h5gg_frida_script.js") msg.lineNumber += frida_script_line - 1; } catch (e) { }
                    if (Array.isArray(msg.info)) msg.info.map(function (item) {
                        try {
                            if (item.fileName == "/h5gg_frida_script.js")
                                item.lineNumber += frida_script_line - 1;
                        } catch (e) { }; return item;
                    });
                    var errmsg = JSON.stringify(msg, null, 1).replace(/\/frida_script\.js\:(\d+)/gm,
                        function (m, c, o, a) { return "/h5gg_frida_script.js:" + (Number(c) + frida_script_line - 1); });
                    alert("frida(èæ¬éè¯¯)script error:\n" + errmsg.replaceAll("\\n", "\n"));
                }

                if (msg.type == 'send')
                    //alert("frida(èæ¬æ¶æ¯)srcipt msg:\n"+JSON.stringify(msg.payload,null,1));
                    recv_frida_data(msg.payload);
                if (msg.type == 'log')
                    alert("frida(èæ¬æ¥å¿)script log:\n" + msg.payload);
            });

            if (!script.load()) throw "fridaå¯å¨èæ¬å¤±è´¥\n\nfrida load script failed"; //å¯å¨èæ¬

            /**********************************************************************************/

            //è·åfridaèæ¬ä¸­çrpc.exportså¯¼åºå½æ°åè¡¨
            //alert("fridaèæ¬å¯¼åºå½æ°åè¡¨:\nfrida export method list:\n" + script.list_exports());

            var unityObjectInfo = [];

            var status = true;
            if (!gIl2cppInit) {
                status = script.call("init_via_il2cpp_api");
                if (status) status = script.call("listUnityImages");
                //if (status) gUnityClasses = script.call("listUnityClasses", ["Assembly-CSharp"]);
                if (status) gUnityClasses = script.call("listUnityClasses", [gUnityAssemblyImages]);
                //if (gUnityClasses == 'undefined') gUnityClasses = {}; //handle case that any of the Assembly images cannot load, break
                if (Object.keys(gUnityClasses).length == 0) status = false;
            }

            if (status) {
                gIl2cppInit = true;

                unityObjectInfo = script.call("unityObjExplore", [address, isConfirmedObjAddr]);
                if (!unityObjectInfo) unityObjectInfo = [];
            }
            return unityObjectInfo;

        }

        function findUnityObjectOfType(type) {

            h5gg.require(7.9);
            var h5frida = h5gg.loadPlugin("h5frida", "h5frida-16.0.10.dylib");
            if (!h5frida) throw "å è½½h5fridaæä»¶å¤±è´¥\n\nFailed to load h5frida plugin";


            if (!h5frida.loadGadget("frida-gadget-16.0.10.dylib"))
                throw "å è½½frida-gadgetå®æ¤æ¨¡åå¤±è´¥\n\nFailed to load frida-gadget daemon module";

            var procs = h5frida.enumerate_processes();
            if (!procs || !procs.length) throw "fridaæ æ³è·åè¿ç¨åè¡¨\n\nfrida can't get process list";

            var frontapp = h5frida.get_frontmost_application();

            if (!frontapp) throw "frida can't get frontapp";

            var session = h5frida.attach(frontapp.pid);
            if (!session) throw "fridaéå è¿ç¨å¤±è´¥\n\nfrida attach process failed.";

            //çå¬fridaç®æ è¿ç¨è¿æ¥ç¶æ, æ¯å¦å¼å¸¸éåº
            session.on("detached", function (reason) {
                //alert("fridaç®æ è¿ç¨ä¼è¯å·²ç»æ­¢(frida target process session terminated):\n"+reason);
                gIl2cppInit = false;
            });

            var frida_script_line = h5gg_frida_script("getline"); //safari console will auto add 2 line
            var frida_script_code = "(" + h5gg_frida_script.toString() + ")()"; //å°fridaèæ¬è½¬æ¢æå­ç¬¦ä¸²
            var script = session.create_script(frida_script_code); //æ³¨å¥fridaçjsèæ¬ä»£ç 

            if (!script) throw "fridaæ³¨å¥èæ¬å¤±è´¥\n\nfrida inject script failed!";

            /*å¯å¨èæ¬ååè®¾ç½®fridaèæ¬æ¶æ¯æ¥æ¶å½æ°, ä¸è¦å¨fridaèæ¬éåå¤ªå¤é«é¢æ¶æ¯è¿æ¥è®©h5ggå¼¹åºalert, æ¶æ¯å¤ªå¤è®©alerté»å¡å¨åå°åå­ä¼çå¯¼è´éªéå´©æº
            Set the frida script message receiving function before starting the script,
            Don't send too many high-frequency messages in the frida script to let h5gg show alerts,
            because too many messages to alert will block h5frida in the background, and cause out-of-memory and crashes.
            */
            script.on('message', function (msg) {
                if (msg.type == 'error') {
                    script.unload(); //å¦æèæ¬åçéè¯¯å°±åæ­¢fridaèæ¬
                    try { if (msg.fileName == "/h5gg_frida_script.js") msg.lineNumber += frida_script_line - 1; } catch (e) { }
                    if (Array.isArray(msg.info)) msg.info.map(function (item) {
                        try {
                            if (item.fileName == "/h5gg_frida_script.js")
                                item.lineNumber += frida_script_line - 1;
                        } catch (e) { }; return item;
                    });
                    var errmsg = JSON.stringify(msg, null, 1).replace(/\/frida_script\.js\:(\d+)/gm,
                        function (m, c, o, a) { return "/h5gg_frida_script.js:" + (Number(c) + frida_script_line - 1); });
                    alert("frida(èæ¬éè¯¯)script error:\n" + errmsg.replaceAll("\\n", "\n"));
                }

                if (msg.type == 'send')
                    //alert("frida(èæ¬æ¶æ¯)srcipt msg:\n"+JSON.stringify(msg.payload,null,1));
                    recv_frida_data(msg.payload);
                if (msg.type == 'log')
                    alert("frida(èæ¬æ¥å¿)script log:\n" + msg.payload);
            });

            if (!script.load()) throw "fridaå¯å¨èæ¬å¤±è´¥\n\nfrida load script failed"; //å¯å¨èæ¬

            /**********************************************************************************/

            //è·åfridaèæ¬ä¸­çrpc.exportså¯¼åºå½æ°åè¡¨
            //alert("fridaèæ¬å¯¼åºå½æ°åè¡¨:\nfrida export method list:\n" + script.list_exports());

            var pObj=[];

            var status = true;
            if (!gIl2cppInit) {

                status = script.call("init_via_il2cpp_api");
                if (status) status = script.call("listUnityImages");
                //if (status) gUnityClasses = script.call("listUnityClasses", ["Assembly-CSharp"]);
                if (status) gUnityClasses = script.call("listUnityClasses", [gUnityAssemblyImages]);
                if (Object.keys(gUnityClasses).length == 0) status = false;
            }

            if (status) {
                gIl2cppInit = true;

                pObj = script.call("findUnityObjectOfType", [type]);
            }
            return pObj;//Array of objects

        }//end findUnityObjectOfType

        //Only useful when want to get the script objects 
        function initializeUnitySupport() {

            h5gg.require(7.9);
            var h5frida = h5gg.loadPlugin("h5frida", "h5frida-16.0.10.dylib");
            if (!h5frida) throw "å è½½h5fridaæä»¶å¤±è´¥\n\nFailed to load h5frida plugin";


            if (!h5frida.loadGadget("frida-gadget-16.0.10.dylib"))
                throw "å è½½frida-gadgetå®æ¤æ¨¡åå¤±è´¥\n\nFailed to load frida-gadget daemon module";

            var procs = h5frida.enumerate_processes();
            if (!procs || !procs.length) throw "fridaæ æ³è·åè¿ç¨åè¡¨\n\nfrida can't get process list";

            var frontapp = h5frida.get_frontmost_application();

            if (!frontapp) throw "frida can't get frontapp";

            var session = h5frida.attach(frontapp.pid);
            if (!session) throw "fridaéå è¿ç¨å¤±è´¥\n\nfrida attach process failed.";

            //çå¬fridaç®æ è¿ç¨è¿æ¥ç¶æ, æ¯å¦å¼å¸¸éåº
            session.on("detached", function (reason) {
                //alert("fridaç®æ è¿ç¨ä¼è¯å·²ç»æ­¢(frida target process session terminated):\n"+reason);
                gIl2cppInit = false;
            });

            var frida_script_line = h5gg_frida_script("getline"); //safari console will auto add 2 line
            var frida_script_code = "(" + h5gg_frida_script.toString() + ")()"; //å°fridaèæ¬è½¬æ¢æå­ç¬¦ä¸²
            var script = session.create_script(frida_script_code); //æ³¨å¥fridaçjsèæ¬ä»£ç 

            if (!script) throw "fridaæ³¨å¥èæ¬å¤±è´¥\n\nfrida inject script failed!";

            /*å¯å¨èæ¬ååè®¾ç½®fridaèæ¬æ¶æ¯æ¥æ¶å½æ°, ä¸è¦å¨fridaèæ¬éåå¤ªå¤é«é¢æ¶æ¯è¿æ¥è®©h5ggå¼¹åºalert, æ¶æ¯å¤ªå¤è®©alerté»å¡å¨åå°åå­ä¼çå¯¼è´éªéå´©æº
            Set the frida script message receiving function before starting the script,
            Don't send too many high-frequency messages in the frida script to let h5gg show alerts,
            because too many messages to alert will block h5frida in the background, and cause out-of-memory and crashes.
            */
            script.on('message', function (msg) {
                if (msg.type == 'error') {
                    script.unload(); //å¦æèæ¬åçéè¯¯å°±åæ­¢fridaèæ¬
                    try { if (msg.fileName == "/h5gg_frida_script.js") msg.lineNumber += frida_script_line - 1; } catch (e) { }
                    if (Array.isArray(msg.info)) msg.info.map(function (item) {
                        try {
                            if (item.fileName == "/h5gg_frida_script.js")
                                item.lineNumber += frida_script_line - 1;
                        } catch (e) { }; return item;
                    });
                    var errmsg = JSON.stringify(msg, null, 1).replace(/\/frida_script\.js\:(\d+)/gm,
                        function (m, c, o, a) { return "/h5gg_frida_script.js:" + (Number(c) + frida_script_line - 1); });
                    alert("frida(èæ¬éè¯¯)script error:\n" + errmsg.replaceAll("\\n", "\n"));
                }

                if (msg.type == 'send')
                    //alert("frida(èæ¬æ¶æ¯)srcipt msg:\n"+JSON.stringify(msg.payload,null,1));
                    recv_frida_data(msg.payload);
                if (msg.type == 'log')
                    alert("frida(èæ¬æ¥å¿)script log:\n" + msg.payload);
            });

            if (!script.load()) throw "fridaå¯å¨èæ¬å¤±è´¥\n\nfrida load script failed"; //å¯å¨èæ¬

            /**********************************************************************************/

            //è·åfridaèæ¬ä¸­çrpc.exportså¯¼åºå½æ°åè¡¨

            var status = true;
            if (!gIl2cppInit) {

                status = script.call("init_via_il2cpp_api");
                if (status) status = script.call("listUnityImages");
                //[TODO: Consider to load array of user libray]
                //if (status) gUnityClasses = script.call("listUnityClasses", ["Assembly-CSharp"]);
                if (status) gUnityClasses = script.call("listUnityClasses", [gUnityAssemblyImages]);
                //if (Object.keys(gUnityClasses).length == 0) status = false; // Remove to handle case that has wrong Assembly Images name, no class
            }

            if (status) {
                gIl2cppInit = true;

                return script;
            }
            return;

        }//end initializeUnitySupport

        function recv_frida_data(payload) {
            if (payload.type == "tracking")
                gDebug.push(payload.data); //data format {text:textmessage, address:[0x1234, 0x5678], objData:[00 01 02, 03 04 05]}
            else if (payload.type == "debug")
                gDebug.push(payload.data); //data format {text:textmessage, address:[0x1234, 0x5678], objData:[00 01 02, 03 04 05]} 

            /* DebugMode: Use below line instead*/
            //alert("frida error:\n"+JSON.stringify(payload.data,null,1).replaceAll("\\n","\n")); TURN ON FOR DEBUG MODE
        }

        // Close the dropdown if the user clicks outside of it
        window.onclick = function (event) {
            if (!event.target.matches('.dropbtn')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }

        /***************************************************************/

        /*
         ä¸é¢æ¯fridaçjsèæ¬ä»£ç , è¿è¡å¨ç®æ è¿ç¨, ä¸è½å¨h5ggä¸­ç´æ¥è°ç¨è¿ä¸ªjså½æ°
         fridaçjsèæ¬ä»£ç ä¸­ä¸è½ä½¿ç¨ä»»ä½h5ggçå½æ°ååé, ä¹ä¸è½ä½¿ç¨windowå¯¹è±¡
         h5ggåfridaåªè½éè¿console.logåsend/recv/postè¿ærpc.exportsè¿è¡éä¿¡
        
         The following is the js script code of frida, which runs in the target process, and this js function cannot be called directly in h5gg
         You cannot use any h5gg functions and variables in frida's js script code, nor can you use the window object
         h5gg and frida can only communicate through console.log and send/recv/post and rpc.exports
         */
        function h5gg_frida_script() {
            if (arguments.length) return new Error().line; //do not modify this line!!!

            //åéfridaèæ¬çæ¥å¿æ¶æ¯ç»h5gg
            //console.log("fridaèæ¬æ­£å¨è¿è¡...\nfrida script is running...");

            rpc.exports.getInstruction = function (vaddr) {
                //var addr = new NativePointer(vaddr);
                let iAddr = vaddr;
                let pAddr;
                let inst = "";
                let instList = [];
                let byteAry = [];
                let uintary = [];

                for (let i = -10; i <= 10; i++) {
                    iAddr = vaddr + 4 * i;
                    pAddr = new NativePointer(iAddr);
                    byteAry = pAddr.readByteArray(4);

                    //console.log(pAddr+":"+getByteString(byteAry));
                    try {
                        inst = Instruction.parse(pAddr).toString();
                    } catch (e) {
                        inst = "String: " + hex2a(getByteString(byteAry));
                    }

                    //inst = inst + "\n0x"+Number(iAddr).toString(16)+":"+Instruction.parse(pAddr).toString();
                    instList.push({
                        "address": pAddr,
                        "hex": getByteString(byteAry),
                        "inst": inst
                    });
                }

                return instList;
            }

            rpc.exports.getObjectData = function (vaddr) {

                var addr = new NativePointer(vaddr);
                var byteAry = addr.readByteArray(0x200);
                var objectData = getByteString(byteAry);
                return objectData;
            }

            rpc.exports.pointerGetString = function (vaddr) {
                vaddr = ptr(vaddr)
                let len = il2cpp_string_length(vaddr.readPointer())
                let chars = il2cpp_string_chars(vaddr.readPointer())
                let str = chars.readUtf16String(len)
                return str;
            }

            rpc.exports.searchHexUTF8 = function (hexUTF8) {
                var skipMemoryAfter = 0x280000000;
                var pattern = hexUTF8.hex;
                var sText = hexUTF8.sText;
                var pointer = hexUTF8.pointer;
                if (pattern == "") {
                    if (sText) {
                        pattern = utf8ToleHex(sText);
                    } else {
                        pattern = hexUTF8.pointer;
                    }
                }



                try {
                    let ms = [];
                    if (sText || pointer) {
                        ms = Process.enumerateRanges('rw-');
                    } else {
                        //ms = Process.enumerateRanges('rw-');
                        ms = Process.enumerateModules();
                    }

                    let m;
                    let results;
                    let currentrec = 0;
                    for (let i = 0; i < ms.length; i++) {
                        m = ms[i];

                        try {
                            results = Memory.scanSync(m.base, m.size, pattern);
                        } catch (e) { };
                        if (results.length > 0) {
                            for (let j = 0; j < results.length && j < 100; j++) {
                                if (results[j].address > skipMemoryAfter) continue;
                                currentrec++;
                                if (sText)
                                    debugInfo("Search text: " + sText + " with pattern: " + pattern + ", result (" + currentrec + ")", [results[j].address]);
                                else
                                    debugInfo("Search pattern: " + pattern + ", result (" + currentrec + ")", [results[j].address]);
                            }
                        }

                    }

                    if (currentrec == 0) {
                        console.log("not found (" + pattern + ")");
                        return false;
                    } else console.log("Search (" + pattern + ")found: " + currentrec + " results");


                } catch (e) {
                    console.log(e);
                    return false;
                }
                return true;
            }


            global.getByteString = function (byteAry) {
                let uintary = new Uint8Array(byteAry);
                let byteStr = "";
                let tmp = "";
                for (let i = 0; i < uintary.length; i++) {
                    if (Number(uintary[i]) < 16) tmp = "0" + uintary[i].toString(16)
                    else tmp = uintary[i].toString(16);
                    byteStr = byteStr + " " + tmp;
                }

                return byteStr;
            }
            global.hex2a = function (hexx) {
                //Hex String format: " 12 34 56 78"
                var hex = hexx.toString();//force conversion
                var str = '';
                for (var i = 0; i < hex.length; i += 3)
                    //console.log("i:"+i+",3:"+hex.substr(i, 3)+",2 int"+parseInt(hex.substr(i+1, 2), 16));
                    str += String.fromCharCode(parseInt(hex.substr(i + 1, 2), 16));
                return str;
            }
            global.debugInfo = function (message, objects, size) {
                //send({type:"debug", data:{text:"Testing with Long long long description", address:[creature,status], objData:[creatureData,statusData]}});
                let objMemData = [];
                let byteAry;
                if (!size) size = 0x200;
                for (let i = 0; i < objects.length; i++) {
                    try {
                        byteAry = objects[i].readByteArray(size);
                        objMemData.push(getByteString(byteAry));
                    } catch (e) { };
                }
                send({ type: "debug", data: { text: message, address: objects, objData: objMemData } });
            }
            global.utf8ToleHex = function (str) {
                let hex = '';
                for (let i = 0; i < str.length; i++) {
                    let code = str.charCodeAt(i);
                    let bytes = [];

                    if (code <= 0x7f) {
                        bytes.push(code);
                    } else if (code <= 0x7ff) {
                        bytes.push(((code >> 6) & 0x1f) | 0xc0);
                        bytes.push((code & 0x3f) | 0x80);
                    } else if (code <= 0xffff) {
                        bytes.push(((code >> 12) & 0x0f) | 0xe0);
                        bytes.push(((code >> 6) & 0x3f) | 0x80);
                        bytes.push((code & 0x3f) | 0x80);
                    } else if (code <= 0x10ffff) {
                        bytes.push(((code >> 18) & 0x07) | 0xf0);
                        bytes.push(((code >> 12) & 0x3f) | 0x80);
                        bytes.push(((code >> 6) & 0x3f) | 0x80);
                        bytes.push((code & 0x3f) | 0x80);
                    }

                    for (let j = 0; j < bytes.length; j++) {
                        let byteHex = bytes[j].toString(16);
                        if (byteHex.length === 1) {
                            byteHex = '0' + byteHex;
                        }
                        hex += byteHex;
                    }
                }
                return hex;
            }
            //--------Unity Related-----------------

            //Start shorthands

            var p_size = Process.pointerSize;
            let allocStr = (str, type) => type == undefined ? Memory.allocUtf8String(str) : il2cpp_string_new(Memory.allocUtf8String(str))

            var allocCStr = str => allocStr(str)

            var allocUStr = str => allocStr(str, 1)

            var alloc = size => Memory.alloc((size == undefined ? 1 : size) * p_size);
            var MethodInfoOffset = 0x0; //= 0x1;

            var getClassName = klass => ptr(klass).add(p_size * 2).readPointer().readCString();

            var getMethodName = method => ptr(method).add(p_size * (2 + MethodInfoOffset)).readPointer().readCString();

            var getFieldsCount = kclass => il2cpp_class_num_fields(ptr(kclass));

            var getImgName = img => ptr(img).add(p_size * 1).readPointer().readCString();

            var getMethodParametersCount = method => ptr(method).add(p_size * (8 + MethodInfoOffset) + 4 + 2 + 2 + 2).readU8();

            var getMethodParameters = method => ptr(method).add(p_size * (5 + MethodInfoOffset)).readPointer();

            var getMethodReturnType = method => ptr(method).add(p_size * (4 + MethodInfoOffset)).readPointer();

            var getParameterName = ParameterInfo => ptr(ParameterInfo).readPointer().readCString();

            var getParameterType = Il2CppType => ptr(Il2CppType).add(4 * 2 + p_size).readPointer();

            var getClassAddrFromMethodInfo = methodInfo => ptr(methodInfo).add(p_size * (3 + MethodInfoOffset)).readPointer();

            var getClassNameFromMethodInfo = methodInfo => getClassName(getClassAddrFromMethodInfo(methodInfo));

            var class_is_enum = Pcls => il2cpp_class_is_enum(ptr(Pcls)) == 0x1;

            //End shorthands
            global.assembly = [];
            global.assemblyImage = [];
            global.klass = {};
            global.objectDetails = [];
            global.baseAddr = Module.findBaseAddress("UnityFramework");

            const FieldAccess = {
                FIELD_ATTRIBUTE_FIELD_ACCESS_MASK: 0x0007,
                FIELD_ATTRIBUTE_COMPILER_CONTROLLED: 0x0000,
                FIELD_ATTRIBUTE_PRIVATE: 0x0001,
                FIELD_ATTRIBUTE_FAM_AND_ASSEM: 0x0002,
                FIELD_ATTRIBUTE_ASSEMBLY: 0x0003,
                FIELD_ATTRIBUTE_FAMILY: 0x0004,
                FIELD_ATTRIBUTE_FAM_OR_ASSEM: 0x0005,
                FIELD_ATTRIBUTE_PUBLIC: 0x0006,

                FIELD_ATTRIBUTE_STATIC: 0x0010,
                FIELD_ATTRIBUTE_INIT_ONLY: 0x0020,
                FIELD_ATTRIBUTE_LITERAL: 0x0040,
                FIELD_ATTRIBUTE_NOT_SERIALIZED: 0x0080,
                FIELD_ATTRIBUTE_SPECIAL_NAME: 0x0200,
                FIELD_ATTRIBUTE_PINVOKE_IMPL: 0x2000,

                FIELD_ATTRIBUTE_RESERVED_MASK: 0x9500,
                FIELD_ATTRIBUTE_RT_SPECIAL_NAME: 0x0400,
                FIELD_ATTRIBUTE_HAS_FIELD_MARSHAL: 0x1000,
                FIELD_ATTRIBUTE_HAS_DEFAULT: 0x8000,
                FIELD_ATTRIBUTE_HAS_FIELD_RVA: 0x0100
            }

            function fackAccess(m_type) {
                let attrs = m_type.add(p_size).readPointer()
                let outPut = ""
                let access = attrs & FieldAccess.FIELD_ATTRIBUTE_FIELD_ACCESS_MASK
                switch (access) {
                    case FieldAccess.FIELD_ATTRIBUTE_PRIVATE:
                        outPut += "private "
                        break;
                    case FieldAccess.FIELD_ATTRIBUTE_PUBLIC:
                        outPut += "public "
                        break;
                    case FieldAccess.FIELD_ATTRIBUTE_FAMILY:
                        outPut += "protected "
                        break;
                    case FieldAccess.FIELD_ATTRIBUTE_ASSEMBLY:
                    case FieldAccess.FIELD_ATTRIBUTE_FAM_AND_ASSEM:
                        outPut += "internal "
                        break;
                    case FieldAccess.FIELD_ATTRIBUTE_FAM_OR_ASSEM:
                        outPut += "protected internal "
                        break;
                }
                if (attrs & FieldAccess.FIELD_ATTRIBUTE_LITERAL) {
                    outPut += "const "
                } else {
                    if (attrs & FieldAccess.FIELD_ATTRIBUTE_STATIC) {
                        outPut += "static "
                    }
                    if (attrs & FieldAccess.FIELD_ATTRIBUTE_INIT_ONLY) {
                        outPut += "readonly "
                    }
                }
                return outPut
            }

            function load_il2cpp_api(returenType, apiName, argTypes, wrapper) {
                let f = Module.findExportByName(null, apiName);
                if (!f) throw "cannot find il2cpp api:" + apiName;
                global[apiName] = wrapper.bind(new NativeFunction(f, returenType, argTypes));
            }

            function load_il2cpp_icall(returenType, method, argTypes, wrapper) {
                let f = il2cpp_resolve_icall(method);
                if (!f) throw "cannot find il2cpp icall:" + method;
                global[wrapper.name] = wrapper.bind(new NativeFunction(f, returenType, argTypes));
            }

            function load_corlib_method(returenType, namespaze, clazz, name, argTypes, is_static, wrapper) {
                let corlib = il2cpp_get_corlib();
                //console.log("corlib", corlib, corlib.readPointer().readCString());
                let assemblyClass = il2cpp_class_from_name(corlib, namespaze, clazz);
                let il2cppmethod = il2cpp_class_get_method_from_name(assemblyClass, name, is_static ? argTypes.length : (argTypes.length - 1));
                if (il2cppmethod.isNull()) throw "cannot find corlib method:" + namespaze + "." + clazz + "." + name;
                let methodPointer = il2cppmethod.readPointer();
                global[wrapper.name] = wrapper.bind(new NativeFunction(methodPointer, returenType, argTypes));
            }

            function load_csharp_method(returenType, module, namespaze, clazz, name, argTypes, wrapper) {
                let assembly = assemblyLoad(module); //MonoAssembly

                let type = assemblyGetType(assembly, namespaze + "." + clazz); //RuntimeType (Il2CppReflectionType)

                let method = typeGetMethod(type, name); //MonoMethod (Il2CppReflectionMethod)

                if (method.isNull()) throw "cannot find c# method:" + namespaze + "." + clazz + "." + name;

                let methodInfo = method.add(0x10).readPointer();

                let methodPointer = methodInfo.readPointer();
                global[wrapper.name] = wrapper.bind(new NativeFunction(methodPointer, returenType, argTypes));
            }


            rpc.exports.init_via_il2cpp_api = function () {

                load_il2cpp_api("pointer", "il2cpp_domain_get", [], function () {
                    return this();
                });

                load_il2cpp_api("pointer", "il2cpp_thread_attach", ["pointer"], function (domain) {
                    return this(domain);
                });

                load_il2cpp_api("pointer", "il2cpp_string_new", ["pointer"], function (str) {
                    return this(Memory.allocUtf8String(str));
                });

                load_il2cpp_api("pointer", "il2cpp_get_corlib", [], function () {
                    return this();
                });

                load_il2cpp_api("pointer", "il2cpp_class_from_name", ["pointer", "pointer", "pointer"], function (image, namespaze, name) {
                    return this(image, Memory.allocUtf8String(namespaze), Memory.allocUtf8String(name));
                });

                load_il2cpp_api("pointer", "il2cpp_class_get_method_from_name", ["pointer", "pointer", "int"], function (klass, name, argsCount) {
                    return this(klass, Memory.allocUtf8String(name), argsCount);
                });

                load_il2cpp_api("pointer", "il2cpp_class_get_methods", ["pointer", "pointer"], function (klass, iter) {
                    return this(klass, iter);
                });

                load_il2cpp_api("pointer", "il2cpp_class_get_image", ["pointer"], function (klass) {
                    return this(klass);
                });

                load_il2cpp_api("pointer", "il2cpp_class_get_name", ["pointer"], function (klass) {
                    return this(klass);
                });

                load_il2cpp_api("pointer", "il2cpp_resolve_icall", ["pointer"], function (name) {
                    return this(Memory.allocUtf8String(name));
                });

                load_il2cpp_api("pointer", "il2cpp_domain_get_assemblies", ["pointer", "pointer"], function (domain, size) {
                    return this(domain, size);
                });

                load_il2cpp_api("pointer", "il2cpp_assembly_get_image", ["pointer"], function (assembly) {
                    return this(assembly);
                });

                load_il2cpp_api("pointer", "il2cpp_image_get_class_count", ["pointer"], function (image) {
                    return this(image);
                });

                load_il2cpp_api("pointer", "il2cpp_image_get_class", ["pointer", 'int'], function (image, index) {
                    return this(image, index);
                });

                load_il2cpp_api("int", "il2cpp_class_num_fields", ["pointer"], function (klass) {
                    return this(klass);
                });

                load_il2cpp_api("bool", "il2cpp_class_is_enum", ["pointer"], function (klass) {
                    return this(klass);
                });

                load_il2cpp_api("pointer", "il2cpp_class_get_field_from_name", ["pointer", "pointer"], function (klass, field) {
                    return this(klass, Memory.allocUtf8String(field));
                });

                load_il2cpp_api("pointer", "il2cpp_class_get_fields", ["pointer", "pointer"], function (klass, iter) {
                    return this(klass, iter);
                });

                load_il2cpp_api("pointer", "il2cpp_class_get_property_from_name", ["pointer", "pointer"], function (klass, name) {
                    return this(klass, Memory.allocUtf8String(name));
                });

                load_il2cpp_api("pointer", "il2cpp_class_from_type", ["pointer"], function (filedType) {
                    return this(filedType);
                });

                load_il2cpp_api("pointer", "il2cpp_object_get_class", ["pointer"], function (obj) {
                    return this(obj);
                });

                load_il2cpp_api("pointer", "il2cpp_object_new", ["pointer"], function (obj) {
                    return this(obj);
                });

                load_il2cpp_api("pointer", "il2cpp_object_unbox", ["pointer"], function (obj) {
                    return this(obj);
                });


                load_il2cpp_api("int", "il2cpp_class_get_flags", ["pointer"], function (klass) {
                    return this(klass);
                });

                load_il2cpp_api("int", "il2cpp_class_get_type", ["pointer"], function (klass) {
                    return this(klass);
                });

                load_il2cpp_api("pointer", "il2cpp_class_get_parent", ["pointer"], function (klass) {
                    return this(klass);
                });

                load_il2cpp_api("pointer", "il2cpp_field_get_type", ["pointer"], function (field) {
                    return this(field);
                });

                load_il2cpp_api("pointer", "il2cpp_field_static_get_value", ["pointer", "pointer"], function (field, value) {
                    return this(field, value);
                });

                load_il2cpp_api("pointer", "il2cpp_property_get_get_method", ["pointer"], function (prop) {
                    return this(prop);
                });

                load_il2cpp_api("pointer", "il2cpp_property_get_set_method", ["pointer"], function (prop) {
                    return this(prop);
                });

                load_il2cpp_api("pointer", "il2cpp_property_get_name", ["pointer"], function (prop) {
                    return this(prop);
                });

                load_il2cpp_api("pointer", "il2cpp_type_get_name", ["pointer"], function (type) {
                    return this(type);
                });

                load_il2cpp_api("pointer", "il2cpp_type_get_class_or_element_class", ["pointer"], function (type) {
                    return this(type);
                });

                load_il2cpp_api("pointer", "il2cpp_method_get_name", ["pointer"], function (method) {
                    return this(method);
                });

                load_il2cpp_api("pointer", "il2cpp_method_get_return_type", ["pointer"], function (method) {
                    return this(method);
                });

                load_il2cpp_api("int", "il2cpp_method_get_param_count", ["pointer"], function (method) {
                    return this(method);
                });

                load_il2cpp_api("pointer", "il2cpp_method_get_param", ["pointer", 'int'], function (method, index) {
                    return this(method, index);
                });

                load_il2cpp_api("pointer", "il2cpp_method_get_param_name", ["pointer", 'int'], function (method, index) {
                    return this(method, index);
                });

                load_il2cpp_api("int", "il2cpp_string_length", ["pointer"], function (str) {
                    return this(str);
                });

                load_il2cpp_api("pointer", "il2cpp_string_chars", ["pointer"], function (str) {
                    return this(str);
                });

                load_il2cpp_api("pointer", "il2cpp_runtime_invoke", ["pointer", "pointer", "pointer", "pointer"], function (method, obj, params) {
                    let exception = Memory.alloc(Process.pointerSize);
                    let paramsData;
                    let addrIndex = [];
                    let result;
                    let vector;
                    //debugInfo("TMPDEBUG il2cpp_runtime_invoke: " + params.length + ": " + obj + ":" + JSON.stringify(method), [params]);
                    if (params.length > 0) {
                        paramsData = Memory.alloc(Process.pointerSize * params.length);

                        for (let index = 0; index < params.length; index++) {

                            //TODO: Temporary as Int32, need to determine size before allocate
                            switch (params[index][0]) {
                                case 'int8':
                                    addrIndex[index] = Memory.alloc(1);
                                    addrIndex[index].writeS8(params[index][1]);
                                    break;
                                case 'int16':
                                    addrIndex[index] = Memory.alloc(2);
                                    addrIndex[index].writeS16(params[index][1]);
                                    break;
                                case 'int32':
                                    addrIndex[index] = Memory.alloc(4);
                                    addrIndex[index].writeInt(params[index][1]);
                                    break;
                                case 'int64':
                                    addrIndex[index] = Memory.alloc(8);
                                    addrIndex[index].writeLong(params[index][1]);
                                    break;
                                case 'float':
                                    addrIndex[index] = Memory.alloc(4);
                                    addrIndex[index].writeFloat(params[index][1]);
                                    break;
                                case 'double':
                                    addrIndex[index] = Memory.alloc(8);
                                    addrIndex[index].writeDouble(params[index][1]);
                                    break;
                                case 'pointer':
                                    addrIndex[index] = Memory.alloc(8);
                                    addrIndex[index].writePointer(params[index][1]);
                                    break;
                                case 'vector':
                                    vector = Memory.alloc(4 * 3);
                                    vector.writeFloat(params[index][1].x);
                                    vector.add(4).writeFloat(params[index][1].y);
                                    vector.add(8).writeFloat(params[index][1].z);
                                    addrIndex[index] = vector//Memory.alloc(8);
                                    //addrIndex[index].writePointer(vector);
                                    //console.log("TMPDEBUG INDEX: " + index)
                                    break;

                            }

                            paramsData.add(index * Process.pointerSize).writePointer(addrIndex[index]);
                        }
                    } else {
                        paramsData = ptr(0);
                    }

                    try {
                        result = this(method, obj, paramsData, exception);
                    } catch (e) {
                        debugInfo("il2cpp_runtime_invoke failed: method: " + method + ", obj: " + obj + ", paramsData:" + paramsData + ",exception:" + exception + JSON.stringify(e, Object.getOwnPropertyNames(e)), [obj]);
                    }
                    return result;
                });


                /********************************************************************************/
                /*
                                load_il2cpp_icall("pointer", "UnityEngine.Object::FindObjectsOfType(System.Type)", ["pointer"], function FindObjectsOfType(type) {
                                    return this(type); //å¥å¥æªæª, å®ä¹äºä¹åå¿é¡»å»¶è¿å æ¯«ç§åè°ç¨, å¦åè¿åçæ°ç»ä¸­æ°éæ¯é¢æå°
                                });
                                //console.log("Analysing...");//"invoke for delay..."
                */
                load_il2cpp_icall("pointer", "UnityEngine.Object::FindObjectsOfType(System.Type)", ["pointer", "bool"], function FindObjectsOfType(type, includeInactive) {
                    return this(type, includeInactive); //å¥å¥æªæª, å®ä¹äºä¹åå¿é¡»å»¶è¿å æ¯«ç§åè°ç¨, å¦åè¿åçæ°ç»ä¸­æ°éæ¯é¢æå°
                });

                load_il2cpp_icall("pointer", "UnityEngine.Resources::FindObjectsOfTypeAll(System.Type)", ["pointer"], function FindObjectsOfTypeAll(type) {
                    return this(type); //å¥å¥æªæª, å®ä¹äºä¹åå¿é¡»å»¶è¿å æ¯«ç§åè°ç¨, å¦åè¿åçæ°ç»ä¸­æ°éæ¯é¢æå°
                });

                load_il2cpp_icall("pointer", "UnityEngine.Object::ToString()", ["pointer"], function ToString(object) {
                    return this(object).add(0x14).readUtf16String();
                });

                load_il2cpp_icall("pointer", "UnityEngine.Object::GetName(UnityEngine.Object)", ["pointer"], function GetName(object) {
                    return this(object).add(0x14).readUtf16String();
                });

                load_il2cpp_icall("int", "UnityEngine.Object::GetOffsetOfInstanceIDInCPlusPlusObject()", [], function GetOffsetOfInstanceIDInCPlusPlusObject() {
                    return this();
                });

                load_il2cpp_icall("int", "UnityEngine.SceneManagement.SceneManager::get_sceneCount()", [], function get_sceneCount(object) {
                    return this();
                });

                load_il2cpp_icall("pointer", "UnityEngine.GameObject::GetComponentsInternal(System.Type,System.Boolean,System.Boolean,System.Boolean,System.Boolean,System.Object)",
                    ["pointer", "pointer", "bool", "bool", "bool", "bool", "pointer"],
                    function GetComponents(gameObject, type, useSearchTypeAsArrayReturnType, recursive, includeInactive, reverse, resultList) {
                        return this(gameObject, type, useSearchTypeAsArrayReturnType, recursive, includeInactive, reverse, resultList);
                    });

                load_il2cpp_icall("pointer", "UnityEngine.GameObject::GetComponents(System.Type)",
                    ["pointer", "pointer"],
                    function GetComponents2(gameObject, type) {
                        return this(gameObject, type);
                    });

                load_il2cpp_icall("bool", "UnityEngine.GameObject::get_activeInHierarchy()", ["pointer"], function get_activeInHierarchy(gameObject) {
                    return this(gameObject);
                });

                load_il2cpp_icall("pointer", "UnityEngine.GameObject::get_transform()", ["pointer"], function get_transform(gameObject) {
                    return this(gameObject);
                });

                load_il2cpp_icall("void", "UnityEngine.Transform::get_position_Injected(UnityEngine.Vector3&)", ["pointer", "pointer"], function get_position(transform) {
                    let vector = Memory.alloc(4 * 3);
                    this(transform, vector);
                    return {
                        x: vector.readFloat(),
                        y: vector.add(4).readFloat(),
                        z: vector.add(8).readFloat()
                    };
                });

                load_il2cpp_icall("pointer", "UnityEngine.Component::get_gameObject()", ["pointer"], function get_gameObject(component) {
                    return this(component);
                });

                load_il2cpp_icall("int", "UnityEngine.Camera::GetAllCamerasCount()", [], function GetAllCamerasCount() {
                    return this();
                });

                load_il2cpp_icall("pointer", "UnityEngine.Camera::get_main()", [], function get_mainCamera() {
                    return this();
                });

                load_il2cpp_icall("void", "UnityEngine.Camera::WorldToViewportPoint_Injected(UnityEngine.Vector3&,UnityEngine.Camera/MonoOrStereoscopicEye,UnityEngine.Vector3&)",
                    ["pointer", "pointer", "int", "pointer"],
                    function WorldToViewportPoint(camera, location, eye) {
                        let ret = Memory.alloc(4 * 3);
                        this(camera, location, eye, ret);
                        return {
                            x: ret.readFloat(),
                            y: ret.add(4).readFloat(),
                            z: ret.add(8).readFloat()
                        };
                    });

                load_il2cpp_icall("void", "UnityEngine.Camera::WorldToScreenPoint_Injected(UnityEngine.Vector3&,UnityEngine.Camera/MonoOrStereoscopicEye,UnityEngine.Vector3&)",
                    ["pointer", "pointer", "int", "pointer"],
                    function WorldToScreenPoint(camera, location, eye) {
                        let ret = Memory.alloc(4 * 3);
                        this(camera, location, eye, ret);
                        return {
                            x: ret.readFloat(),
                            y: ret.add(4).readFloat(),
                            z: ret.add(8).readFloat()
                        };
                    });

                load_il2cpp_icall("pointer", "UnityEngine.Camera::ScreenPointToRay_Injected(UnityEngine.Vector2&,UnityEngine.Camera.MonoOrStereoscopicEye,UnityEngine.Ray&)",
                    ["pointer", "pointer", "int", "pointer"],
                    function ScreenPointToRay(camera, location, eye) { //Vector3(x, y, 0); Unity ignore the z/0

                        //let f = il2cpp_resolve_icall 
                        //let f = il2cpp_resolve_icall("UnityEngine.Camera::ScreenPointToRay(UnityEngine.Vector3&,UnityEngine.Camera.MonoOrStereoscopicEye)");
                        //if (!f) throw "cannot find il2cpp icall:";
                        //console.log("TMPDEBUG method: "+f)
                        let ray = Memory.alloc(4 * 6);
                        //console.log("TMPDEBUG before: " + camera + ":" + location + ":" + eye)
                        this(camera, location, eye, ray);
                        //console.log("TMPDEBUG after: " + ray)
                        return ray; //Ray contains two Vector3 (origin and direction)
                    });
                /*
                                load_il2cpp_icall("void","UnityEngine.Physics::get_defaultPhysicsScene_Injected(UnityEngine.PhysicsScene&)",
                                    ["pointer"],
                                    function Raycast(ray, hitInfo, maxDistance) {
                                        return this(ray, hitInfo, maxDistance);
                                    });
                
                                // Load the Raycast function
                                load_il2cpp_icall("bool","UnityEngine.PhysicsScene::Internal_Raycast_Injected(UnityEngine.PhysicsScene&,UnityEngine.Ray&,System.Single,UnityEngine.RaycastHit&,System.Int32,UnityEngine.QueryTriggerInteraction)",
                                    ["pointer", "pointer", "float"],
                                    function Raycast(ray, hitInfo, maxDistance) {
                                        return this(ray, hitInfo, maxDistance);
                                    });
                */
                load_il2cpp_icall("bool", "UnityEngine.Physics::Raycast(UnityEngine.Ray&,UnityEngine.RaycastHit&,System.Single,System.Int32,UnityEngine.QueryTriggerInteraction)",
                    ["pointer", "pointer"],
                    function Raycast(ray, hitInfo) {
                        return this(ray, hitInfo);
                    });

                load_il2cpp_icall("void", "UnityEngine.Debug::DrawLine_Injected(UnityEngine.Vector3&,UnityEngine.Vector3&,UnityEngine.Color&,System.Single,System.Boolean)",
                    ["pointer", "pointer", "pointer", "float"],
                    function DrawLine(start, end, color, duration) {
                        return this(start, end, color, duration);
                    });

                /********************************************************************************/

                let domain = il2cpp_domain_get();
                il2cpp_thread_attach(domain);

                load_corlib_method("pointer", "System.Reflection", "Assembly", "Load", ["pointer"], true, function assemblyLoad(assemblyString) {
                    return this(il2cpp_string_new(assemblyString));
                });

                load_corlib_method("pointer", "System.Reflection", "Assembly", "GetType", ["pointer", "pointer"], false, function assemblyGetType(assembly, name) {
                    return this(assembly, il2cpp_string_new(name));
                });

                load_corlib_method("pointer", "System", "Type", "GetMethod", ["pointer", "pointer"], false, function typeGetMethod(type, name) {
                    return this(type, il2cpp_string_new(name));
                });

                /********************************************************************************/

                load_csharp_method("int", "UnityEngine.CoreModule", "UnityEngine", "Camera", "GetAllCameras", ["pointer"], function GetAllCameras(arrbuf) {
                    return this(arrbuf);
                });

                return true;
            }

            //[Different from Ufun implementation] This function will find and return MethodInfo, not method pointer (MethodInfo.readPointer()), if isRealAddr = true
            //if isRealAddr != true, it return method offset (remove base address)
            rpc.exports.find_method = function (imageName, namespaze, className, methodName, argsCount, isRealAddr) {

                if (imageName == undefined || className == undefined || methodName == undefined || argsCount == undefined) return ptr(0)

                if (isRealAddr == undefined) isRealAddr = true
                let klassFullName = namespaze.replace(/\./g, "$") + "$" + className
                if (isRealAddr) {
                    let cache = global.klass[klassFullName][methodName].methodInfo//map_find_method_cache.get(tmpKey)
                    if (cache != null) return ptr(cache)
                }
                let currentlib = global.assemblyImage[imageName]
                /*arr_img_names.forEach(function (name, index) {
                    if (name == imageName) {
                        currentlib = arr_img_addr[index]
                    }
                })*/
                let klass = il2cpp_class_from_name(currentlib, namespaze, className)
                /*if (klass == 0) {
                    for (let j = 0; j < il2cpp_image_get_class_count(currentlib).toInt32(); j++) {
                        let il2CppClass = il2cpp_image_get_class(currentlib, j)
                        if (getClassName(il2CppClass) == className) {
                            klass = il2CppClass
                            break
                        }
                    }
                }*/

                if (klass == 0) return ptr(0)
                let methodInfo = il2cpp_class_get_method_from_name(klass, allocStr(functionName), argsCount)
                if (methodInfo == 0) return ptr(0)

                //ç¼å­
                global.klass[klassFullName][methodName].methodInfo = methodInfo

                //if (isRealAddr) return isRealAddr ? methodInfo.readPointer() : methodInfo.readPointer().sub(global.baseAddr)
                if (isRealAddr) return isRealAddr ? methodInfo : methodInfo.readPointer().sub(global.baseAddr)
            }

            //Invoke Klass Method on Object, params is an array of param
            //*********KEY NOTE: invoke_instance_method take MethodInfo, not the actual method pointer (MethodInfo.readPointer()). 
            //*****************  However, new NativeFunction take method pointer (MethodInfo.readPointer()) instead. 
            //*****************  Module.findExportByName return method pointer directly (not MethodInfo)
            rpc.exports.invoke_instance_method = function (obj, klassFullName, methodName, returnType, params) {
                //let method = global.klass[klassFullName][methodName].methodInfo;

                let klassName = klassFullName.split("$").pop();
                let namespaze = klassFullName.substring(0, klassFullName.lastIndexOf("$"))

                let methodInfo = rpc.exports.find_method(namespaze, namespaze, klassName, methodName, params.length, true)
                if (!methodInfo) {
                    debugInfo("Cannot found Class or Method: " + klassFullName + "\t[" + methodName + "]", [obj]);
                    return methodInfo;
                }
                //let method2 = il2cpp_class_get_method_from_name(global.klass[klassFullName].klass, methodName, params.length) 
                try {
                    //TODO: POTENTIAL BUG, treat hex as normal number
                    obj = ptr(Number(obj))
                    methodInfo = ptr(Number(methodInfo))

                } catch (e) { console.log(JSON.stringify(e, Object.getOwnPropertyNames(e))) }

                let domain = il2cpp_domain_get();
                il2cpp_thread_attach(domain);


                return unbox(il2cpp_runtime_invoke(methodInfo, obj, params), returnType);

                function unbox(resultPtr, returnType) {
                    resultPtr = il2cpp_object_unbox(resultPtr)
                    //console.log("TMPDEBUG: unbox "+JSON.stringify(resultPtr))
                    return getReturnValue(resultPtr, returnType);
                }
                function getReturnValue(pointer, type) {
                    try {
                        switch (type) {
                            case "int8":
                                return pointer.readS8();
                                break;
                            case "int16":
                                return pointer.readS16();
                                break;
                            case "int32":
                                return pointer.readS32();
                                break;
                            case "int64":
                                return pointer.readS64();
                                break;
                            case "single":
                                return pointer.readFloat();
                                break;
                            case "double":
                                return pointer.readDouble();
                                break;
                            case "boolean":
                                return pointer.readShort();
                                break;
                            case "text":
                            case "string":
                                let len = il2cpp_string_length(pointer.readPointer())
                                let chars = il2cpp_string_chars(pointer.readPointer())
                                let str = chars.readUtf16String(len)
                                return str;

                                break;
                            default:
                                return pointer;
                        }//end switch
                    } catch (e) {
                        debugInfo("Error getting return value :" + type + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString() + ":" + klassFullName + "." + methodName + "()", [pointer]);
                        return "error"
                    }
                } // end getFieldValue
            }

            rpc.exports.listUnityImages = function (filter) {

                global.assembly = [];
                global.assemblyImage = [];
                const domain = il2cpp_domain_get();
                const size_t = alloc();
                const assemblies = il2cpp_domain_get_assemblies(domain, size_t);
                let assemblies_count = size_t.readInt();
                for (let i = 0; i < assemblies_count; i++) {
                    let img_addr = il2cpp_assembly_get_image(assemblies.add(p_size * i)).readPointer();
                    let img_name = img_addr.add(p_size).readPointer().readCString();
                    let cls_count = il2cpp_image_get_class_count(img_addr).toInt32();
                    let assembly_addr = assemblyLoad(img_name);
                    if (filter == undefined) {
                        global.assembly[img_name] = assembly_addr;
                        global.assemblyImage[img_name] = img_addr;
                        //Turn on for Debug Mode
                        debugInfo("[*] " + img_name + "\t[" + cls_count + "]", [assembly_addr, img_addr]);

                    } else if (img_name.indexOf(filter) != -1) {
                        global.assembly[img_name] = assembly_addr;
                        global.assemblyImage[img_name] = img_addr;
                        //Turn on for Debug Mode
                        debugInfo("[*] " + img_name + "\t[" + cls_count + "]", [assembly_addr, img_addr]);
                    }

                }
                return true;

            } //end List Unity Image

            //Must use in conjunction with listUnityImages
            rpc.exports.listUnityClasses = function (imageList, isAppendClass) {
                if (isAppendClass == undefined) isAppendClass = false;
                if (!isAppendClass) {
                    global.klass = {};
                }

                //If it is a single Image name (not an array), convert it to an array
                if (!Array.isArray(imageList))
                    imageList = [imageList]

                for (let k = 0; k < imageList.length; k++) {
                    let imageName=imageList[k]
                    
                    if (!global.assemblyImage[imageName]) continue //handle case that Assembly Image Name is wrong
                    let image = ptr(global.assemblyImage[imageName]);

                    let cls_count = il2cpp_image_get_class_count(image).toInt32()

                    let flags;
                    let isAbstract = false;
                    let isSealed = false;
                    let isStatic = false;
                    let logcount = 0;
                    for (let j = 0; j < cls_count; j++) {
                        let singletonObj = ptr(0);
                        let il2CppClass = il2cpp_image_get_class(image, j)
                        let name = il2CppClass.add(2 * p_size).readPointer().readCString()
                        let nameSpace = il2CppClass.add(3 * p_size).readPointer().readCString()
                        nameSpace = nameSpace.replace(/\./g, "$");
                        let klassImage = il2cpp_class_get_image(il2CppClass);
                        let klassImageName = klassImage.add(p_size).readPointer().readCString();

                        flags = il2cpp_class_get_flags(il2CppClass)
                        const TYPE_ATTRIBUTE_ABSTRACT = 0x00000800;
                        const TYPE_ATTRIBUTE_SEALED = 0x00000100;
                        if (flags & TYPE_ATTRIBUTE_ABSTRACT) isAbstract = true;
                        if (flags & TYPE_ATTRIBUTE_SEALED) isSealed = true;

                        if (isAbstract && isSealed) isStatic = true;// not working as expected

                        global.klass[nameSpace + "$" + name] = {
                            "klass": il2CppClass,
                            "namespace": nameSpace,
                            "isAbstract": isAbstract,
                            "isSealed": isSealed,
                            "isStatic": isStatic,
                            "parentClass": 0x0,
                            "parentName": "",
                            "parentNameSpace": "",
                            "klassImageName": klassImageName,
                            "parents": "",
                            "singleton": 0x0,
                        }

                        /******** Start Parent Detail **********/
                        var parentClasses = [];
                        let tmpParent = il2CppClass;
                        let tmpParentName;
                        let tmpParentNameSpace;
                        let tmpKlassInfo;
                        let parents = "";

                        parentClasses.push([il2CppClass, name, nameSpace])
                        try {
                            while (true) {
                                tmpParent = il2cpp_class_get_parent(tmpParent);
                                if (!tmpParent || tmpParent == 0x0) break
                                tmpParentName = tmpParent.add(2 * p_size).readPointer().readCString();
                                tmpParentNameSpace = tmpParent.add(3 * p_size).readPointer().readCString();
                                tmpParentNameSpace = tmpParentNameSpace.replace(/\./g, "$");

                                parentClasses.push([tmpParent, tmpParentName, tmpParentNameSpace]);
                                //TODO: CURRENTLY ALLOW PARENT NOT YET LOAD OR NOT FOUND, in order to handle parent that might be loaded after the child. However, this also lead to longer loading time. Even parent not in current loaded library (e.g. Assembly_CSharp) will need process below field and method, waste of time
                                //tmpKlassInfo = global.klass[tmpParentNameSpace + "$" + tmpParentName];
                                //if (!tmpKlassInfo) break;
                            }
                        } catch (e) { console.log("Preparing Parent Info: " + nameSpace + "$" + name + ": " + JSON.stringify(e, Object.getOwnPropertyNames(e))) }

                        if (parentClasses.length > 1) {//No.1 is the first parent
                            global.klass[nameSpace + "$" + name]["parentClass"] = parentClasses[1][0];
                            global.klass[nameSpace + "$" + name]["parentName"] = parentClasses[1][1];
                            global.klass[nameSpace + "$" + name]["parentNameSpace"] = parentClasses[1][2];
                            for (let i = 1; i < parentClasses.length; i++) {
                                parents += parentClasses[1][2] + "$" + parentClasses[i][1] + ","
                            }
                            global.klass[nameSpace + "$" + name]["parents"] = parents
                        }

                        /******** End Parent Detail **********/

                        /******** Start Field Detail **********/
                        let iter;
                        for (let i = parentClasses.length - 1; i >= 0; i--) {//start loop parent and self
                            let tmpIl2CppClass = parentClasses[i][0];


                            let fieldsCount;
                            let fieldsDetails = {};
                            fieldsCount = getFieldsCount(tmpIl2CppClass);


                            if (fieldsCount > 0) {
                                let is_enum = class_is_enum(tmpIl2CppClass);
                                iter = alloc()
                                let field = null
                                let enumIndex = 0


                                while (field = il2cpp_class_get_fields(tmpIl2CppClass, iter)) {
                                    if (field == 0x0) break
                                    let genericType = ""
                                    let fieldName = field.readPointer().readCString()
                                    fieldName = fieldName.replace(/<|>/g, "")
                                    let fieldType = field.add(p_size).readPointer()
                                    //let fieldType2 = il2cpp_field_get_type(field) //confirmed, two approaches are the same.

                                    let fieldOffset = "0x" + field.add(3 * p_size).readInt().toString(16)
                                    let field_class = il2cpp_class_from_type(fieldType)
                                    let fieldClassName = getClassName(field_class)
                                    let fieldClassFullName = il2cpp_type_get_name(fieldType).readCString()
                                    let fieldNameSpace = field_class.add(3 * p_size).readPointer().readCString()
                                    if (fieldClassName.indexOf("`") !== -1) { //`1 `2 `3
                                        genericType = fieldClassName.split("`")[0];

                                        fieldClassName = fieldClassFullName.substr(fieldClassFullName.lastIndexOf("<") + 1, fieldClassFullName.length - fieldClassFullName.lastIndexOf("<") - 1 - 1).replace(/<|>/g, "")
                                        //if key value pair or dictionary type, get last value type then remove namespace
                                        fieldClassName = fieldClassName.split(",").pop()
                                        fieldNameSpace = fieldClassName.substring(0, fieldClassName.lastIndexOf(".")).replace(/\./g, "$");
                                        fieldClassName = fieldClassName.split(".").pop()
                                    }

                                    if (fieldOffset == 0x0 && fieldName.toLowerCase().indexOf("instance") != -1 && name == fieldClassName) {
                                        try {
                                            let addrOut = alloc()
                                            il2cpp_field_static_get_value(field, addrOut)
                                            singletonObj = addrOut.readPointer()
                                        } catch (e) {
                                            debugInfo("SINGLETON retrive error :" + nameSpace + "$" + name + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString() + ":" + e.stack, [global.klass[nameSpace + "$" + name]])
                                        }

                                    } //else singletonObj = ptr(0)

                                    let accessStr = fackAccess(fieldType)
                                    accessStr = accessStr.substring(0, accessStr.length - 1)
                                    let enumStr = (is_enum && (String(field_class) == String(tmpIl2CppClass))) ? (enumIndex++ + "\t") : " "
                                    global.klass[nameSpace + "$" + name][fieldName] = {
                                        "offset": fieldOffset,
                                        "access": accessStr,
                                        "fieldClassName": fieldClassName,
                                        "fieldClassFullName": fieldClassFullName.replace(/<|>/g, "|"),
                                        "fieldGenericType": genericType,
                                        "fieldClass": field_class,
                                        "fieldNameSpace": fieldNameSpace,
                                        "fieldInfo": field,
                                        "enumStr": enumStr,
                                    }

                                }//end while
                            }//end if field count >0
                            /******** End Field Detail **********/
                            if (singletonObj != 0x0) {
                                global.klass[nameSpace + "$" + name]["singleton"] = singletonObj
                                debugInfo("SINGLETON-obj :" + name + ":" + global.klass[nameSpace + "$" + name]["singleton"], [singletonObj])
                            }

                            /******** Start Method Detail **********/
                            let AretName = new Array()
                            let AretAddr = new Array()
                            iter = alloc()
                            let method = NULL
                            let count_methods = 0

                            try {
                                while (method = il2cpp_class_get_methods(il2CppClass, iter)) {
                                    if (method == 0 || method == 0x0) {
                                        //TURN ON FOR DEBUG MODE
                                        //debugInfo(nameSpace+"$"+name+"$"+" cannot find methodInfo",[il2CppClass]);
                                        break
                                    }

                                    //let methodName = getMethodName(method)
                                    let methodName = il2cpp_method_get_name(method).readCString()

                                    //let retType = getMethodReturnType(method);
                                    let retType = il2cpp_method_get_return_type(method);

                                    if (retType == 0x0) {
                                        //TURN ON FOR DEBUG MODE
                                        //debugInfo(nameSpace+"$"+name+"$"+methodName+" cannot find return type",[method]);
                                        continue;
                                    }
                                    //let retClass = il2cpp_class_from_type(getMethodReturnType(method))
                                    let retClass = il2cpp_class_from_type(retType)
                                    if (retClass == 0x0) {
                                        //TURN ON FOR DEBUG MODE
                                        //debugInfo(nameSpace+"$"+name+"$"+methodName+" cannot find return class",[method]);
                                        continue;
                                    }

                                    let retName = getClassName(retClass)

                                    global.klass[nameSpace + "$" + name][methodName] = {
                                        "vAddress": method.readPointer(),
                                        "methodOffset": method.readPointer().sub(global.baseAddr),
                                        "returnClassName": retName,
                                        "returnClass": retClass,
                                        "parameterList": "",
                                        "methodInfo": method,
                                    }

                                    //let parameters_count = getMethodParametersCount(method)
                                    let parameters_count = il2cpp_method_get_param_count(method)

                                    // æ·»å åç§°ä»¥åå°åå°array
                                    if (AretName.toString().indexOf(methodName) == -1) {
                                        AretName.push(methodName)
                                        AretAddr.push(method.readPointer())
                                        // è§£æåæ°
                                        let arr_args = new Array()
                                        let arr_args_type_addr = new Array()
                                        for (let i = 0; i < parameters_count; i++) {
                                            try {
                                                //let ParameterInfo = method.add(p_size * 5).readPointer()
                                                let ParameterInfo = il2cpp_method_get_param(method, i)

                                                let Il2CppType = ParameterInfo.add(p_size * i * 4)
                                                let typeClass = il2cpp_class_from_type(getParameterType(Il2CppType))
                                                let typeClass2 = il2cpp_class_from_type(Il2CppType)
                                                let TypeName = getClassName(typeClass2)

                                                let paramName = il2cpp_method_get_param_name(method, i).readCString()
                                                arr_args.push(TypeName + " " + paramName)

                                                // è¿éçTypeName å typeClass ä¹é´ä¹æä»¥ä¸ç¨ /t æ¯å ä¸ºå¤åæ°
                                                arr_args_type_addr.push(TypeName + " " + typeClass2)
                                                global.klass[nameSpace + "$" + name][methodName][TypeName] = {
                                                    "typeClass": typeClass,
                                                };
                                            } catch (e) {/*if (logcount<5){console.log("error in:"+JSON.stringify(e, Object.getOwnPropertyNames(e)));logcount+=1}*/ }
                                        } //end for loop parameter
                                        if (parameters_count > 0) {
                                            global.klass[nameSpace + "$" + name][methodName]["parameterList"] = arr_args.join(', ')
                                        }
                                        count_methods++
                                    }
                                }
                            } catch (e) {/*if (logcount<10){console.log("out"+JSON.stringify(e, Object.getOwnPropertyNames(e)));logcount+=1}*/ }
                            /******** End Method Detail **********/
                        }//end loop parent and self

                        //Turn on for Debug Mode
                        //debugInfo((j+1)+" of "+cls_count+": "+ name+":"+JSON.stringify(global.klass[nameSpace+"$"+name])+":"+Object.keys(global.klass).length,[il2CppClass]);
                    }
                }//End for loop imageList
                return global.klass;
            } //end list class

            //Must use in conjunction with listUnityObject
            rpc.exports.unityObjExplore = function (Addr, isConfirmedObjAddr) {
                let pObj;
                if (Addr != undefined) pObj = ptr(Addr)
                let klass;
                let klassName;
                let klassNameSpace;
                let klassImage;
                let klassImageName;
                let isObject = false;
                let fieldsCount;
                let fieldsDetails = [];
                let objectOffset;

                //If we said it is Confirm Object Address, then even not in global.klass, we will try use il2cpp api to do extraction
                //LIMITATION: Parent Class info still rely on global.klass
                if (!isConfirmedObjAddr) {
                    pObj = ptr(findClosestObject(Addr));
                    if (pObj == 0x0) {
                        objectDetails = [];
                        return objectDetails;
                    }

                    debugInfo("Closetest Object :" + pObj.toString(16), [pObj]);
                }

                //i<0x1 meaning disabled the bruce force object lookup, which will crash game
                for (let i = 0; i < 0x1; i++) {
                    if (pObj.toInt32() % 4 == 0) {
                        isObject = true;
                        let isFound = false;
                        objectOffset = "0x" + (Addr - pObj).toString(16);

                        fieldsDetails = [];
                        objectDetails = [];
                        let tmpParentName;
                        try {
                            klass = il2cpp_object_get_class(pObj);
                            klassName = getClassName(klass);
                            /*let klassName2 = il2cpp_class_get_name(klass).readCString()
if (klassName!=klassName2) debugInfo("TMPDEBUG KLASS NAME: "+ klassName +":"+klassName2,[klass])*/
                            klassNameSpace = klass.add(3 * p_size).readPointer().readCString();
                            klassNameSpace = klassNameSpace.replace(/\./g, "$");
                            klassImage = il2cpp_class_get_image(klass);
                            klassImageName = klassImage.add(p_size).readPointer().readCString();

                            /******** Start Parent Detail **********/
                            var parentClasses = [];
                            let tmpParent = klass;
                            let tmpParentNameSpace;
                            let tmpKlassInfo;

                            parentClasses.push([klass, klassName, klassNameSpace])
                            try {
                                while (true) {
                                    tmpParent = il2cpp_class_get_parent(tmpParent);
                                    if (!tmpParent || tmpParent == 0x0) break
                                    tmpParentName = tmpParent.add(2 * p_size).readPointer().readCString();
                                    tmpParentNameSpace = tmpParent.add(3 * p_size).readPointer().readCString();
                                    tmpParentNameSpace = tmpParentNameSpace.replace(/\./g, "$");
                                    //[TODO: Consider to remove dependence on global cache]
                                    tmpKlassInfo = global.klass[tmpParentNameSpace + "$" + tmpParentName];
                                    // check if it is a known class, currently only known class would be logged
                                    if (tmpKlassInfo) parentClasses.push([tmpParent, tmpParentName, tmpParentNameSpace])
                                    else break;
                                }
                            } catch (e) { console.log("Preparing Parent Info: " + klassNameSpace + "$" + klassName + ": " + JSON.stringify(e, Object.getOwnPropertyNames(e))) }

                            /******** End Parent Detail **********/

                            /******** Start Field Detail **********/
                            let iter;
                            for (let i = parentClasses.length - 1; i >= 0; i--) {//start loop parent and self

                                let tmpIl2CppClass = parentClasses[i][0];

                                let fieldsCount = getFieldsCount(tmpIl2CppClass);

                                if (fieldsCount <= 0) continue; //throw "wrong class";
                                let is_enum = class_is_enum(tmpIl2CppClass);

                                iter = alloc()
                                let field = null
                                let enumIndex = 0

                                while (field = il2cpp_class_get_fields(tmpIl2CppClass, iter)) {
                                    if (field == 0x0) break

                                    let fieldName = field.readPointer().readCString()

                                    let fieldType = field.add(p_size).readPointer()

                                    let fieldOffset = "0x" + field.add(3 * p_size).readInt().toString(16)

                                    let field_class = il2cpp_class_from_type(fieldType)

                                    let field_is_enum = il2cpp_class_is_enum(field_class);

                                    let fieldClassName = getClassName(field_class)

                                    let fieldNameSpace = field_class.add(3 * p_size).readPointer().readCString()
                                    let accessStr = fackAccess(fieldType)
                                    accessStr = accessStr.substring(0, accessStr.length - 1)
                                    let enumStr = (is_enum && (String(field_class) == String(klass))) ? (enumIndex++ + "\t") : " "
                                    let fieldValue;
                                    if (pObj != undefined && accessStr.indexOf("static") == -1) {
                                        let mPtr = pObj.add(fieldOffset)

                                        fieldValue = getFieldValue(mPtr, field_is_enum == 1 ? "int8" : fieldClassName.toLowerCase()) //mPtr.readPointer()
                                    } else if (accessStr.indexOf("static") != -1) {
                                        try {

                                            //let field2 = il2cpp_class_get_field_from_name(tmpIl2CppClass, allocStr(fieldName))
                                            let field2 = il2cpp_class_get_field_from_name(tmpIl2CppClass, fieldName)

                                            if (!field.isNull()) {
                                                let addrOut = alloc()

                                                il2cpp_field_static_get_value(field, addrOut)
                                                fieldValue = getFieldValue(addrOut, fieldClassName.toLowerCase()) //addrOut.readPointer()

                                            }
                                        } catch (e) {
                                            if (klassName == "UnitLevelUpRenderData") debugInfo("UnitLevelUpRenderData-field :" + field + ":" + fieldName + ":" + fieldClassName + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString() + ":" + e.stack, [tmpIl2CppClass])
                                        }
                                    }


                                    fieldsDetails.push({

                                        "offset": fieldOffset,
                                        "access": accessStr,
                                        "fieldClassName": fieldClassName,
                                        "fieldClass": field_class,
                                        "fieldNameSpace": fieldNameSpace,
                                        "fieldName": fieldName.replace(/<|>/g, ""),
                                        "fieldValue": fieldValue,
                                        "field_is_enum": field_is_enum,
                                    });

                                    if (objectOffset == fieldOffset) isFound = true;


                                }//end while
                            } //End For Loop of parent / current class 
                        } catch (e) {
                            //Turn on for Debug Mode
                            debugInfo(i + ")" + isObject + ":" + isFound + ":" + (objectOffset == "0x0") + ":" + objectOffset + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString() + ":" + klassName + ":" + tmpParentName, [pObj]);
                            isObject = false;
                            pObj = pObj.sub(1);
                            continue;
                        }

                        /******** End Field Detail **********/
                        if (isObject && (isFound || objectOffset == "0x0")) {
                            objectDetails.push({
                                "oriAddr": Addr,
                                "objectOffset": objectOffset,
                                "object": pObj,
                                "objectClassName": klassName,
                                "objectClassNameSpace": klassNameSpace,
                                "objectClass": klass,
                                "fieldDetails": fieldsDetails,
                                "ObjectImageName": klassImageName,
                            });
                            //Turn on for DEBUG MODE
                            //debugInfo("found at " + i + ":" + klass + ":" + klassName + ":" + JSON.stringify(objectDetails), [pObj]);
                            break;
                        }
                    }
                    pObj = pObj.sub(1);

                }
                return objectDetails;

                function getFieldValue(pointer, type) {
                    try {
                        switch (type) {
                            case "int8":
                                return pointer.readS8();
                                break;
                            case "int16":
                                return pointer.readS16();
                                break;
                            case "int32":
                                return pointer.readS32();
                                break;
                            case "int64":
                                return pointer.readS64();
                                break;
                            case "single":
                                return pointer.readFloat();
                                break;
                            case "double":
                                return pointer.readDouble();
                                break;
                            case "boolean":
                                return pointer.readShort();
                                break;
                            case "text":
                            case "string":
                                let len = il2cpp_string_length(pointer.readPointer())
                                let chars = il2cpp_string_chars(pointer.readPointer())
                                let str = chars.readUtf16String(len)
                                return str;

                                break;
                            default:
                                return pointer.readPointer();
                        }//end switch
                    } catch (e) {
                        debugInfo("Error getting field vlaue :" + type + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString() + ":" + klassName, [pointer]);
                        return "error"
                    }
                } // end getFieldValue

                //No longer used, as Unity List is not accurate
                function findClosestNumber(numbers, target) {
                    let low = 0;
                    let high = numbers.length - 1;
                    let closest = null;

                    while (low <= high) {
                        let mid = Math.floor((low + high) / 2);
                        let current = numbers[mid];

                        if (current === target) {
                            return current;
                        } else if (current < target) {
                            low = mid + 1;
                        } else {
                            high = mid - 1;
                        }

                        if (closest === null || Math.abs(current - target) < Math.abs(closest - target)) {
                            closest = current;
                        }
                    }

                    return closest;
                } //End findClosestObject

                function findClosestObject(address) {
                    var pObj = ptr(address);
                    var klass;
                    var klassName;
                    var nameSpace;
                    for (var i = 0; i < 0x1000; i++) {
                        pObj = ptr(address).sub(1 * i);
                        if (pObj.toInt32() % 4 === 0) {
                            klass = pObj.readPointer();
                            if (klass < 0x100000000 || klass > 0x280000000) continue;

                            try {
                                klassName = getClassName(klass);
                                nameSpace = klass.add(3 * p_size).readPointer().readCString()
                                nameSpace = nameSpace.replace(/\./g, "$");
                            } catch (e) { continue };
                            //Turn on for Debug Mode
                            //console.log("nameSpace :"+nameSpace+", klassName :"+klassName);
                            //[TODO: Consider remove this dependence on global cache]
                            klass = global.klass[nameSpace + "$" + klassName];
                            if (!klass) continue
                            else return pObj;
                        }
                    }

                    return 0x0;
                } //End findClosestObject                
            }// end unityObjExplore



            rpc.exports.findUnityObjectOfType = function (type, isSpecificClass) {
                let fullTypeName = type;
                let objectArray = [];

                if (!isSpecificClass) {
                    if (type.indexOf("$") == -1 && type.indexOf("*") == -1 && type.indexOf(".") == -1)
                        type = "$" + type
                    else {
                        fullTypeName = type.substring(type.lastIndexOf("$") + 1);
                    }


                    var matchedKeys = searchKeys(global.klass, type);
                } else {
                    var matchedKeys = [type]
                }
                //[TODO: Consider to cover other User Assembly Image]
                //var CSharpAssembly = global.assembly["Assembly-CSharp"];//assemblyLoad("Assembly-CSharp"); 

                for (var i = 0; i < matchedKeys.length; i++) {
                    var curType = matchedKeys[i];

                    const klassInfo = global.klass[curType];
                    let imageName = klassInfo["klassImageName"]
                    var CSharpAssembly = global.assembly[imageName];
                    fullTypeName = curType.replace(/\$/g, '.');

                    if (klassInfo) {
                        //console.log("find curType: "+curType +":"+i+"/"+matchedKeys.length)
                        //if (!klassInfo.nameSpace == "undefined") fullTypeName = klassInfo.nameSpace + "." + fullTypeName;
                        // same as fullTypeName = `${klassInfo.nameSpace ?? ''}${klassInfo.nameSpace ? '.' : ''}${type}`;
                    }

                    let ObjectType = assemblyGetType(CSharpAssembly, fullTypeName);

                    let UnityObjectArray = 0x0;
                    try { UnityObjectArray = FindObjectsOfType(ObjectType, 1); } catch (e) {
                        //console.log("FindObjectsOfType failed. \t"+fullTypeName+":"+CSharpAssembly+":"+ObjectType+":"+JSON.stringify(klassInfo))
                    }
                    if (UnityObjectArray == 0x0) {
                        try { UnityObjectArray = FindObjectsOfTypeAll(ObjectType); } catch (e) {
                            //continue; 
                        }
                        if (UnityObjectArray == 0x0) {
                            if (klassInfo["singleton"] != 0x0) objectArray.push(klassInfo["singleton"])
                            continue;
                        } else console.log("WATCHLIST FOUND FindObjectsOfTypeAll USEFUL" + UnityObjectArray)
                    }
                    //if (curType.indexOf("TableHeroEnhance") != -1) console.log("TMPDEBUG: " + curType + ":" + JSON.stringify(objectArray))

                    let UnityObjectCount = UnityObjectArray.add(0x18).readLong();

                    for (let i = 0; i < UnityObjectCount; i++) {
                        var object = UnityObjectArray.add(0x20 + i * 8).readPointer();
                        objectArray.push(object);
                        debugInfo("Found: " + fullTypeName + " in "+imageName+":" + object.toString(16), [object]);

                    }
                }// end for loop matched keys

                return objectArray;

                //Define helper function to help search with wild card (*)
                function searchKeys(obj, pattern) {
                    let escapedPattern;
                    if (pattern.indexOf(".") == -1 && pattern.indexOf("*") == -1) escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    else escapedPattern = pattern

                    const regex = new RegExp(escapedPattern.replace(/\*/g, '.*'), 'i');
                    return Object.keys(obj).filter(key => regex.test(key));
                }
            } //end findObjectOfType

            rpc.exports.transform_get_position = function (transform) {
                let position = get_position(ptr(Number(transform)));
                return position
            }

            rpc.exports.transform_force_redraw_gameobject = function (transform) {
                try {
                    transform = ptr(transform)
                    let gameobjectProp = il2cpp_class_get_property_from_name(il2cpp_object_get_class(transform), 'gameObject')
                    let getPropMethod = il2cpp_property_get_get_method(gameobjectProp)
                    //let methodName = il2cpp_method_get_name(getPropMethod).readCString()
                    //console.log("TMPDEBUG "+ gameobjectProp +":"+ getPropMethod)
                    let domain = il2cpp_domain_get();
                    il2cpp_thread_attach(domain);

                    //NOTE: DO NOT UNBOX OBJECT IF WE WANT TO USE IT AGAIN IN UNITY, OR IT MAY REPORT ERROR
                    //let gameobject =  il2cpp_object_unbox(il2cpp_runtime_invoke(getPropMethod, transform, []));
                    let gameobject = il2cpp_runtime_invoke(getPropMethod, transform, []);
                    //debugInfo("TMPDEBUG gameobject :" + gameobject, [transform]);

                    //console.log("TMPDEBUG "+ gameobject +":"+ ComponentType)
                    //let componentArray = GetComponents2(gameobject, ComponentType);

                    //let getComponentsMethod = il2cpp_class_get_method_from_name(il2cpp_object_get_class(gameobject),'GetComponents',1)

                    //let graphicComp =  il2cpp_object_unbox(il2cpp_runtime_invoke(getComponentsMethod, gameobject, [['int64',Number(ComponentType)]]));
                    //console.log("TMPDEBUG "+ getComponentsMethod +":"+ graphicComp)

                    let componentArray = GetComponents(gameobject, ComponentType, 0, 0, 0, 0, ptr(0));
                    let componentCount = componentArray.add(0x18).readLong();
                    //console.log("TMPDEBUG after component"+ componentArray +":"+ componentCount)
                    //debugInfo("TMPDEBUG found component array and count :" + componentArray + ":" + componentCount, [componentArray]);

                    for (let n = 0; n < componentCount; n++) {
                        let comp = componentArray.add(0x20 + n * 8).readPointer();
                        let method = il2cpp_class_get_method_from_name(il2cpp_object_get_class(transform), 'SetVerticesDirty', 0)
                        //let ret =  il2cpp_object_unbox(il2cpp_runtime_invoke(method, comp, []));
                        //debugInfo("TMPDEBUG gameobject :" + gameobject + ":" + comp + ":" + method, [transform]);
                    }
                } catch (e) {
                    debugInfo("Error forcing redraw gameobject :" + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString(), [transform]);
                }

                return
            }

            rpc.exports.get_main_camera = function () {
                try {

                    let camera = get_mainCamera()

                    if (!camera || camera == 0x0) {
                        //console.log("before get camera count")
                        let cameraCount = GetAllCamerasCount()//get_mainCamera()//CameraType.main;
                        //console.log("TMPDEBUG: " + cameraCount)


                        let allCameras = Memory.alloc(0x20 + 8 * cameraCount);
                        allCameras.add(0x18).writeInt(cameraCount);
                        cameraCount = GetAllCameras(allCameras);
                        debugInfo("Main camera not found, All camera count :" + cameraCount, [allCameras]);

                        for (let i = 0; i < cameraCount; i++) {
                            camera = allCameras.add(0x20 + i * 8).readPointer(); //it will eventually get last camera, if more than one
                        }
                    }
                    return camera
                } catch (e) {
                    debugInfo("Error getting main camera :" + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString(), [UnityEngineAssembly]);
                }
            }

            rpc.exports.raycast_get_first_object_hit = function (position) {
                let ray;
                let camera;
                let vector;
                try {
                    let domain = il2cpp_domain_get();
                    il2cpp_thread_attach(domain);

                    vector = Memory.alloc(4 * 3);
                    vector.writeFloat(position.x);
                    vector.add(4).writeFloat(position.y);
                    vector.add(8).writeFloat(position.z);
                    camera = rpc.exports.get_main_camera()
                    console.log("TMPDEBUG: camera" + camera)
                    let gameObject = rpc.exports.class_get_property_value("UnityEngine", "UnityEngine", "Camera", "gameObject", camera, false)
                    let UnityEngineAssembly = assemblyLoad("UnityEngine");
                    let LineRendererType = assemblyGetType(UnityEngineAssembly, "UnityEngine.LineRenderer");
                    debugInfo("LineRendererType", [LineRendererType])
                    let LineRenderer = rpc.exports.invoke_instance_method(gameObject, "UnityEngine.GameObject", "AddComponent", "pointer", [['int64', LineRendererType]])
                    debugInfo("LineRenderer", [LineRenderer])

                    ObjC.schedule(ObjC.mainQueue, InvokeScreenPointToRay)

                    return "success"


                } catch (e) {
                    debugInfo("Error getting first object hit :" + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString(), [position]);
                    return "fail"
                }

                function InvokeScreenPointToRay(/*camera, position*/) {
                    let image = global.assemblyImage["UnityEngine"]
                    let cameraClass = il2cpp_class_from_name(image, "UnityEngine", "Camera");
                    console.log("TMPDEBUG cameraClass: " + cameraClass)
                    let method = il2cpp_class_get_method_from_name(cameraClass, "ScreenPointToRay", 2);
                    console.log("TMPDEBUG method: " + method)
                    let params = [['vector', position], ['int32', 2]]

                    let domain = il2cpp_domain_get();
                    il2cpp_thread_attach(domain);

                    let ray1 = il2cpp_runtime_invoke(method, camera, params);//Do not unbox, as we will use it in RayCast
                    //method = il2cpp_class_get_method_from_name(il2cpp_class_from_name(image, "UnityEngine", "Ray"), "ToString", 0)
                    //params = []
                    let rayStr;
                    if (ray1 == 0x0 || ray1 == undefined) console.log("TMPDEBUG cannot get ray1")
                    else {
                        console.log("TMPDEBUG ray1" + ray1)
                        rayStr = ray_toString(ray1)//il2cpp_runtime_invoke(method, ray1, params);
                        debugInfo("TMPDEBUG getting ray1 :" + rayStr, [ray1]);
                    }

                    ray = ScreenPointToRay(camera, vector, 2)

                    if (ray == 0x0 || ray == undefined) console.log("TMPDEBUG cannot get ray")
                    else {
                        console.log("TMPDEBUG ray" + ray)
                        rayStr = ray_toString(ray)//il2cpp_runtime_invoke(method, ray, params);
                        debugInfo("TMPDEBUG getting ray :" + rayStr, [ray, ray1]);
                    }

                    //console.log("TMPDEBUG direct ray: "+ ray.readFloat()+":"+ray.add(4).readFloat())

                    //console.log("TMPDEBUG ray: "+ camera+":"+vector+":"+ray)
                    let start = Memory.alloc(4 * 3);
                    start.writeFloat(ray.readFloat());
                    start.add(4).writeFloat(ray.add(4).readFloat());
                    start.add(8).writeFloat(ray.add(8).readFloat());
                    console.log("TMPDEBUG: " + camera + ":" + vector + ":" + ray + ":" + start + ":" + start.readFloat() + ":" + start.add(4).readFloat() + ":" + start.add(8).readFloat())

                    let end = Memory.alloc(4 * 3);
                    end.writeFloat(ray.readFloat(12) * 100);
                    end.add(4).writeFloat(ray.add(16).readFloat() * 100);
                    end.add(8).writeFloat(ray.add(20).readFloat() * 100);
                    console.log("TMPDEBUG: " + camera + ":" + vector + ":" + ray + ":" + start + ":" + end + ":" + end.readFloat() + ":" + end.add(4).readFloat() + ":" + end.add(8).readFloat())

                    let color = rpc.exports.class_get_property_value("UnityEngine", "UnityEngine", "Color", "green", 0x0, false)
                    //console.log("TMPDEBUG: "+ camera+":"+vector+":"+ray+":"+start+":"+end+":"+color)
                    DrawLine(start, end, color, 20)
                    debugInfo("TMPDEBUG DrawLine :" + JSON.stringify(start) + ":" + JSON.stringify(end), [start, end]);
                    return ray;

                    function ray_toString(ray) {
                        let str = "Origin: (" + ray.readFloat().toFixed(2) + ", " + ray.add(4).readFloat().toFixed(2) + ", " + ray.add(8).readFloat().toFixed(2) + ") " +
                            "Dir: (" + ray.add(12).readFloat().toFixed(2) + ", " + ray.add(16).readFloat().toFixed(2) + ", " + ray.add(20).readFloat().toFixed(2) + ") "
                        return str
                    }
                }

            }

            rpc.exports.class_get_property_value = function (imageName, namespaze, klassName, propertyName, obj, unbox) {
                let result;
                let image;
                try {
                    //obj should be ptr(0), if it is a static property
                    obj = ptr(obj)
                    image = global.assemblyImage[imageName]

                    let klass = il2cpp_class_from_name(image, namespaze, klassName)
                    //console.log("TMPDEBUG: "+ image+":"+klass)
                    let prop = il2cpp_class_get_property_from_name(klass, propertyName)
                    //console.log("TMPDEBUG: "+ image+":"+klass+":"+prop)
                    let getPropMethod = il2cpp_property_get_get_method(prop)
                    //console.log("TMPDEBUG: "+ image+":"+klass+":"+prop+":"+getPropMethod)

                    let domain = il2cpp_domain_get();
                    il2cpp_thread_attach(domain);
                    //console.log("TMPDEBUG: "+ image+":"+klass+":"+prop+":"+getPropMethod+":"+domain+":"+unbox)

                    //NOTE: DO NOT UNBOX OBJECT IF WE WANT TO USE IT AGAIN IN UNITY, OR IT MAY REPORT ERROR
                    if (unbox)
                        result = il2cpp_object_unbox(il2cpp_runtime_invoke(getPropMethod, obj, []));
                    else
                        result = il2cpp_runtime_invoke(getPropMethod, obj, []);
                    //debugInfo("TMPDEBUG Static Property :"+ result, [image]);

                } catch (e) {
                    debugInfo("Error getting property :" + imageName + ":" + namespaze + "." + klassName + "." + propertyName + ":" + obj + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString(), [image]);
                }

                return result
            }

            //--------End Unity Related-----------------

            //æ§è¡å°è¿éä¹åscript.load()æä¼è¿å //script.load() will return after execution here
        }

        /***************************************************************/


        /***************************************************************
         * Utility Function defined to support enhanced menu features
         * 
         * *************************************************************/

        const HexToFloat32 = (str) => {
            var int = parseInt(str, 16);
            if (int > 0 || int < 0) {
                var sign = (int >>> 31) ? -1 : 1;
                var exp = (int >>> 23 & 0xff) - 127;
                var mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
                var float32 = 0
                for (i = 0; i < mantissa.length; i += 1) { float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0; exp-- }
                return float32 * sign;
            } else return 0
        }

        const HexToDouble64 = (str) => {
            if (str.length != 16) return 0;

            // Convert the input hex value to a 64-bit integer
            var int = BigInt("0x" + str);

            if (int > 0 || int < 0) {
                // Determine the sign, exponent, and mantissa of the double value
                var sign = (int >> 63n) ? -1 : 1;
                var exp = Number((int >> 52n) & 0x7ffn) - 1023;
                var mantissa = Number((int & 0xfffffffffffffn) | 0x10000000000000n);

                // Calculate the double value
                var double64 = sign * mantissa * Math.pow(2, exp - 52);

                return double64;
            } else {
                return 0;
            }
        }

        function get64bitBigEndian(hex) {
            // Convert the input hex to a BigInt
            const inputBigInt = BigInt(hex);

            // Create a new DataView with an 8-byte buffer
            const buffer = new ArrayBuffer(8);
            const dataView = new DataView(buffer);

            // Write the BigInt to the DataView in big-endian format
            dataView.setBigUint64(0, inputBigInt);

            // Convert the DataView to a hex string
            let outputHex = "";
            for (let i = 7; i >= 0; i--) {
                outputHex += dataView.getUint8(i).toString(16).padStart(2, "0");
            }

            // Output the result
            return outputHex;
        }

        //Make the DIV element draggagle:
        //dragElement(document.getElementById("popup_writeinstruction"));
        function dragElement(elmnt) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (document.getElementById(elmnt.id + "header")) {
                /* if present, the header is where you move the DIV from:*/
                document.getElementById(elmnt.id + "header").ontouchstart = dragMouseDown;
            } else {
                /* otherwise, move the DIV from anywhere inside the DIV:*/
                elmnt.ontouchstart = dragMouseDown;
            }

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.touches[0].clientX;
                pos4 = e.touches[0].clientY;
                document.ontouchend = closeDragElement;
                // call a function whenever the cursor moves:
                document.ontouchmove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.touches[0].clientX;
                pos2 = pos4 - e.touches[0].clientY;
                pos3 = e.touches[0].clientX;
                pos4 = e.touches[0].clientY;
                // set the element's new position:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                /* stop moving when mouse button is released:*/
                document.ontouchend = null;
                document.ontouchmove = null;
            }
        }

        function dragTableElement(mytable) {
            var lastOffset = -1;
            mytable.ontouchstart = dragTouchStart;

            function dragTouchStart(event) {
                if (event.target.nodeName === "TD") {
                    // Remove the 'selected' class from all cells, clear the table and start over
                    var cells = document.getElementsByTagName('td');
                    for (var i = 0; i < cells.length; i++) {
                        cells[i].classList.remove('selected');
                    }

                    event.target.classList.add("selected");
                    lastOffset = parseInt(event.target.getAttribute('offset'), 16);
                    $("label#memoffset").text(lastOffset.toString(16).toUpperCase());
                    mytable.ontouchmove = dragTouchMove;
                    mytable.ontouchend = dragTouchEnd;
                    dispaySelectedValue();
                }
            }
            function dragTouchMove(event) {
                var currentCell = document.elementFromPoint(
                    event.touches[0].clientX,
                    event.touches[0].clientY
                );
                if (!currentCell) return; // handle drag out of table boundary
                if (currentCell.nodeName === "TD") {
                    currentOffset = parseInt(currentCell.getAttribute('offset'), 16);
                    if (Math.abs(currentOffset - lastOffset) <= 1) {
                        currentCell.classList.add("selected");
                        lastOffset = currentOffset;
                    }
                    dispaySelectedValue();
                }
            }
            function dragTouchEnd(event) {
                mytable.ontouchmove = null;
                mytable.ontouchend = null;
            }
            function dispaySelectedValue() {
                var hex = "";
                var bits = 0;
                var cells = document.getElementsByTagName('td');
                for (var i = 0; i < cells.length; i++) {
                    if (cells[i].classList.contains('selected')) {
                        hex = cells[i].innerHTML + hex;
                        bits += 8;
                    }
                }
                var int = parseInt(hex, 16);

                var float = HexToFloat32(hex);
                float = Math.round((float + Number.EPSILON) * 100) / 100;
                switch (bits) {
                    case 8:
                    case 16:
                    case 24:
                        document.getElementById("selectedMemShort").innerHTML = int;
                        document.getElementById("selectedMemInt").innerHTML = "";
                        document.getElementById("selectedMemFloat").innerHTML = "";
                        document.getElementById("selectedMemDouble").innerHTML = "";
                        break;
                    case 32:
                    case 40:
                    case 48:
                    case 56:
                        document.getElementById("selectedMemShort").innerHTML = "";
                        document.getElementById("selectedMemInt").innerHTML = int;
                        document.getElementById("selectedMemFloat").innerHTML = float;
                        document.getElementById("selectedMemDouble").innerHTML = "";
                        break;
                    case 64:
                        var double = HexToDouble64(hex);

                        var unityPtr = "0x" + hex
                        var ptrString = "";
                        if ("0x" + hex > 0x100000000 && "0x" + hex < 0x2F0000000)
                            ptrString = '<a href=# onclick="onShowMemoryInfo(true,' + unityPtr + ')">' + unityPtr + '</a>';
                        double = Math.round((double + Number.EPSILON) * 100) / 100;
                        document.getElementById("selectedMemShort").innerHTML = "";
                        document.getElementById("selectedMemInt").innerHTML = ptrString;
                        document.getElementById("selectedMemFloat").innerHTML = "";
                        document.getElementById("selectedMemDouble").innerHTML = double;
                        break;
                }
            }
        }

        var timer;
        function longTouchOpenUnityObj(address) {
            // Start the timer when the user touches the screen
            timer = setTimeout(function () {
                // If the timer completes, the user has performed a long press
                var result = onShowUnityObjInfo(true, address);
            }, 1500); // Set the duration of the long press here (in milliseconds)
        }
        function resetTouch() {
            clearTimeout(timer);
        }

        /* Get current time in hh:mm format */
        function getCurTime() {
            // Create a new Date object
            var now = new Date();

            // Get the current hour and minute
            var hours = now.getHours();
            var minutes = now.getMinutes();

            // Format the hours and minutes with leading zeros
            hours = ("0" + hours).slice(-2);
            minutes = ("0" + minutes).slice(-2);

            // Combine the hours and minutes into a string
            var time = hours + ":" + minutes;

            return time;
        }

        /* Memory access related */
        function getBase() {
            var modules = h5gg.getRangesList("UnityFramework"); //Module Name
            return modules[0].start; //module base addr in runtime memory
        }

        function readBoolean(addr) {
            return Number(h5gg.getValue(addr, "I8"));
        }

        function readInt(addr) {
            return Number(h5gg.getValue(addr, "I32"));
        }

        function readLong(addr) {
            return Number(h5gg.getValue(addr, "I64"));
        }

        function readFloat(addr) {
            return Number(h5gg.getValue(addr, "F32"));
        }

        function readDouble(addr) {
            return Number(h5gg.getValue(addr, "F64"));
        }

        function readPtr(addr) {
            return Number(h5gg.getValue(addr, "U64"));
        }

        function writeBoolean(addr, value) {
            h5gg.setValue(addr, value, "I8");
        }

        function writeInt(addr, value) {
            h5gg.setValue(addr, value, "I32");
        }

        function writeLong(addr, value) {
            h5gg.setValue(addr, value, "I64");
        }

        function writeFloat(addr, value) {
            h5gg.setValue(addr, value, "F32");
        }

        function writeDouble(addr, value) {
            h5gg.setValue(addr, value, "F64");
        }

        function getRealZIndex(element) {
            let zIndex = 0;
            let parent = element.offsetParent;
            if (parent) {
                const parentZIndex = getComputedStyle(parent).zIndex;
                if (parentZIndex !== 'auto') {
                    zIndex = parseInt(parentZIndex);
                }
                zIndex += getRealZIndex(parent); // Recursively check ancestors
            }
            return zIndex;
        }

        function debugInfo(message, obj) {
            gDebug.push({
                text: message,
                address: obj
            }); //data format {text:textmessage, address:[0x1234, 0x5678], objData:[00 01 02, 03 04 05]} 
        }

        //START: Define Unity List Object for easy List access
        function UnityList(address) {
            this._address = address;
            this._size = readInt(Number(address) + 0x18);
            this._items = readPtr(Number(address) + 0x10);
        }

        UnityList.prototype.size = function () {
            return this._size;
        }

        UnityList.prototype.get_Item = function (index) {
            //NOT SURE IF IT HAS TO BE POINTER, WHAT HAPPENS TO PRIMITIVE TYPES
            //Normally what we really want is object of certain type of interest, say Player, Skill, etc
            return readPtr(Number(this._items) + 0x20 + (index * 8));
        }
        //END: Define Unity List Object for easy List access

        //START: Define Unity Array Object for easy Array access
        function UnityArray(address) {
            this._address = address;
            this._size = readInt(Number(address) + 0x18);
        }

        UnityArray.prototype.size = function () {
            return this._size;
        }

        UnityArray.prototype.get_Item = function (index) {
            //NOT SURE IF IT HAS TO BE POINTER, WHAT HAPPENS TO PRIMITIVE TYPES
            //Normally what we really want is object of certain type of interest, say Player, Skill, etc
            return readPtr(Number(this._address) + 0x20 + (index * 8));
        }
        //END: Define Unity Array Object for easy Array access

        //START: Define Unity Dictionary Object for easy Dictionary access
        function UnityDictionary(address) {
            this._address = address;
            this._size = readInt(Number(address) + 0x20);
            this._entries = readPtr(Number(address) + 0x18);
        }

        UnityDictionary.prototype.size = function () {
            return this._size;
        }

        UnityDictionary.prototype.get_Item = function (index) {
            //NOT SURE IF IT HAS TO BE POINTER, WHAT HAPPENS TO PRIMITIVE TYPES
            //Normally what we really want is object of certain type of interest, say Player, Skill, etc
            return readPtr(Number(this._entries) + 0x20 + (index * 0x18) + 0x10);
        }
        //END: Define Unity Dictionary Object for easy Dictionary access

        //START: Define Unity Object for easy access
        function UnityObject(address) {
            this._address = address;
            this._script = initializeUnitySupport();
            this._objectDetails = this._script.call("unityObjExplore", [Number(this._address), true])[0]
            this._params = {}
        }

        //fields array format ["field1","field2"]
        //Put as much as field you want to load in array
        UnityObject.prototype.loadFields = function (fields) {
            if (fields == undefined || fields.length == 0) throw "Invalid field list to load. Please provide field name list as Array."
            let fieldsDetails = this._objectDetails["fieldDetails"]
            for (let i = 0; i < fields.length; i++) {

                Object.defineProperty(this, fields[i], {
                    get: function () {
                        var offset, fieldClassName, field_is_enum;

                        for (var j = 0; j < fieldsDetails.length; j++) {
                            var field = fieldsDetails[j];
                            if (field.fieldName === fields[i]) {
                                offset = field.offset;
                                fieldClassName = field.fieldClassName;
                                field_is_enum = field.field_is_enum;
                                break;
                            }
                        }
                        if (!fieldClassName) return "-9876"

                        //[TODO] Handle Enum as int8 for now
                        let value = getFieldValue(Number(this._address) + Number(offset), field_is_enum == 1 ? 'int8' : fieldClassName.toLowerCase())
                        debugInfo("Get field: " + fields[i] + "(" + (field_is_enum ? "isEnum" : "isNotEnum") + "," + fieldClassName + ") with value:" + (value > 0x100000000 ? "0x" + value.toString(16) : value), [this._address])

                        return value
                    },
                    set: function (value) {
                        var offset, fieldClassName, field_is_enum;

                        for (var j = 0; j < fieldsDetails.length; j++) {
                            var field = fieldsDetails[j];
                            if (field.fieldName === fields[i]) {
                                offset = field.offset;
                                fieldClassName = field.fieldClassName;
                                field_is_enum = field.field_is_enum;
                                break;
                            }
                        }
                        if (!fieldClassName) return "-9876"
                        debugInfo("Set field: " + fields[i] + "(" + (field_is_enum ? "isEnum" : "isNotEnum") + "," + fieldClassName + ") with value:" + (value > 0x100000000 ? "0x" + value.toString(16) : value), [this._address])
                        //[TODO] Handle Enum as int8 for now
                        return setFieldValue(Number(this._address) + Number(offset), value, field_is_enum == 1 ? 'int8' : fieldClassName.toLowerCase())

                    }
                });
            }
        }

        //methods array format ["int32 methodABC(pointer, int, boolean)","void methodAction()"]
        //Put as much as method you want to load in array
        UnityObject.prototype.loadMethods = function (methods) {
            if (methods == undefined || methods.length == 0) throw "Invalid method list to load. Please provide method name list as Array."
            for (let i = 0; i < methods.length; i++) {
                const { returnType, methodName, argTypes } = parseFunctionSignature(methods[i])
                this._params[methodName] = argTypes
                Object.defineProperty(this, methodName, {
                    get: function () {
                        return function (...args) {
                            if (args.length != this._params[methodName].length) throw "Invalid argument count."
                            let params = []
                            for (let j = 0; j < args.length; j++) {
                                params.push([this._params[methodName][j], args[j]])
                            }

                            debugInfo("Run method: " + this._objectDetails["objectClassNameSpace"] + '$' + this._objectDetails["objectClassName"] + "." + methodName + "(" + JSON.stringify(params) + ") on " + this._address, [this._address])
                            return this._script.call("invoke_instance_method", [this._address, this._objectDetails["objectClassNameSpace"] + '$' + this._objectDetails["objectClassName"], methodName, returnType, params])
                        };
                    }
                });
            } // end for loop

            function parseFunctionSignature(signature) {
                const regex = /^(\w+)\s+(\w+)\(([\w\s,]*)\)$/;
                const match = signature.match(regex);
                if (!match) {
                    throw new Error('Invalid function signature');
                }
                const returnType = match[1];
                const methodName = match[2];
                const argTypes = match[3].split(',').map(argType => argType.trim()).filter(argType => argType !== '');
                return { returnType, methodName, argTypes };
            }
        }
        UnityObject.prototype.initialiseAllFields = function () {
            let lv1node = window.gUnityClasses[this._objectDetails["objectClassNameSpace"] + '$' + this._objectDetails["objectClassName"]]
            for (let level2Key in lv1node) {
                if (lv1node.hasOwnProperty(level2Key)) {
                    let offset = lv1node[level2Key]["offset"]
                    if (!isNaN(offset)) {
                        Object.defineProperty(this, level2Key, {
                            get: function () {
                                return getFieldValue(Number(this._address) + Number(offset), lv1node[level2Key]["fieldClassName"].toLowerCase())
                            },
                            set: function (value) {
                                return setFieldValue(Number(this._address) + Number(offset), value, lv1node[level2Key]["fieldClassName"].toLowerCase())
                            }
                        });
                    }
                }
            }
        }


        function getFieldValue(addr, type) {
            try {
                switch (type) {
                    case "int8":
                        return Number(h5gg.getValue(addr, "I8"));
                        break;
                    case "int16":
                        return Number(h5gg.getValue(addr, "I16"));
                        break;
                    case "int32":
                        return Number(h5gg.getValue(addr, "I32"));
                        break;
                    case "int64":
                        return Number(h5gg.getValue(addr, "I64"));
                        break;
                    case "single":
                        return Number(h5gg.getValue(addr, "F32"));
                        break;
                    case "double":
                        return Number(h5gg.getValue(addr, "F64"));
                        break;
                    case "boolean":
                        return Number(h5gg.getValue(addr, "I8"));
                        break;
                    case "text":
                    case "string":
                        return script.call("pointerGetString", [addr]);;

                        break;
                    default:
                        return Number(h5gg.getValue(addr, "U64"));
                }//end switch
            } catch (e) {
                debugInfo("Error getting field value :" + type + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString() + ":" + klassName, [pointer]);
                return "error"
            }
        } // end getFieldValue

        function setFieldValue(addr, value, type) {
            try {
                switch (type) {
                    case "int8":
                        return h5gg.setValue(addr, Number(value), "I8");
                        break;
                    case "int16":
                        return h5gg.setValue(addr, Number(value), "I16");
                        break;
                    case "int32":
                        return h5gg.setValue(addr, Number(value), "I32");
                        break;
                    case "int64":
                        return h5gg.setValue(addr, Number(value), "I64");
                        break;
                    case "single":
                        return h5gg.setValue(addr, Number(value), "F32");
                        break;
                    case "double":
                        return h5gg.setValue(addr, Number(value), "F64");
                        break;
                    case "boolean":
                        return h5gg.setValue(addr, Number(value), "I8");
                        break;
                    case "text":
                    case "string":
                        //return script.call("pointerGetString", [addr]);

                        break;
                    default:
                        return h5gg.setValue(addr, Number(value), "U64");
                }//end switch
            } catch (e) {
                debugInfo("Error setting field value :" + value + ":" + type + ":" + JSON.stringify(e, Object.getOwnPropertyNames(e)) + ":" + e.toString() + ":" + klassName, [pointer]);
                return "error"
            }
        } // end setFieldValue

        //END: Define Unity Object for easy access
