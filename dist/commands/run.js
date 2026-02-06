"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const exec_1 = require("../utils/exec");
const android_1 = require("../utils/android");
const chalk_1 = __importDefault(require("chalk"));
exports.default = new commander_1.Command('run')
    .description('Build, install and run the app on a connected device')
    .action(async () => {
    const androidRoot = (0, android_1.findAndroidRoot)();
    if (!androidRoot) {
        console.log(chalk_1.default.red('✖ Android project root not found (gradlew missing)'));
        process.exit(1);
    }
    await (0, exec_1.exec)('./gradlew assembleDebug', { cwd: androidRoot });
    await (0, exec_1.exec)('adb install -r app/build/outputs/apk/debug/app-debug.apk', { cwd: androidRoot });
    await (0, exec_1.exec)('adb shell monkey -p com.tu.app 1');
});
