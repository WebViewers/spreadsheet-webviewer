define(["jquery", "require"], function ($, require) {
    'use strict';
    var PREFIX = "./jquery.sheet-2.0.0/";

    var DEPENDENCIES = {
        "jquery.sheet": {
            exports: "jQuery.fn.sheet",
            name: "jquerySheet"
        },
        "parser": {
            exports: 'parser',
            name: "parser"
        },
        "plugins/jquery.scrollTo-min": {
            exports: "jQuery.scrollTo",
            name: "scrollTo"
        },
        "jquery-ui/ui/jquery-ui.min": {
            exports: "jQuery.ui",
            name: "jqueryUi"
        },
        "plugins/raphael-min": {
            exports: "Raphael",
            name: "raphaelJs"
        },
        "plugins/g.raphael-min": {
            deps: ["plugins/raphael-min"],
            exports: "Raphael.fn.g",
            name: "gRaphaelJs"
        },
        "plugins/jquery.colorPicker.min": {
            exports: "jQuery.fn.colorPicker",
            name: "colorPicker"
        },
        "plugins/jquery.elastic.min": {
            exports: "jQuery.fn.elastic",
            name: "elastic"
        },
        "jquery.sheet.advancedfn": {
            exports: "jQuery.sheet.advancedfn",
            name: "advancedMath"
        },
        "jquery.sheet.financefn": {
            exports: "jQuery.sheet.financefn",
            name: "finance"
        }
    };

    var CSS_DEPENDENCIES = {
        "jquery.sheet.css": {
            name: "jquerySheetCss"
        },
        "jquery-ui/theme/jquery-ui.css": {
            name: "jqueryUiCss"
        },
        "plugins/jquery.colorPicker.css": {
            name: "colorPickerCss"
        }
    };

    var addStyle = function (style, head) {
        var s = require.toUrl(style);
        var id = s.replace(/[^A-Za-z0-9_-]/g, '_');
        if ($("#jQuery-sheet-" + id).length) {
            return;
        }
        head.append('<link id=' + 'jQuery-sheet-' + id +
            ' rel="stylesheet" type="text/css" href="' + style + '" />');
    };

    var getDependencies = function (deps, config) {
        var out = [];
        $.each(deps, function (depUrl, dep) {
            if (config[dep.name]) {
                out.push(depUrl);
            }
        });
        return out;
    };

    // Add prefix to JS URLs
    $.each(DEPENDENCIES, function (depPath, dep) {
        delete DEPENDENCIES[depPath];
        DEPENDENCIES[PREFIX + depPath] = dep;
    });

    requirejs.config({shim: DEPENDENCIES});

    // Absolutize CSS URLs.
    $.each(CSS_DEPENDENCIES, function (depPath, dep) {
        delete CSS_DEPENDENCIES[depPath];
        CSS_DEPENDENCIES[require.toUrl(PREFIX + depPath)] = dep;
    });

    var out = {
        inject: function (domLocation, config, andThen) {
            var conf = $.extend({
                id: "jquerysheet-div",
                style: '',
                jquerySheet: true,
                jquerySheetCss: true,
                parser: true,
                jqueryUiCss: true,
                scrollTo: false,
                jQueryUI: false,
                raphaelJs: false,
                gRaphaelJs: false,
                colorPicker: false,
                colorPickerCss: false,
                elastic: false,
                advancedMath: false,
                finance: false
            }, config.jqs_amd);

            var jqsConf = $.extend({
                urlMenu: require.toUrl(PREFIX + "menu.html"),
                urlSave: require.toUrl(PREFIX + "save.html"),
                urlGet: require.toUrl(PREFIX + "sheets/enduser.documentation.html")
            }, config);

            var needJs = getDependencies(DEPENDENCIES, conf);
            //needJs.unshift("jquery");

            // jqs needs this to be global
            window.jQuery = $;

            require([PREFIX + "jquery.sheet"], function () {
                require(needJs, function (sheet) {
                    $(domLocation).first().append(
                        "<div id='" + conf.id + "' style='" + conf.style + "'></div>");
                    $.each(getDependencies(CSS_DEPENDENCIES, conf), function (index, value) {
                        addStyle(value, $('head'));
                    });
                    var div = $("#" + conf.id);
                    div.sheet(jqsConf);
                    andThen(div.getSheet(), $.sheet);
                });
            });
        }
    };
    return out;
});
