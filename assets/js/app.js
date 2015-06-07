/**
 * Zeste de Savoir - JS entry point
 */

"use strict";
import "babel/polyfill";
import $ from "jquery";
import { EventEmitter } from "events";
import _debug from "debug";

import accessibilityLinks from "./accessibility-links";
import accordeon from "./accordeon";
import autocomplete from "./autocompletion";
import closeAlertBox from "./close-alert-box";

let debug = _debug("zds:main");

class ZesteDeSavoir extends EventEmitter {
    constructor() {
        super();
        debug(`booting app in ${CONFIG.mode} mode`);

        this.modules = new Map();

        this.register(accessibilityLinks, accordeon, autocomplete, closeAlertBox);

        $(document).ready(() => {
            debug("dom ready");
            this.emit("ready");
        });
    }

    register(...params) {
        params.forEach((module) => {
            if(module === undefined) {
                debug("can't register module, undefined");
            }
            else if(this.modules.has(module.name)) {
                debug("module %s already registered !", module.name);
            }
            else if(typeof module.register === "function" && module.name) {
                debug("registering module %s", module.name);
                this.modules.set(module.name, module.register(this));
            }
            else {
                debug("malformed module. please export `register` function");
            }
        });
    }

    enableDebug(...params) {
        _debug.enable(...params);
    }

    disableDebug(...params) {
        _debug.disable(...params);
    }
}

window.zds = new ZesteDeSavoir(); // Start everything !
