"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const exec_1 = require("../utils/exec");
exports.default = new commander_1.Command('emulator')
    .description('Manage android emulators')
    .option('--list', 'List available emulators')
    .option('--launch <name>', 'Launch emulator')
    .action(async (opts) => {
    if (opts.list) {
        await (0, exec_1.exec)('emulator -list-avds');
    }
    if (opts.launch) {
        await (0, exec_1.exec)(`emulator -avd ${opts.launch}`);
    }
});
