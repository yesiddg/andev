import { Command } from 'commander'
import { exec } from '../utils/exec'

export default new Command('emulator')
  .description('Manage android emulators')
  .option('--list', 'List available emulators')
  .option('--launch <name>', 'Launch emulator')
  .action(async (opts) => {
    if (opts.list) {
      await exec('emulator -list-avds')
    }

    if (opts.launch) {
      await exec(`emulator -avd ${opts.launch}`)
    }
  })
