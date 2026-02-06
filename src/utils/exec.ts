import { execa } from 'execa'

export async function exec(
  command: string,
  options: { silent?: boolean; cwd?: string } = {}
) {
  const subprocess = execa(command, {
    shell: true,
    stdio: options.silent ? 'pipe' : 'inherit',
    cwd: options.cwd,
  })

  const result = await subprocess
  return result.stdout?.toString() ?? ''
}
