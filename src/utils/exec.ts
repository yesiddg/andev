import { execa } from 'execa'
import chalk from 'chalk'

export async function exec(command: string) {
  console.log(chalk.cyan(`➜ ${command}`))

  await execa(command, {
    stdio: 'inherit',
    shell: true
  })
}
