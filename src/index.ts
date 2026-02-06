import { Command } from 'commander'
import run from './commands/run'
import build from './commands/build'
import emulator from './commands/emulator'

const program = new Command()

program
  .name('andev')
  .description('🔥 Ultra-light Android Dev CLI')
  .version('1.0.0')

program.addCommand(run)
program.addCommand(build)
program.addCommand(emulator)

program.parse()
