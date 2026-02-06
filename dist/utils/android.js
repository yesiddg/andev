"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAndroidRoot = findAndroidRoot;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
