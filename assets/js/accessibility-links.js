/**
 * Zeste de Savoir - Accessibility links
 */

"use strict";
let debug = require("debug")("zds:accessibility-link");
import tabbable from "tabbable";

module.exports = function(app) {
    app.on("dom ready", () => {
        let accessibility = document.getElementById("accessibility");
        debug("init");

        for(let link of accessibility.querySelectorAll("a")) {
          link.addEventListener("focus", () => accessibility.classList.add("focused"));
          link.addEventListener("blur", () => accessibility.classList.remove("focused"));
          link.addEventListener("click", () => {
              setTimeout(() => {
                let l = tabbable(document.querySelector(link.getAttribute("href")));
                l.length > 0 && l[0].focus();
              })
          });
        }
    });
};
