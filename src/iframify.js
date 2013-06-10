/*globals document:true */
define(['module'], function(module) {
    'use strict';
    return {
        load: function (name, require, load, config) {
            var iframeWindow = document.getElementById(name.split('@')[1]).contentWindow;
            var ifrDoc = iframeWindow.document;
            var ifrHead = ifrDoc.getElementsByTagName('head')[0];

            var requireUrl = module.config().requireUrl;
            if (!requireUrl) {
                var scripts = document.getElementsByTagName('script');
                for (var i = 0; i < scripts.length; i++) {
                    var src = scripts[i].getAttribute("src");
                    if (src && src.indexOf("require.js") === src.length - 10) {
                        requireUrl = src;
                        break;
                    }
                }
            }
            if (!requireUrl) {
                load.error("Could not find require.js url which is needed inside of the iframe.");
            }

            var requireScript = ifrDoc.createElement('script');
            requireScript.setAttribute("type", "text/javascript");
            requireScript.setAttribute("src", requireUrl);
            ifrHead.appendChild(requireScript);

            requireScript.onload = function () {
                iframeWindow.requirejs.config(config);
                iframeWindow.require([name.split('@')[0]], function (value) {
                    load(value);
                });
            };
        }
    };
});
