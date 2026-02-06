import { Command } from 'commander'
import { exec } from '../utils/exec'
import { findAndroidRoot } from '../utils/android'
import chalk from 'chalk'

export default new Command('run')
  .description('Build, install and run the app on a connected device')
  .action(async () => {
    const androidRoot = findAndroidRoot()

    if (!androidRoot) {
      console.log(
        chalk.red('✖ Android project root not found (gradlew missing)')
      )
      process.exit(1)
    }

    await exec('./gradlew assembleDebug', { cwd: androidRoot })
    await exec(
      'adb install -r app/build/outputs/apk/debug/app-debug.apk',
      { cwd: androidRoot }
    )
    await exec('adb shell monkey -p com.tu.app 1')
  })
