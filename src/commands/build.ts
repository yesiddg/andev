import { Command } from 'commander'
import { exec } from '../utils/exec'

export default new Command('build')
  .description('Build android app')
  .option('--ext <type>', 'apk or aab', 'apk')
  .action(async (opts) => {
    const task = opts.ext === 'aab'
      ? 'bundleRelease'
      : 'assembleDebug'

    await exec(`./gradlew ${task}`)
  })
