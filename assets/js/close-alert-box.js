/**
 * Zeste de Savoir - Close alert boxes
 */

"use strict";
import $ from "jquery";
import _debug from "debug";

let debug = _debug("zds:close-alert-box");

export default {
    name: "close-alert-box",
    register(app) {
        app.on("ready", () => {
            debug("init");
            $(".main").on("click", ".close-alert-box:not(.open-modal)", e => {
                debug("closing alert box");
                $(this).parents(".alert-box:first").slideUp(150, function() {
                    $(this).remove();
                });
                e.preventDefault();
            });
        });
    }
};

