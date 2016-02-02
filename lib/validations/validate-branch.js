'use strict';

const exec = require('cp-sugar').exec;

module.exports = {
    option:     'validateBranch',
    statusText: 'Validating branch',

    run (expected) {
        return exec("git branch | sed -n '/\\* /s///p'")
            .then(branch => {
                if (branch !== expected)
                    throw 'Expected branch to be `' + expected + '`, but it was `' + branch + '`.';
            });
    }
};