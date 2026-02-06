"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const exec_1 = require("../utils/exec");
exports.default = new commander_1.Command('build')
    .description('Build android app')
    .option('--ext <type>', 'apk or aab', 'apk')
    .action(async (opts) => {
    const task = opts.ext === 'aab'
        ? 'bundleRelease'
        : 'assembleDebug';
    await (0, exec_1.exec)(`./gradlew ${task}`);
});
