import { Command } from 'commander'
import { exec } from '../utils/exec'
import {
  findAndroidRoot,
  findApk,
  getPackageFromApk,
  getLauncherActivityFromApk,
  launchApp,
} from '../utils/android'
import chalk from 'chalk'

export default new Command('run')
  .description('Build, install and run the app on a connected device')
  .action(async () => {
    // 1. Find Android root
    const androidRoot = findAndroidRoot()

    if (!androidRoot) {
      console.log(
        chalk.red('✖ Android project root not found (gradlew missing)')
      )
      process.exit(1)
    }

    // 2. Build
    console.log(chalk.cyan('📦 Building app...'))
    await exec('./gradlew assembleDebug', { cwd: androidRoot })

    // 3. Find APK
    console.log(chalk.cyan('🔍 Finding APK...'))
    const apkPath = findApk(androidRoot)

    if (!apkPath) {
      console.log(chalk.red('✖ APK not found'))
      process.exit(1)
    }

    console.log(chalk.gray(`   Found: ${apkPath}`))

    // 4. Install
    console.log(chalk.cyan('📲 Installing app...'))
    await exec(`adb install -r "${apkPath}"`, { cwd: androidRoot })

    // 5. Extract package from APK
    console.log(chalk.cyan('🔍 Extracting package name from APK...'))
    const packageName = await getPackageFromApk(apkPath)

    if (!packageName) {
      console.log(chalk.red('✖ Could not extract package name from APK'))
      console.log(
        chalk.yellow(
          '   Make sure Android SDK build-tools (aapt) are available in your PATH'
        )
      )
      process.exit(1)
    }

    console.log(chalk.gray(`   Package: ${packageName}`))

    // 6. Extract launcher activity from APK
    console.log(chalk.cyan('🔍 Extracting launcher activity from APK...'))
    const activity = await getLauncherActivityFromApk(apkPath)

    if (!activity) {
      console.log(chalk.red('✖ Could not extract launcher activity from APK'))
      process.exit(1)
    }

    console.log(chalk.gray(`   Activity: ${activity}`))

    // 7. Launch
    console.log(chalk.cyan('🚀 Launching app...'))
    await launchApp(packageName, activity)
    console.log(chalk.green('✓ App launched successfully!'))
  })
