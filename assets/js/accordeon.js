/**
 * Zeste de Savoir - Accordeon for Sidebar
 */

"use strict";
let debug = require("debug")("zds:sidebar");

function accordeon(elem) {
    for(let e of elem.querySelectorAll("h4 + ul, h4 + ol")) {
        if(!e.classList.contains("unfolded") && !e.querySelector(".current")) {
            // @TODO: Proper transition with CSS class
            e.style.display = "none";
        }
    }

    for(let e of elem.querySelectorAll("h4")) {
        e.addEventListener("click", event => {
            let sibling = e.nextElementSibling;
            if(sibling.nodeName.match(/(OL|UL)/)) {
                // @TODO: Proper transition with CSS class
                sibling.style.display = sibling.style.display == "none" ? "" : "none";
            }

            event.preventDefault();
            event.stopPropagation();
        });
    }
}

module.exports = function(app) {
    app.on("dom ready", () => {
        for(let elem of document.querySelectorAll(".main .sidebar.accordeon, .main .sidebar .accordeon")) {
            accordeon(elem);
            elem.addEventListener("DOMNodeInserted", e => accordeon(e.target));
        }
    });
}
