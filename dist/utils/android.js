"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAndroidRoot = findAndroidRoot;
exports.findApk = findApk;
exports.getPackageFromApk = getPackageFromApk;
exports.getLauncherActivityFromApk = getLauncherActivityFromApk;
exports.launchApp = launchApp;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const exec_1 = require("./exec");
function findAndroidRoot(startDir = process.cwd()) {
    let current = startDir;
    while (true) {
        const gradlewPath = path_1.default.join(current, 'gradlew');
        const settingsGradle = path_1.default.join(current, 'settings.gradle');
        const settingsGradleKts = path_1.default.join(current, 'settings.gradle.kts');
        if (fs_1.default.existsSync(gradlewPath) &&
            (fs_1.default.existsSync(settingsGradle) || fs_1.default.existsSync(settingsGradleKts))) {
            return current;
        }
        const parent = path_1.default.dirname(current);
        if (parent === current)
            return null;
        current = parent;
    }
}
function findApk(androidRoot) {
    const apkDir = path_1.default.join(androidRoot, 'app/build/outputs/apk/debug');
    if (!fs_1.default.existsSync(apkDir)) {
        return null;
    }
    const files = fs_1.default.readdirSync(apkDir);
    const apkFile = files.find((file) => file.endsWith('.apk'));
    return apkFile ? path_1.default.join(apkDir, apkFile) : null;
}
async function getPackageFromApk(apkPath) {
    try {
        // Capturar todo el output (sin | grep para máxima portabilidad)
        const output = await (0, exec_1.exec)(`aapt dump badging "${apkPath}"`, {
            silent: true,
        });
        // Output format: package: name='com.example.app' versionCode='1' ...
        const match = output.match(/package:\s+name='([^']+)'/);
        return match ? match[1] : null;
    }
    catch (error) {
        return null;
    }
}
async function getLauncherActivityFromApk(apkPath) {
    try {
        const output = await (0, exec_1.exec)(`aapt dump badging "${apkPath}"`, {
            silent: true,
        });
        // Output format: launchable-activity: name='com.example.MainActivity' ...
        const match = output.match(/launchable-activity:\s+name='([^']+)'/);
        return match ? match[1] : null;
    }
    catch (error) {
        return null;
    }
}
async function launchApp(packageName, activity) {
    await (0, exec_1.exec)(`adb shell am start -n ${packageName}/${activity}`);
}
