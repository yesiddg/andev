import { execa } from 'execa'

export async function exec(
  command: string,
  options: { silent?: boolean } = {}
) {
  const subprocess = execa(command, {
    shell: true,
    stdio: options.silent ? 'pipe' : 'inherit',
  })

  const result = await subprocess
  return result.stdout?.toString() ?? ''
}
