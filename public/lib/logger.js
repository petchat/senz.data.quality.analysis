var debug = false;

var log = function(log_tag) {
    if (debug) {
        var log = require("tracer").colorConsole(
            {
                format: "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})",
                dateformat: "isoDateTime"
            });
    } else {
        var token = "4913bb95-ca5d-49d0-987f-afc558c02094";
        var logentries = require('node-logentries');
        var log = logentries.logger({
            token: token
        });
    }

    return {
        "info": function (id, info) {
            log.info(log_tag + " <" + id + "> " + info);
        },

        "debug": function (id, debug) {
            log.debug(log_tag + " <" + id + "> " + debug);
        },

        "warn": function (id, warn) {
            if (debug) {
                log.warn(log_tag + " <" + id + "> " + warn);
            }
            else {
                log.warning(log_tag + " <" + id + "> " + warn);
            }
        },

        "error": function (id, err) {
            if (debug) {
                log.error(log_tag + " <" + id + "> " + err);
            }
            else {
                log.err(log_tag + " <" + id + "> " + err);
            }
        }
    };
};


exports.log = log;
