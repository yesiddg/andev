import fs from 'fs'
import path from 'path'
import { exec } from './exec'

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

export function findApk(androidRoot: string): string | null {
  const apkDir = path.join(androidRoot, 'app/build/outputs/apk/debug')

  if (!fs.existsSync(apkDir)) {
    return null
  }

  const files = fs.readdirSync(apkDir)
  const apkFile = files.find((file) => file.endsWith('.apk'))

  return apkFile ? path.join(apkDir, apkFile) : null
}

export async function getPackageFromApk(
  apkPath: string
): Promise<string | null> {
  try {
    // Capturar todo el output (sin | grep para máxima portabilidad)
    const output = await exec(`aapt dump badging "${apkPath}"`, {
      silent: true,
    })

    // Output format: package: name='com.example.app' versionCode='1' ...
    const match = output.match(/package:\s+name='([^']+)'/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

export async function getLauncherActivityFromApk(
  apkPath: string
): Promise<string | null> {
  try {
    const output = await exec(`aapt dump badging "${apkPath}"`, {
      silent: true,
    })

    // Output format: launchable-activity: name='com.example.MainActivity' ...
    const match = output.match(/launchable-activity:\s+name='([^']+)'/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

export async function launchApp(
  packageName: string,
  activity: string
): Promise<void> {
  await exec(`adb shell am start -n ${packageName}/${activity}`)
}
