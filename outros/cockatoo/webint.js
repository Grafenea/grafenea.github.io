function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
};

var ornt = window.matchMedia("(orientation: portrait)").matches,
rs = (getCookie("rs") == "no") ? false : true,
st = getCookie("st"),
rp = (getCookie("rp") == "yes") ? true : false,
pd = getCookie("pd"),
hd = (getCookie("hd") == "yes") ? true : false,
ic = (getCookie("ic") == "no") ? false : true,
ls = (getCookie("ls") == "no") ? false : true,
tm = (getCookie("tm") == "no") ? false : true,
gm = (getCookie("gm") == "no") ? false : true,
sl = document.getElementById("salt"),
pw = document.getElementById("password");
document.getElementById("site").value = "enter name";
document.getElementById("revealer").checked = false;
if (rs && st != "") {
    sl.style.color = "black";
    sl.value = st;
} else {
    sl.value = "optional";
}
if (rp && pd != "") {
    pw.style.color = "black";
    pw.value = pd;
    pw.setAttribute("type", "password");
} else {
    pw.value = "strong only!";
}
if (!ic) {
    document.getElementById("plate").className = "dark";
    document.getElementById("cockatoo").className = "darkbutton";
    document.getElementById("cockimage").src = "icon128w.png";
    document.getElementById("reset").className = "darkbutton";
    document.getElementById("enter").className = "darkbutton";
}
ch_mode();

function ch_mode() {
    setCookie("tm", ((tm) ? "yes" : "no"), 3650);
    setCookie("gm", ((gm) ? "yes" : "no"), 3650);
    document.getElementById("passpart").style.display = (tm) ? "block" : "none";
    document.getElementById("drawings").style.display = (gm) ? "block" : "none";
    fitIt();
};
function ch_st(p) { if (rs) setCookie("st", p, 3650); };
function ch_pd(p) { if (rp) if (confirm("CAUTION: DO YOU REALLY WANT IT TO REMEMBER YOUR PASSWORD - IT'S DANGEROUS! ARE YOU SURE?") == true) setCookie("pd", p, 3650); };

function inject_p(p) {
    prompt("Your password is:", p);
    location.reload();
};

function fitIt() {
    var rect = document.getElementById("plate").getBoundingClientRect(),
    rr = window.innerHeight / window.innerWidth,
    metatag = document.getElementById("vp");
    metatag.parentNode.removeChild(metatag);
    metatag = document.createElement("meta");
    metatag.id = "vp";
    metatag.name = "viewport";
    metatag.content = "height=" + ((rr < rect.height / rect.width) ? rect.height : rect.width * rr).toString();
    document.head.appendChild(metatag);
};

function reSize() {
    var cornt = window.matchMedia("(orientation: portrait)").matches;
    if (cornt != ornt) {
        ornt = cornt;
        fitIt();
    }
};

function showHeart() {
var hcds = [
{ bx: 12, by: 24, mx: 9, my: 27 },
{ bx: 6, by: 30, mx: 3, my: 27 },
{ bx: 0, by: 24, mx: -2.4, my: 21 },
{ bx: 0, by: 18, mx: 3, my: 15.6 },
{ bx: 6, by: 18, mx: 9, my: 15.6 },
{ bx: 12, by: 18, mx: 12, my: 15 },
{ bx: 12, by: 12, mx: 15, my: 9 },
{ bx: 18, by: 6, mx: 21, my: 3 },
{ bx: 24, by: 0, mx: 27, my: 3 },
{ bx: 30, by: 6, mx: 27, my: 9 },
{ bx: 24, by: 12, mx: 21, my: 15 },
{ bx: 18, by: 18, mx: 15, my: 18 },
{ bx: 12, by: 18, mx: 12, my: 15 },
{ bx: 12, by: 12, mx: 14.4, my: 15 },
{ bx: 12, by: 18, mx: 15, my: 15.6 },
{ bx: 18, by: 18, mx: 0, my: 0 }
];
    for (var i = 0; i < 15; i++) {
        showSegment(i, hcds[i].bx, hcds[i].by, hcds[i].mx, hcds[i].my, hcds[i + 1].bx, hcds[i + 1].by);
        seg[i].setAttribute("stroke-dasharray", "");
        seg[i].setAttribute("stroke", "#808080");
    }
    seg[4].setAttribute("stroke-dasharray", "1, 6");
};

window.addEventListener("resize", reSize, false);
