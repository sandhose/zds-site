/**
 *  Zeste de Savoir - Entry point
 */

"use strict";
import { EventEmitter } from "events";
import _debug from "debug";
let debug = _debug("zds:app");
require("babel-polyfill");

let modules = [
  require("./modules/accessibility-links.js"),
  require("./modules/accordeon.js")
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

        this.register(...modules)
            .then(() => debug("loaded modules"))
            .catch(reason => debug("failed to load modules", reason));
    }

    register(...modules) {
        return Promise.all(modules);
    }

    enableDebug(...params) {
        _debug.enable(...params);
    }

    disableDebug(...params) {
        _debug.disable(...params);
    }
}

window.app = new App();
