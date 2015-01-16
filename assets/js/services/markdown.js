/**
 * Transform Markdown into HTML
 */

/**
 * Markdown object
 * @constructor
 */
var Markdown = function() {};

/**
 * Transform the Markdown into HTML
 * @param {string} markdown
 * @return HTML code
 */
Markdown.prototype.toHTML = function (markdown) {
    return $.ajax({
        url: "/api/utils/markdown/",
        type: "POST",
        data: {
            "markdown": markdown.toString()
        },
        success: function (html) {
            return html;
        },
        error: function (undefined, textStatus, errorThrown) {
            var error = "An error occured when trying to convert Markdown into HTML by sending an AJAX request to the server.";

            if(textStatus !== null) {
                error += "\n\n" + textStatus;
            }
            if(errorThrown !== null) {
                error += "\n\n" + errorThrown;
            }

            throw new Error(error);
        }
    });
};

$(document).on("DOMContentLoaded", function() {
  var test = new Markdown().toHTML("coucou");
  alert(test);
});
