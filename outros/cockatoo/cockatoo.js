//  Cockatoo is written by Alex Anderson:
//  Copyright © 2015, Alex Anderson
//  All rights reserved.
//  It is licensed under the 2-clause BSD license,
//  which can be found in the LICENSE file.

//  Cockatoo uses js-scrypt,
//  which is written by Tony Garnock-Jones:
//  Copyright © 2013, Tony Garnock-Jones
//  All rights reserved.
//  It is licensed under the 2-clause BSD license,
//  which can be found in the LICENSE file.

//  js-scrypt relies on scrypt itself,
//  which is written by Colin Percival:
//  Copyright 2009 Colin Percival
//  All rights reserved.
//  It is licensed under the 2-clause BSD license,
//  which can be found in the LICENSE file.

var svg = document.getElementById("drawings"),
psp = document.getElementById("passpart");
svg.onselectstart = function () { return false; };
svg.oncontextmenu = function () { return false; };
svg.style.MozUserSelect = "none";
svg.style.KhtmlUserSelect = "none";
svg.unselectable = "on";
svg.addEventListener("touchstart", touchStart, false);
svg.addEventListener("touchend", touchEnd, false);
svg.addEventListener("touchcancel", touchCancel, false);
svg.addEventListener("touchleave", touchLeave, false);
svg.addEventListener("touchmove", touchMove, false);
svg.addEventListener("mousemove", mouseMove, false);
svg.addEventListener("mousedown", Down, false);
svg.addEventListener("mouseup", Up, false);

var resetenabled = false,
enterenabled = false,
stch = false,
pdch = false,
resite = /.+/,
repass = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{12,}/,
resign = /.{18,}/,
scrypt = scrypt_module_factory(),
reset = document.getElementById("reset"),
enter = document.getElementById("enter"),
cockatoo = document.getElementById("cockatoo"),
revealer = document.getElementById("revealer"),
site = document.getElementById("site"),
password = document.getElementById("password"),
salt = document.getElementById("salt"),
curlen = 0,
drawing = "";

reset.onclick = resetClick;
enter.onclick = enterClick;
enter.onfocus = inpInput;
cockatoo.onclick = cockatooClick;
revealer.onclick = revealerClick;
site.oninput = inpInput;
site.onfocus = siteFocus;
password.oninput = passInput;
password.onfocus = passFocus;
salt.oninput = saltInput;
salt.onfocus = saltFocus;

var mouse = new Object;
mouse.x = 0;
mouse.y = 0;

var seg = new Array(48),
pots = new Array(6),
codes = new Array(48),
bx = 0,
by = 0,
ex = 0,
ey = 0,
cx = 0,
cy = 0,
el,
row,
curseg = 0,
draw = false;

var nss = "http://www.w3.org/2000/svg";
for (var col = 0; col < 6; col++) {
    el = document.createElementNS(nss, "line");
    el.setAttribute("x1", (col * 66 + 25).toString());
    el.setAttribute("y1", "1");
    el.setAttribute("x2", (col * 66 + 25).toString());
    el.setAttribute("y2", "379");
    el.setAttribute("style", "stroke: lightgray; stroke-width: 1");
    svg.appendChild(el);
    el = document.createElementNS(nss, "line");
    el.setAttribute("x1", "1");
    el.setAttribute("y1", (col * 66 + 25).toString());
    el.setAttribute("x2", "379");
    el.setAttribute("y2", (col * 66 + 25).toString());
    el.setAttribute("style", "stroke: lightgray; stroke-width: 1");
    svg.appendChild(el);
}

for (col = 0; col < 6; col++) {
    for (row = 0; row < 6; row++) {
        el = document.createElementNS(nss, "circle");
        el.setAttribute("cx", (row * 66 + 25).toString());
        el.setAttribute("cy", (col * 66 + 25).toString());
        el.setAttribute("r", "2");
        el.setAttribute("stroke", "white");
        el.setAttribute("stroke-width", "2");
        el.setAttribute("fill", "black");
        svg.appendChild(el);
    }
}

for (row = 0; row < 48; row++) {
    seg[row] = document.createElementNS(nss, "path");
    seg[row].setAttribute("fill", "none");
    seg[row].setAttribute("stroke", "black");
    seg[row].setAttribute("stroke-width", 4);
    seg[row].setAttribute("stroke-linecap", "round");
    seg[row].setAttribute("visibility", "hidden");
    svg.appendChild(seg[row]);
}

for (col = 0; col < 6; col++) {
    pots[col] = new Array(6);
    for (row = 0; row < 6; row++) {
        pots[col][row] = document.createElementNS(nss, "circle");
        pots[col][row].setAttribute("cx", (row * 66 + 25).toString());
        pots[col][row].setAttribute("cy", (col * 66 + 25).toString());
        pots[col][row].setAttribute("r", "3");
        pots[col][row].setAttribute("stroke", "black");
        pots[col][row].setAttribute("stroke-width", "2");
        pots[col][row].setAttribute("fill", "white");
        svg.appendChild(pots[col][row]);
    }
}

var pcursor = document.createElementNS(nss, "circle");
pcursor.setAttribute("visibility", "hidden");
pcursor.setAttribute("r", "5");
pcursor.setAttribute("stroke", "white");
pcursor.setAttribute("stroke-width", "1");
pcursor.setAttribute("fill", "black");
svg.appendChild(pcursor);
var pround = document.createElementNS(nss, "circle");
pround.setAttribute("visibility", "hidden");
pround.setAttribute("r", "17");
pround.setAttribute("stroke-width", "2");
pround.setAttribute("fill", "black");
svg.appendChild(pround);
var plabel = document.createElementNS(nss, "text");
plabel.setAttribute("visibility", "hidden");
plabel.setAttribute("stroke", "lightgray");
plabel.setAttribute("stroke-width", "1");
plabel.setAttribute("fill", "white");
plabel.style.textShadow = "none";
svg.appendChild(plabel);
showHeart();

//cockatoo.focus();

function touchStart(e) {
    e.preventDefault();
    var touches = e.changedTouches;
    Move(touches[0].clientX, touches[0].clientY);
    Down();
};

function touchEnd(e) {
    e.preventDefault();
    var touches = e.changedTouches;
    Move(touches[0].clientX, touches[0].clientY);
    Up();
};

function touchCancel(e) {
    e.preventDefault();
    Up();
};

function touchLeave(e) {
    e.preventDefault();
    Up();
};

function touchMove(e) {
    e.preventDefault();
    var touches = e.changedTouches;
    Move(touches[0].clientX, touches[0].clientY);
};

function mouseMove(e) {
    Move(e.clientX, e.clientY);
};

function Move(x, y) {
    var add = 0,
    rect = svg.getBoundingClientRect(),
    rx = x - rect.left,
    ry = y - rect.top;
    if (mouse.x != rx || mouse.y != ry) {
        mouse.x = rx;
        mouse.y = ry;
        pcursor.setAttribute("cx", mouse.x);
        pcursor.setAttribute("cy", mouse.y);
        if (draw) {
            var tx;
            var ty;
            tx = Math.round((mouse.x - 25) / 11);
            ty = Math.round((mouse.y - 25) / 11);
            var dx = Math.abs(tx - bx);
            var dy = Math.abs(ty - by);
            dx = (dx < 2) ? 0 : ((dx > 7) ? dx : ((dx > 4) ? 6 : dx));
            dy = (dy < 2) ? 0 : ((dy > 7) ? dy : ((dy > 4) ? 6 : dy));
            if (dx == 0 && dy == 6 || dx == 6 && dy == 0 || dx == 6 && dy == 6) {
                ex = bx + ((tx - bx < 0) ? -dx : dx);
                ey = by + ((ty - by < 0) ? -dy : dy);
                if (ex == bx || ey == by) {
                    tx = (by - ey) / 2.5;
                    ty = (bx - ex) / 2.5;
                } else {
                    tx = 0;
                    ty = 0;
                }
                rx = cx;
                ry = cy;
                cx = (bx + ex) / 2;
                cy = (by + ey) / 2;
                if (length(cx - tx, cy + ty, rx, ry) - length(cx + tx, cy - ty, rx, ry) > 0.1) {
                    cx += tx;
                    cy -= ty;
                    add = -1;
                } else {
                    if (length(cx + tx, cy - ty, rx, ry) - length(cx - tx, cy + ty, rx, ry) > 0.1) {
                        cx -= tx;
                        cy += ty;
                        add = 1;
                    }
                }
                codeSegment(add);
                showSegment(curseg, bx, by, cx, cy, ex, ey);
                if (hd) {
                    seg[curseg].setAttribute("visibility", "hidden");
                } else {
                    seg[curseg].setAttribute("stroke-dasharray", "");
                }
                bx = ex;
                by = ey;
                cx = ex;
                cy = ey;
                curseg++;
                if (curseg < 48 - curlen) {
                    highlightMoves();
                    if (ls) {
                        pround.setAttribute("cx", bx * 11 + 25);
                        pround.setAttribute("cy", by * 11 + 25);
                        pround.setAttribute("visibility", "visible");
                        var curpos = curlen + curseg;
                        pround.setAttribute("stroke", ((curpos >= 18) ? "lime" : "red"));
                        plabel.textContent = curpos.toString();
                        var rect = plabel.getBoundingClientRect();
                        plabel.setAttribute("x", bx * 11 + 26 - rect.width / 2);
                        plabel.setAttribute("y", by * 11 + 33);
                        plabel.setAttribute("visibility", "visible");
                    }
                } else {
                    draw = false;
                    pcursor.setAttribute("visibility", "hidden");
                    pround.setAttribute("visibility", "hidden");
                    plabel.setAttribute("visibility", "hidden");
                    hideMoves(0);
                }
            } else {
                if (dx < 5 && dy < 5 && dx > 1 && dy > 1) {
                    if (tx != ex || ty != ey) {
                        ex = tx;
                        ey = ty;
                        cx = ex;
                        cy = ey;
                        showSegment(curseg, bx, by, cx, cy, ex, ey);
                    }
                } else {
                    ex = tx;
                    ey = ty;
                    if (dx < 3 && dy < 3) {
                        cx = bx;
                        cy = by;
                    }
                    showSegment(curseg, bx, by, cx, cy, (mouse.x - 25) / 11, (mouse.y - 25) / 11);
                }
            }
        }
    }
};

function Down() {
    for (var i = 0; i < 48; i++) {
        seg[i].setAttribute("visibility", "hidden");
        seg[i].setAttribute("stroke", "black");
    }
    svg.style.border = "";
    password.style.border = "";
    pcursor.setAttribute("cx", mouse.x);
    pcursor.setAttribute("cy", mouse.y);
    curlen = (tm) ? ((password.style.color == "black") ? password.value.length : 0) : drawing.length;
    if (curlen < 48) {
        bx = Math.round((mouse.x - 25) / 66) * 6;
        by = Math.round((mouse.y - 25) / 66) * 6;
        cx = bx;
        cy = by;
        ex = bx;
        ey = by;
        highlightMoves(bx, by);
        curseg = 0;
        draw = true;
        pcursor.setAttribute("visibility", "visible");
    }
};

function Up() {
    var alphabet = "ABCDEFGHIJKLMNOP";
    pcursor.setAttribute("visibility", "hidden");
    pround.setAttribute("visibility", "hidden");
    plabel.setAttribute("visibility", "hidden");
    var ch = "";
    if (curseg < 48) seg[curseg].setAttribute("visibility", "hidden");
    for (var i = 0; i < curseg; i++) {
        ch = ch + alphabet[codes[i]];
        seg[i].setAttribute("visibility", "hidden");
    }
    if (tm && curseg > 0) {
        if (password.style.color == "black") {
            password.value = password.value + ch;
        } else {
            password.value = ch;
            password.style.color = "black";
            if (revealer.checked) {
                password.setAttribute("type", "text");
            } else {
                password.setAttribute("type", "password");
            }
        }
        pdch = true;
    } else {
        drawing = drawing + ch;
    }
    curseg = 0;
    draw = false;
    hideMoves(1);
    inpInput();
};

function showSegment(ind, begx, begy, midx, midy, endx, endy) {
    var begxst = (begx * 11 + 25).toString(),
    begyst = (begy * 11 + 25).toString(),
    midxst = (midx * 11 + 25).toString(),
    midyst = (midy * 11 + 25).toString(),
    endxst = (endx * 11 + 25).toString(),
    endyst = (endy * 11 + 25).toString();
    seg[ind].setAttribute("d", "M " + begxst + " " + begyst + " Q " + midxst + " " + midyst + " " + endxst + " " + endyst);
    seg[ind].setAttribute("stroke-dasharray", "1, 6");
    seg[ind].setAttribute("visibility", "visible");
};

function highlightMoves(par1, par2) {
    var j;
    for (var i = 0; i < 6; i++) {
        for (j = 0; j < 6; j++) {
            if ((Math.abs(j - bx / 6) > 0 || Math.abs(i - by / 6) > 0) && Math.abs(j - bx / 6) < 2 && Math.abs(i - by / 6) < 2) {
                pots[i][j].setAttribute("visibility", "visible");
            } else {
                pots[i][j].setAttribute("visibility", "hidden");
            }
        }
    }
};

function hideMoves(par) {
    var j;
    for (var i = 0; i < 6; i++) {
        for (j = 0; j < 6; j++) {
            pots[i][j].setAttribute("visibility", (par) ? "visible" : "hidden");
        }
    }
};

function codeSegment(add) {
    var cd,
    eex = ex / 6,
    eey = ey / 6,
    bbx = bx / 6,
    bby = by / 6;
    if (add == 0) {
        cd = (1 + eey - bby) * 3 + 1 + eex - bbx;
    } else {
        if (eex - bbx == -1) cd = 0;
        if (eey - bby == -1) cd = 2;
        if (eex - bbx == 1) cd = 4;
        if (eey - bby == 1) cd = 6;
        cd = cd + (1 + add) / 2 + 9;
    }
    if (cd > 4) {
        cd--;
    }
    codes[curseg] = cd;
};

function length(par1x, par1y, par2x, par2y) {
    return Math.sqrt(Math.pow(par1x - par2x, 2) + Math.pow(par1y - par2y, 2));
};

function decode_bytes(bs, n, s) {
    var c,
    afull = "!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[~]^_abcdefghijklmnopqrstuvwxyz{|}",
    alite = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    alets = "abcdefghijklmnopqrstuvwxyz",
    acaps = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    anums = "0123456789",
    asgns = "!#$%&()*+,-./:;<=>?@[~]^_{|}",
    decoded = [];
    for (var i = 0; i < (n * 4); i += 4) {
        c = Math.floor(((bs[i + 3] * 16777216) + (bs[i + 2] * 65536) + (bs[i + 1] * 256) + bs[i]) / ((s) ? 69273666.06451613 : 47721858.84444444));
        c = (s) ? alite[c] : afull[c];
        decoded.push(c);
    }    
    if (!/.*[a-z].*/.test(decoded)) {
        decoded.push(alets[Math.floor(((bs[67] * 16777216) + (bs[66] * 65536) + (bs[65] * 256) + bs[64]) / 165191049.8461538)]);
    }
    if (!/.*[A-Z].*/.test(decoded)) {
        decoded.push(acaps[Math.floor(((bs[71] * 16777216) + (bs[70] * 65536) + (bs[69] * 256) + bs[68]) / 165191049.8461538)]);
    }
    if (!/.*[0-9].*/.test(decoded)) {
        decoded.push(anums[Math.floor(((bs[75] * 16777216) + (bs[74] * 65536) + (bs[73] * 256) + bs[72]) / 429496729.6)]);
    }
    if (!/.*[^a-zA-Z0-9].*/.test(decoded) && !s) {
        decoded.push(asgns[Math.floor(((bs[79] * 16777216) + (bs[78] * 65536) + (bs[77] * 256) + bs[76]) / 153391689.1428571)]);
    }
    return decoded.join("");
};

function resetClick() {
    if (resetenabled) {
        if (tm) {
            password.setAttribute("type", "text");
            password.value = "strong only!";
            password.style.color = "";
            pdch = true;
        } else {
            drawing = "";
        }
        inpInput();
    }
};

function enterClick() {
    var product,
    saltstr = "";
    if (enterenabled) {
        if (salt.style.color == "black") {
            saltstr = salt.value;
            if (stch) ch_st(saltstr);
        }
        if (tm) {
            if (pdch) ch_pd(password.value);
            product = scrypt.crypto_scrypt(scrypt.encode_utf8(password.value), scrypt.encode_utf8(site.value + saltstr), 16384, 8, 1, 80);
        } else {
            product = scrypt.crypto_scrypt(scrypt.encode_utf8(drawing), scrypt.encode_utf8(site.value + saltstr), 16384, 8, 1, 80);
        }
        var txtval = decode_bytes(product, (/.*\$$/.test(site.value)) ? 10 : 16, /^#.*/.test(site.value));
        inject_p(txtval);
    } else {
        var dshd = "2px dashed #D00000";
        if (site.style.color != "black" || !resite.test(site.value)) {
            site.style.border = dshd;
        }
        if (tm) {
            if (password.style.color == "black") {
                if (!repass.test(password.value) && !resign.test(password.value)) {
                    password.style.border = dshd;
                    svg.style.border = dshd;
                }
            } else {
                password.style.border = dshd;
                svg.style.border = dshd;
            }
        } else {
            if (!resign.test(drawing)) {
                svg.style.border = dshd;
            }
        }
    }
};

function cockatooClick() {
    if (tm && gm) {
        gm = false;
        ch_mode();
    } else {
        if (tm && !gm) {
            gm = true;
            tm = false;
            ch_mode();
            showHeart();
        } else {
            tm = true;
            ch_mode();
            if (/.+/.test(drawing)) {
                password.style.color = "black";
                if (revealer.checked) {
                    password.setAttribute("type", "text");
                } else {
                    password.setAttribute("type", "password");
                }
                password.value = drawing;
                pdch = true;
                drawing = "";
            }
        }
    }
    site.style.border = "";
    password.style.border = "";
    svg.style.border = "";
    inpInput();
};

function revealerClick() {
    if (password.style.color == "black") {
        if (revealer.checked) {
            password.setAttribute("type", "text");
        } else {
            password.setAttribute("type", "password");
        }
    }
};

function inpInput() {
    var res = false;
    var ent = false;
    if (tm && password.style.color == "black") {
        if (password.value.length > 0) {
            res = true;
        }
        if (resign.test(password.value)) {
            ent = true;
        } else {
            if (repass.test(password.value)) {
                ent = true;
            }
        }
    }
    if (gm && !tm) {
        if (drawing.length > 0) {
            res = true;
        }
        if (resign.test(drawing)) {
            ent = true;
        }
    }
    if (site.style.color != "black") {
        ent = false;
    } else {
        if (!resite.test(site.value)) {
            ent = false;
        }
    }
    if (resetenabled) {
        if (!res) {
            if (ic) {
                reset.style.color = "";
                reset.style.textShadow = "";
            } else {
                reset.style.color = "";
                reset.style.textShadow = "";
            }
            resetenabled = false;
        }
    } else {
        if (res) {
            if (ic) {
                reset.style.color = "black";
                reset.style.textShadow = "-1px -1px 1px #C0C0C0, -1px 1px 1px #D0D0D0, 1px -1px 1px #D0D0D0, 1px 1px 1px #FFFFFF";
            } else {
                reset.style.color = "white";
                reset.style.textShadow = "-1px -1px 2px #D0D0D0, 1px 1px 2px #B0B0B0";
            }
            resetenabled = true;
        }
    }
    if (enterenabled) {
        if (!ent) {
            if (ic) {
                enter.style.color = "";
                enter.style.textShadow = "";
            } else {
                enter.style.color = "";
                enter.style.textShadow = "";
            }
            enterenabled = false;
        }
    } else {
        if (ent) {
            if (ic) {
                enter.style.color = "black";
                enter.style.textShadow = "-1px -1px 1px #C0C0C0, -1px 1px 1px #D0D0D0, 1px -1px 1px #D0D0D0, 1px 1px 1px #FFFFFF";
            } else {
                enter.style.color = "white";
                enter.style.textShadow = "-1px -1px 2px #D0D0D0, 1px 1px 2px #B0B0B0";
            }
            enterenabled = true;
        }
    }
};

function siteFocus() {
    site.style.border = "";
    if (site.style.color != "black") {
        site.style.color = "black";
        site.value = "";
    }
};

function passInput() {
    pdch = true;
    inpInput();
};

function passFocus() {
    password.style.border = "";
    svg.style.border = "";
    if (password.style.color != "black") {
        password.style.color = "black";
        password.value = "";
        pdch = true;
    }
    if (revealer.checked) {
        password.setAttribute("type", "text");
    } else {
        password.setAttribute("type", "password");
    }
};

function saltInput() {
    stch = true;
};

function saltFocus() {
    if (salt.style.color != "black") {
        salt.style.color = "black";
        salt.value = "";
        stch = true;
    }
};
