import fs from 'fs'
import path from 'path'

export function findAndroidRoot(startDir = process.cwd()): string | null {
  let current = startDir

  while (true) {
    const gradlewPath = path.join(current, 'gradlew')
    const settingsGradle = path.join(current, 'settings.gradle')
    const settingsGradleKts = path.join(current, 'settings.gradle.kts')

    if (
      fs.existsSync(gradlewPath) &&
      (fs.existsSync(settingsGradle) || fs.existsSync(settingsGradleKts))
    ) {
      return current
    }

    const parent = path.dirname(current)
    if (parent === current) return null

    current = parent
  }
}
