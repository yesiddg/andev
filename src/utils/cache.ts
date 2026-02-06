import fs from 'fs'
import path from 'path'
import envPaths from 'env-paths'

const paths = envPaths('andev')

export interface ProjectCache {
  applicationId: string
  launcherActivity: string
  lastUpdated: number // Unix timestamp in seconds
  source: string // "aapt"
  fingerprint: string // timestamp de build.gradle
}

export interface CacheData {
  [projectKey: string]: ProjectCache // projectKey = "path:variant"
}

export function getCacheDir(): string {
  return paths.cache
}

export function getCachePath(): string {
  return path.join(getCacheDir(), 'cache.json')
}

export function readCache(): CacheData {
  const cachePath = getCachePath()

  if (!fs.existsSync(cachePath)) {
    return {}
  }

  try {
    const content = fs.readFileSync(cachePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    return {}
  }
}

export function writeCache(data: CacheData): void {
  const cacheDir = getCacheDir()
  const cachePath = getCachePath()

  // Crear directorio si no existe
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function getCachedProjectData(
  projectPath: string,
  variant: string = 'debug'
): ProjectCache | null {
  const cache = readCache()
  const projectKey = `${projectPath}:${variant}`
  const projectCache = cache[projectKey]

  if (!projectCache) {
    return null
  }

  // Encontrar build.gradle
  const buildGradlePath = path.join(projectPath, 'app', 'build.gradle')
  const buildGradleKtsPath = path.join(projectPath, 'app', 'build.gradle.kts')

  let gradleFile = buildGradlePath
  if (!fs.existsSync(buildGradlePath) && fs.existsSync(buildGradleKtsPath)) {
    gradleFile = buildGradleKtsPath
  }

  if (!fs.existsSync(gradleFile)) {
    return null
  }

  // Validar fingerprint (timestamp de build.gradle)
  const stats = fs.statSync(gradleFile)
  const currentFingerprint = Math.floor(stats.mtimeMs).toString()

  if (currentFingerprint !== projectCache.fingerprint) {
    // build.gradle modificado, caché invalidada
    return null
  }

  return projectCache
}

export function setCachedProjectData(
  projectPath: string,
  data: { applicationId: string; launcherActivity: string },
  variant: string = 'debug'
): void {
  const cache = readCache()

  // Encontrar build.gradle
  const buildGradlePath = path.join(projectPath, 'app', 'build.gradle')
  const buildGradleKtsPath = path.join(projectPath, 'app', 'build.gradle.kts')

  let gradleFile = buildGradlePath
  if (!fs.existsSync(buildGradlePath) && fs.existsSync(buildGradleKtsPath)) {
    gradleFile = buildGradleKtsPath
  }

  const stats = fs.existsSync(gradleFile) ? fs.statSync(gradleFile) : null

  const projectKey = `${projectPath}:${variant}`

  cache[projectKey] = {
    ...data,
    lastUpdated: Math.floor(Date.now() / 1000), // Unix timestamp
    source: 'aapt',
    fingerprint: stats
      ? Math.floor(stats.mtimeMs).toString()
      : Date.now().toString(),
  }

  writeCache(cache)
}

export function clearCache(projectPath?: string): void {
  if (!projectPath) {
    // Limpiar toda la caché
    const cachePath = getCachePath()
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath)
    }
  } else {
    // Limpiar solo entradas de un proyecto específico
    const cache = readCache()
    const keysToDelete = Object.keys(cache).filter((key) =>
      key.startsWith(projectPath + ':')
    )

    keysToDelete.forEach((key) => delete cache[key])
    writeCache(cache)
  }
}
