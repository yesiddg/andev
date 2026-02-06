"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exec;
const execa_1 = require("execa");
async function exec(command, options = {}) {
    const subprocess = (0, execa_1.execa)(command, {
        shell: true,
        stdio: options.silent ? 'pipe' : 'inherit',
        cwd: options.cwd,
    });
    const result = await subprocess;
    return result.stdout?.toString() ?? '';
}
