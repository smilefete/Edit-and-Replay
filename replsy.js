/**
 *
 * Created by smilefete on 2015/4/22.
 * Copyright (c) 2015 tozooo. All rights reserved.
 *
 */
var gContentPre = "";
var gContentNow = "";
var gFlow = new Array();
var gTimer;
var gCount;
var gCursorBegin=0;
var gCursorEnd=0;
var gEditArea = document.getElementById("edit-content");
$(document).ready(function() {
    $("textarea").on('keydown', function(e) {
        if(e.keyCode >=33&&e.keyCode<=40){
            //home(36),end(35),up(38),down(40),left(37),right(39),pageup(33),pagedown(34)
            //这几个键移动光标
            record();
            record_cursor();
        }else if (e.keyCode == 9) {
            //Tab键
            e.preventDefault();
            var indent = '    ';
            var start = this.selectionStart;
            var end = this.selectionEnd;
            var selected = window.getSelection().toString();
            selected = indent + selected.replace(/\n/g, '\n' + indent);
            this.value = this.value.substring(0, start) + selected + this.value.substring(end);
            this.setSelectionRange(start + indent.length, start + selected.length);

            record();
        }else{
            record();
        }
        //console.log(gContentPre);
        //console.log(gFlow[gFlow.length-1]);
        
    });
    $("#btn-replay").click(function() {
        //record();
        gCount = 0;
        $("#edit-content").val("");
        if($("#edit-percent").val()>0&&$("#edit-percent").val()<100){
            skip($("#edit-percent").val());
        }
        gTimer = setInterval("replay()", 100);
    });
    $("#btn-help").click(function() {
        console.log($("#edit-percent").val()>0&&$("#edit-percent").val()<100);

    });

});

/*
    记录光标的移动
*/
function record_cursor(){
    var pos=getCursorPosition(gEditArea);//该函数在移动方向键之后调用，所以返回的值pos.begin==pos.end

    if(gCursorBegin!=gCursorEnd||gCursorBegin!=pos.begin){
        //光标由面变成点||光标移动
        var once={
            ope:4,
            pos:pos.begin,
            len:0,
            str:""
        };
        gFlow.push(once);
        gCursorBegin=gCursorEnd=pos.begin;
    }
}
/*
    记录操作步骤
*/
function record() {
    gContentNow = $("#edit-content").val();
    if(gContentNow==gContentPre){
        return ;
    }
    var i = 0;
    var lenPre = gContentPre.length;
    var lenNow = gContentNow.length;
    while (i < lenPre && i < lenNow) {
        if (gContentNow[i] != gContentPre[i]) {
            break;
        }
        i++;
    }
    var begin = i;
    var j = lenNow - 1;
    i = lenPre - 1;
    while (i >= begin && j >= begin) {
        if (gContentNow[j] != gContentPre[i]) {
            break;
        }
        i--;
        j--;
    }
    //记录每一次操作的具体内容
    var ope, pos, len, str;
    if (i == begin - 1) {
        //add
        ope = 1;
        pos = begin;
        len = j - begin + 1;
        str = gContentNow.substr(begin, len);
    } else if (j == begin - 1) {
        //del
        ope = 2;
        pos = begin;
        len = i - begin + 1;
        str = "";
    } else {
        //modify
        ope = 3;
        pos = begin;
        len = i - begin + 1;
        str = gContentNow.substr(begin, j - begin + 1);
    }
    var once = {
        ope: ope,
        pos: pos,
        len: len,
        str: str
    };
    gFlow.push(once);
    gContentPre = gContentNow;
}

/*
    进度控制
*/
function skip(percent){
    var content="";
    var end=parseInt(gFlow.length*percent/100);
    var length=content.length;
    for(var i=0;i<end;i++){
        length=content.length;
        switch (gFlow[i].ope) {
            case 1:
                content = content.substring(0, gFlow[i].pos) + gFlow[i].str + content.substring(gFlow[i].pos, length);
                break;
            case 2:
                content = content.substring(0, gFlow[i].pos) + content.substring(gFlow[i].pos + gFlow[i].len, length);
                break;
            case 3:
                content = content.substring(0, gFlow[i].pos) + gFlow[i].str + content.substring(gFlow[i].pos + gFlow[i].len, length);
                break;
            case 4:
                break;
            default:
                break;
        }
    }
    gCount=i;
    gContentPre=content;
    $("#edit-content").val(content);
    gEditArea.focus();
}
/*
    回放操作步骤
*/
function replay() {
    if (gCount < gFlow.length) {
        var content = $("#edit-content").val();
        var length = content.length;
        var tmp;
        switch (gFlow[gCount].ope) {
            case 1:
                //console.log('---'+content.substring(0, gFlow[gCount].pos) +','+ gFlow[gCount].str+','+ content.substring(gFlow[gCount].pos, length));
                tmp = content.substring(0, gFlow[gCount].pos) + gFlow[gCount].str + content.substring(gFlow[gCount].pos, length);
                break;
            case 2:
                tmp = content.substring(0, gFlow[gCount].pos) + content.substring(gFlow[gCount].pos + gFlow[gCount].len, length);
                break;
            case 3:
                tmp = content.substring(0, gFlow[gCount].pos) + gFlow[gCount].str + content.substring(gFlow[gCount].pos + gFlow[gCount].len, length);
                break;
            case 4:
                setCursorPosition(gEditArea,1,gFlow[gCount]);
                $("#show-percent").text(gFlow.length+"("+gCount+")");
                gCount++;
                return;
            default:
                break;
        }
        setCursorPosition(gEditArea,1,gFlow[gCount]);
        $("#edit-content").val(tmp);
        setCursorPosition(gEditArea,2,gFlow[gCount]);
        $("#show-percent").text(gFlow.length+"("+gCount+")");
        gCount++;

    } else {
        console.log("replay end");
        clearInterval(gTimer);
    }
}

function setCursorPosition(textarea, flag, objFlow) {
    var begin,end;
    if (flag == 1) {
        //操作之前
        switch (objFlow.ope) {
            case 1:
                begin=objFlow.pos;
                end=begin;
                break;
            case 2:
                begin=objFlow.pos+objFlow.len;
                end=begin;
                break;
            case 3:
                begin=objFlow.pos;
                end=begin+objFlow.len;
                break;
            case 4:
                begin=objFlow.pos;
                end=begin;
                break;
            default:
                break;
        }
    } else {
        //操作之后
        switch (objFlow.ope) {
            case 1:
                begin=objFlow.pos+objFlow.len;
                end=begin;
                break;
            case 2:
                begin=objFlow.pos;
                end=begin;
                break;
            case 3:
                begin=objFlow.pos;
                end=objFlow.pos+objFlow.str.length;
                break;
            default:
                break;
        }
    }
    //console.log('begin='+begin+',end='+end);
    if (textarea.setSelectionRange) { // W3C
        textarea.focus();
        textarea.setSelectionRange(begin, end);
    } else if (textarea.createTextRange) { // IE

    }
}


/*
    获得textarea中的光标位置
*/
function getCursorPosition(textarea) {
    var pos = {
        begin: 0,
        end: 0
    };
    textarea.focus();
    if (textarea.setSelectionRange) { // W3C
        pos.begin = textarea.selectionStart;
        pos.end = textarea.selectionEnd;
    } else if (document.selection) { // IE
       
    }

    return pos;
}