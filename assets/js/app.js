/**
 *  Zeste de Savoir - Entry point
 */

"use strict";
import { EventEmitter } from "events";
import _debug from "debug";
let debug = _debug("zds:app");

class App extends EventEmitter {
    constructor() {
        super();
        debug("booting up");

        document.addEventListener("DOMContentLoaded", () => this.emit("dom ready"));
    }

    enableDebug(...params) {
        _debug.enable(...params);
    }

    disableDebug(...params) {
        _debug.disable(...params);
    }
}

window.app = new App();
