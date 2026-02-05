import { Command } from 'commander'
import run from './commands/run'
import build from './commands/build'
import emulator from './commands/emulator'

const program = new Command()

program
  .name('androidx')
  .description('Android CLI ultra-light')
  .version('0.1.0')

program.addCommand(run)
program.addCommand(build)
program.addCommand(emulator)

program.parse()
