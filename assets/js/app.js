/**
 *  Zeste de Savoir - Entry point
 */

"use strict";
import { EventEmitter } from "events";
import _debug from "debug";
let debug = _debug("zds:app");
require("babel-polyfill");

let modules = [
  require("./accessibility-links.js"),
  require("./accordeon.js")
];

class App extends EventEmitter {
    constructor() {
        super();
        debug("booting up");
        this.modules = [];

        document.addEventListener("DOMContentLoaded", () => {
            this.emit("dom ready");
            debug("dom ready");
        });

        this.register(...modules);
    }

    register(...modules) {
        for(let mod of modules) {
          if(typeof mod !== "function") continue;
            mod(this);
        }

        debug("loaded modules");
    }

    enableDebug(...params) {
        _debug.enable(...params);
    }

    disableDebug(...params) {
        _debug.disable(...params);
    }
}

window.app = new App();
