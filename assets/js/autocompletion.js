/**
 * Zeste de Savoir - Autocompletion
 */

"use strict";
import $ from "jquery";
import _debug from "debug";

let debug = _debug("zds:autocomplete");

class Autocomplete {
    constructor({ input, options }) {
        debug("init autocomplete for input", input, "with options", options);
        let resultDom = this.buildDom(input);
        this.$wrapper = resultDom.$wrapper;
        this.$input = resultDom.$input;
        this.$dropdown = resultDom.$dropdown;

        this.$input.on("keyup", e => this.handleInput(e));
        this.$input.on("keydown", e => this.handleKeydown(e));
        this.$input.on("blur", () => this.hideDropdown());

        this.options = options;

        if(this.options.type === "multiple") {
            this.$form = this.$wrapper.parents("form:first");
            this.$form.on("submit", () => this.handleSubmit());
        }

        this.selected = -1;
        this.lastInput = "";
        this.cache = new Map();
    }

    handleKeydown(e) {
        switch(e.which) {
            case 38: // Arrow up
                e.preventDefault();
                e.stopPropagation();

                if(this.selected === -1) {
                    this.select(this.$dropdown.find("ul li").last().attr("data-autocomplete-id"));
                } else {
                    let $tmp = this.$dropdown.find("ul li[data-autocomplete-id=" + this.selected + "]").prev("li");
                    this.select($tmp.length === 1 ? $tmp.attr("data-autocomplete-id") : -1);
                }
                break;
             case 40: // Arrow down
                e.preventDefault();
                e.stopPropagation();

                if (this.selected === -1) {
                    this.select(this.$dropdown.find("ul li").first().attr("data-autocomplete-id"));
                } else {
                    let $tmp = this.$dropdown.find("ul li[data-autocomplete-id=" + this.selected + "]").next("li");
                    this.select($tmp.length === 1 ? $tmp.attr("data-autocomplete-id") : -1);
                }
                break;
            case 13: // Return
                e.preventDefault();
                e.stopPropagation();

                this.enter();
                break;
        }
    }

    handleInput(e) {
        if (e && (e.which === 38 || e.which === 40 || e.which === 13)) {
            e.preventDefault();
            e.stopPropagation();
        }

        let input = this.$input.val();

        if(this.lastInput === input) {
            return;
        }

        this.lastInput = input;

        let search = this.parseInput(input);

        if (!search || search === this.lastAutocomplete) {
            this.hideDropdown();
        } else {
            debug("wat");
            let req = this.fetchUsers(search);
            debug(req);
            req.done(data => {
                    this.updateCache(data.results);
                    this.updateDropdown(this.sortList(data.results, search));
                })
                .fail(() => {
                    debug("can't fetch data");
                });
            this.updateDropdown(this.sortList(this.searchCache(search), search));
            this.showDropdown();
        }
    }

    handleSubmit() {
        let content = this.$input.val();
        if(content.slice(-2) === ", ") {
            this.$input.val(content.slice(0, -2));
        }
    }

    showDropdown() {
        if (this.$input.is("input")) {
            this.$dropdown.css("width", this.$input.outerWidth());
        }
        this.$dropdown.show();
    }

    hideDropdown() {
        this.$dropdown.hide();
    }

    select(id) {
        this.selected = id;
        this.$dropdown.find("ul li.active").removeClass("active");
        this.$dropdown.find("ul li[data-autocomplete-id=" + this.selected + "]").addClass("active");
    }

    enter(selected) {
        debug("enter");
        selected = selected || this.selected;
        let input = this.$input.val();
        let lastChar = input.substr(-1);
        if ((lastChar === "," || selected === -1) && this.options.type === "multiple") {
            return false;
        }

        let completion = this.getFromCache(selected);
        if (!completion) {
            return false;
        }

        if (this.options.type === "multiple") {
            let lastComma = input.lastIndexOf(",");
            if (lastComma !== -1) {
                input = input.substr(0, lastComma) + ", " + completion.username + ", ";
                this.$input.val(input);
            } else {
                this.$input.val(completion.username + ", ");
            }
        } else {
            this.$input.val(completion.username);
        }

        this.lastAutocomplete = completion.username;
        this.selected = -1; // Deselect properly
        this.$input.trigger("input");
    }

    extractWords(input) {
        let words = input.split(",").map($.trim).filter(item => item !== "" && item !== undefined);
        return words;
    }

    updateCache(data) {
        debug("updating cache");
        for (let i = 0; i < data.length; i++) {
            this.cache.set(data[i].username, data[i]);
        }
    }

    parseInput(input) {
        if (this.options.type === "multiple") {
            if (input.substr(-1) === "," || input.substr(-2) === ", ") {
                return false;
            }

            let words = this.extractWords(input);
            if (words.length === 0) {
                return false;
            }

            return words.pop(); // last word in list
        } else {
            return input;
        }
    }

    searchCache(input) {
        let regexp = new RegExp(input, "ig");
        return Array.from(this.cache.values()).filter(item => item.username.match(regexp));
    }

    getFromCache(id) {
        return Array.from(this.cache.values()).find(item => parseInt(item.pk) === parseInt(id));
    }

    filterData(data, exclude) {
        return data.filter(item => exclude.indexOf(item.username) === -1);
    }

    updateDropdown(list) {
        debug("updating dropdown with list", list);
        let onClick = e => {
            e.preventDefault();
            e.stopPropagation();
            this.enter($(e.currentTarget).attr("data-autocomplete-id"));
            this.$input.focus();
            this.handleInput();
        };

        list = this.filterData(list, this.extractWords(this.$input.val()));

        if (list.length > this.options.limit) {
            list = list.slice(0, this.options.limit);
        }

        let $list = $("<ul>"),
            $el, selected = false;
        for (let i in list) {
            if ($("#my-account .username").text() === list[i].username) {
                continue;
            }
            $el = $("<li>").text(list[i].username);
            $el.attr("data-autocomplete-id", list[i].pk);
            if (list[i].pk === this.selected) {
                $el.addClass("active");
                selected = true;
            }

            $el.mousedown(onClick);
            $list.append($el);
        }
        this.$dropdown.children().remove();
        this.$dropdown.append($list);

        if (!selected) {
            this.select($list.find("li").first().attr("data-autocomplete-id"));
        }
    }

    sortList(list, search) {
        let bestMatches = [],
            otherMatches = [];

        for (let i = 0; i < list.length; i++) {
            if (list[i].username.indexOf(search) === 0) {
                bestMatches.push(list[i]);
            } else {
                otherMatches.push(list[i]);
            }
        }

        let sortFn = (a, b) => {
            let valueA = a.username.toLowerCase(),
                valueB = b.username.toLowerCase();
            if (valueA < valueB) {
                return -1;
            }
            else if (valueA > valueB) {
                return 1;
            }
            return 0;
        };

        bestMatches.sort(sortFn);
        otherMatches.sort(sortFn);

        return bestMatches.concat(otherMatches);
    }

    fetchUsers(input) {
        debug("query '%s'", input);
        return $.getJSON(this.options.url.replace("%s", input));
    }



    buildDom(input) {
        let $input = $(input),
            $wrapper = $("<div/>", {
                "class": "autocomplete-wrapper"
            }),
            $dropdown = $("<div/>", {
                "class": "autocomplete-dropdown"
            });

        $input.addClass("autocomplete-input")
            .attr("autocomplete", "off")
            .wrap($wrapper)
            .parent()
            .append($dropdown);

        return { $wrapper, $dropdown, $input };
    }
}

$.fn.autocomplete = function(options) {
    let defaults = {
        type: "single", // single|multiple|mentions
        url: "/api/membres/?search=%s",
        limit: 4
    };

    if (!options) {
        options = $(this).data("autocomplete");
    }

    return new Autocomplete({ input: this, options: $.extend(defaults, options) });
};


export default {
    name: "autocomplete",
    register(app) {
        app.on("ready", () => {
            $("[data-autocomplete]").each((index, element) => element.autocomplete());
            $("#content").on("DOMNodeInserted", "input", function(e) {
                let $input = $(e.target);
                if ($input.is("[data-autocomplete]")) {
                    $input.autocomplete();
                }
            });
        });
    }
};

