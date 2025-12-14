function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
};

function rem_salt() {
    if (document.getElementById("rs").checked) {
        setCookie("rs", "yes", 3650);
    } else {
        setCookie("rs", "no", 3650);
        setCookie("st", "", 0);
    }
};

function rem_pass() {
    if (document.getElementById("rp").checked) {
        setCookie("rp", "yes", 3650);
    } else {
        setCookie("rp", "no", 3650);
        setCookie("pd", "", 0);
    }
};

function hide_draw() {
    if (document.getElementById("hd").checked) {
        setCookie("hd", "yes", 3650);
    } else {
        setCookie("hd", "no", 3650);
    }
};

function inv_color() {
    if (document.getElementById("ic").checked) {
        setCookie("ic", "yes", 3650);
        document.getElementById("plate").className = "light";
    } else {
        setCookie("ic", "no", 3650);
        document.getElementById("plate").className = "dark";
    }
};

function lab_segment() {
    if (document.getElementById("ls").checked) {
        setCookie("ls", "yes", 3650);
    } else {
        setCookie("ls", "no", 3650);
    }
};

var rs = true;
var rp = false;
var hd = false;
var ic = true;
var ls = true;
if (getCookie("rs") == "no") {
    rs = false;
}
if (getCookie("rp") == "yes") {
    rp = true;
}
if (getCookie("hd") == "yes") {
    hd = true;
}
if (getCookie("ic") == "no") {
    ic = false;
    document.getElementById("plate").className = "dark";
}
if (getCookie("ls") == "no") {
    ls = false;
}
document.getElementById("rs").checked = rs;
document.getElementById("rp").checked = rp;
document.getElementById("hd").checked = hd;
document.getElementById("ic").checked = ic;
document.getElementById("ls").checked = ls;

document.getElementById("rs").addEventListener("click", rem_salt);
document.getElementById("rp").addEventListener("click", rem_pass);
document.getElementById("hd").addEventListener("click", hide_draw);
document.getElementById("ic").addEventListener("click", inv_color);
document.getElementById("ls").addEventListener("click", lab_segment);
