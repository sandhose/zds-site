/**
 * Zeste de Savoir - JS entry point
 */

"use strict";
import $ from "jquery";
import { EventEmitter } from "events";
import _debug from "debug";

import accessibilityLinks from "./accessibility-links";
import accordeon from "./accordeon";

_debug.enable("zds:*");

let debug = _debug("zds:main");

class ZesteDeSavoir extends EventEmitter {
    constructor() {
        super();
        debug("booting app");

        $(document).ready(() => {
            debug("dom ready");
            this.emit("ready");

            // Init everything that depends on DOM
            accessibilityLinks();
            accordeon();
        });
    }
}


window.zds = new ZesteDeSavoir(); // Start everything !
