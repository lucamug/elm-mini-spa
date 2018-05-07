;(function () {
    "use strict";
    window.Example = window.Example || {};
    window.Example.htmlStarter = window.Example.htmlStarter || {};
    var conf = {
        mode: window.Example.htmlStarter.mode || "production",
    };

    window.Example.starter = conf;
    if (conf.mode === "debug") {
        console.info('%cMade with %c❤%c and %cElm%c', 'background: #fffbb2; color: brown; font-family: monospace', 'background: #fffbb2; color: red', 'background: #fffbb2; color: brown', 'background: #fffbb2; color: blue', 'background: #fffbb2; color: brown');
        console.log("%cRunning in " + conf.mode + " mode", "color: green");
    } else {
        // Silencing the logging
        window.console.log = function () {};
    }
    // Adding FastClick (https://github.com/ftlabs/fastclick) for eliminating
    // the 300ms delay between a physical tap and the firing of a click event
    // on mobile browsers
    if ('addEventListener' in document && 'FastClick' in window) {
        document.addEventListener('DOMContentLoaded', function () {
            FastClick.attach(document.body);
        }, false);
    } else {
        console.log("Could not run FastClick");
    }
    startApp();

    // FUNCTIONS

    function startApp() {
        var elmMain;
        if (window.Elm) {
            if (!conf.elmApp) {
                for (var method in Elm) {
                    if (Elm[method].fullscreen) {
                        conf.elmName = method;
                        conf.elmApp = Elm[method];
                    } else {
                        // Checking one level deeper because Elm nested
                        // script based on folder structure
                        for (var subMethod in Elm[method]) {
                            if (Elm[method][subMethod].fullscreen) {
                                conf.elmName = subMethod;
                                conf.elmApp = Elm[method][subMethod];
                            }

                        }
                    }

                }
            }
            var app = conf.elmApp.fullscreen({
                width: window.innerWidth,
                height: window.innerHeight,
                mode: conf.mode
            });

        } else {
            console.log("Elm not starting because not defined");
        }
    }

})();
