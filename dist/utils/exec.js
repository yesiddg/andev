"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exec;
const execa_1 = require("execa");
const chalk_1 = __importDefault(require("chalk"));
async function exec(command, options = {}) {
    console.log(chalk_1.default.cyan(`➜ ${command}`));
    await (0, execa_1.execa)(command, {
        stdio: 'inherit',
        shell: true,
        cwd: options.cwd
    });
}
