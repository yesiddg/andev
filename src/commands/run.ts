import { Command } from 'commander'
import { exec } from '../utils/exec'

export default new Command('run')
  .description('Build + install + run app')
  .action(async () => {
    await exec('./gradlew assembleDebug')
    await exec('adb install -r app/build/outputs/apk/debug/app-debug.apk')
    await exec('adb shell monkey -p com.tu.app 1')
  })
