/**
 * Zeste de Savoir - Managment of accessibility links
 */

"use strict";
import $ from "jquery";
import _debug from "debug";

let debug = _debug("zds:accessibility-links");

export default function() {
    debug("init");

    $("#accessibility a").on("focus", function(){
        debug("focus link");
        $(".dropdown:visible").parent().find(".active").removeClass("active");
        $("#accessibility").addClass("focused");
    });
    $("#accessibility a").on("blur", function(){
        debug("blur link");
        $("#accessibility").removeClass("focused");
    });
}
