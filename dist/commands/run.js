"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const exec_1 = require("../utils/exec");
const android_1 = require("../utils/android");
const cache_1 = require("../utils/cache");
const chalk_1 = __importDefault(require("chalk"));
exports.default = new commander_1.Command('run')
    .description('Build, install and run the app on a connected device')
    .action(async () => {
    // 1. Find Android root
    const androidRoot = (0, android_1.findAndroidRoot)();
    if (!androidRoot) {
        console.log(chalk_1.default.red('✖ Android project root not found (gradlew missing)'));
        process.exit(1);
    }
    // 2. Build
    console.log(chalk_1.default.cyan('📦 Building app...'));
    await (0, exec_1.exec)('./gradlew assembleDebug', { cwd: androidRoot });
    // 3. Find APK
    console.log(chalk_1.default.cyan('🔍 Finding APK...'));
    const apkPath = (0, android_1.findApk)(androidRoot);
    if (!apkPath) {
        console.log(chalk_1.default.red('✖ APK not found'));
        process.exit(1);
    }
    console.log(chalk_1.default.gray(`   Found: ${apkPath}`));
    // 4. Install
    console.log(chalk_1.default.cyan('📲 Installing app...'));
    await (0, exec_1.exec)(`adb install -r "${apkPath}"`, { cwd: androidRoot });
    // 5. Resolve applicationId (with cache)
    console.log(chalk_1.default.cyan('🔍 Resolving applicationId...'));
    let packageName = null;
    let activity = null;
    const cachedData = (0, cache_1.getCachedProjectData)(androidRoot, 'debug');
    if (cachedData) {
        // Caché válida
        console.log(chalk_1.default.gray(`⚡ Using cached applicationId (${cachedData.applicationId})`));
        packageName = cachedData.applicationId;
        activity = cachedData.launcherActivity;
    }
    else {
        // Caché inválida o no existe
        const cache = (0, cache_1.readCache)();
        const cacheKey = `${androidRoot}:debug`;
        if (cache[cacheKey]) {
            console.log(chalk_1.default.yellow('♻️  Cache invalidated (project files changed)'));
        }
        console.log(chalk_1.default.cyan('🔍 Extracting applicationId using aapt...'));
        packageName = await (0, android_1.getPackageFromApk)(apkPath);
        if (!packageName) {
            console.log(chalk_1.default.red('✖ Could not extract package name from APK'));
            console.log(chalk_1.default.yellow('   Make sure Android SDK build-tools (aapt) are available in your PATH'));
            process.exit(1);
        }
        console.log(chalk_1.default.gray(`   Package: ${packageName}`));
        console.log(chalk_1.default.cyan('🔍 Extracting launcher activity from APK...'));
        activity = await (0, android_1.getLauncherActivityFromApk)(apkPath);
        if (!activity) {
            console.log(chalk_1.default.red('✖ Could not extract launcher activity from APK'));
            process.exit(1);
        }
        console.log(chalk_1.default.gray(`   Activity: ${activity}`));
        // Guardar en caché
        (0, cache_1.setCachedProjectData)(androidRoot, { applicationId: packageName, launcherActivity: activity }, 'debug');
    }
    // 7. Launch
    console.log(chalk_1.default.cyan('🚀 Launching app...'));
    await (0, android_1.launchApp)(packageName, activity);
    console.log(chalk_1.default.green('✓ App launched successfully!'));
});
