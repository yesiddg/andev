"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const run_1 = __importDefault(require("./commands/run"));
const build_1 = __importDefault(require("./commands/build"));
const emulator_1 = __importDefault(require("./commands/emulator"));
const program = new commander_1.Command();
program
    .name('andev')
    .description('🔥 Ultra-light Android Dev CLI')
    .version('1.0.0');
program.addCommand(run_1.default);
program.addCommand(build_1.default);
program.addCommand(emulator_1.default);
program.parse();
