/**
 * Zeste de Savoir - Accordeon for sidebar
 */

"use strict";
import $ from "jquery";
import _debug from "debug";

let debug = _debug("zds:accordeon");

function accordeon($elem){
    $("h4 + ul, h4 + ol", $elem).each(function() {
        if($(".current", $(this)).length === 0) {
            $(this).hide();
        }
    });

    $("h4", $elem).click(function(e) {
        debug("toggle");

        $("+ ul, + ol", $(this)).slideToggle(100);

        e.preventDefault();
        e.stopPropagation();
    });
}

export default {
    name: "accordeon",
    register(app) {
        app.on("ready", () => {
            debug("init");

            $(".main .sidebar.accordeon, .main .sidebar .accordeon")
            .each(function() {
                accordeon($(this));
            })
            .on("DOMNodeInserted", function(e) {
                accordeon($(e.target));
            });
        });
    }
};
