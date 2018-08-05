'use strict';

/* eslint-disable no-unused-vars */
const should = require('should');
const requireUncached = require('import-fresh');
const packageName = require('./utils/publish-please-version-under-test');
const copy = require('./utils/copy-file-sync');
const mkdirp = require('mkdirp');
const pathJoin = require('path').join;
const del = require('del');
const audit = require('../lib/utils/npm-audit');
const nodeInfos = require('../lib/utils/get-node-infos').getNodeInfosSync();
const writeFile = require('fs').writeFileSync;

if (nodeInfos.npmAuditHasJsonReporter) {
    describe('npm audit analyzer when npm is >= 6.1.0', () => {
        let originalWorkingDirectory;

        before(() => (originalWorkingDirectory = process.cwd()));
        beforeEach(() => {
            mkdirp('test/tmp/audit');
            const projectDir = pathJoin(__dirname, 'tmp', 'audit');
            del.sync(pathJoin(projectDir, 'package.json'));
            del.sync(pathJoin(projectDir, 'package-lock.json'));
        });
        afterEach(() => process.chdir(originalWorkingDirectory));
        after(() => console.log(`cwd is restored to: ${process.cwd()}`));
        it('Cannot audit a project without a lockfile', () => {
            // Given
            const pkg = {
                name: 'testing-repo',
                scripts: {},
            };
            const projectDir = pathJoin(__dirname, 'tmp', 'audit');
            writeFile(
                pathJoin(projectDir, 'package.json'),
                JSON.stringify(pkg, null, 2)
            );
            // When
            return (
                Promise.resolve()
                    .then(() => audit(projectDir))

                    // Then
                    .then((result) => {
                        result.error.summary.should.containEql(
                            'Cannot audit a project without a lockfile'
                        );
                    })
            );
        });
    });
}

if (!nodeInfos.npmAuditHasJsonReporter) {
    describe('npm audit analyzer when npm is < 6.1.0', () => {
        let originalWorkingDirectory;

        before(() => (originalWorkingDirectory = process.cwd()));
        beforeEach(() => {
            mkdirp('test/tmp/audit');
            const projectDir = pathJoin(__dirname, 'tmp', 'audit');
            del.sync(pathJoin(projectDir, 'package.json'));
            del.sync(pathJoin(projectDir, 'package-lock.json'));
        });
        afterEach(() => process.chdir(originalWorkingDirectory));
        after(() => console.log(`cwd is restored to: ${process.cwd()}`));
        it('Cannot audit a project on npm < 6.1.0', () => {
            // Given
            const pkg = {
                name: 'testing-repo',
                scripts: {},
            };
            const projectDir = pathJoin(__dirname, 'tmp', 'audit');
            writeFile(
                pathJoin(projectDir, 'package.json'),
                JSON.stringify(pkg, null, 2)
            );

            // When
            return (
                Promise.resolve()
                    .then(() => audit(projectDir))

                    // Then
                    .then((result) => {
                        // prettier-ignore
                        nodeInfos.isAtLeastNpm6
                            ? result.error.summary.should.containEql('Cannot audit a project without a lockfile')
                            : result.error.summary.should.containEql('Command failed: npm audit');
                    })
            );
        });
    });
}
