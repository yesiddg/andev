"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheDir = getCacheDir;
exports.getCachePath = getCachePath;
exports.readCache = readCache;
exports.writeCache = writeCache;
exports.getCachedProjectData = getCachedProjectData;
exports.setCachedProjectData = setCachedProjectData;
exports.clearCache = clearCache;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_paths_1 = __importDefault(require("env-paths"));
const paths = (0, env_paths_1.default)('andev');
function getCacheDir() {
    return paths.cache;
}
function getCachePath() {
    return path_1.default.join(getCacheDir(), 'cache.json');
}
function readCache() {
    const cachePath = getCachePath();
    if (!fs_1.default.existsSync(cachePath)) {
        return {};
    }
    try {
        const content = fs_1.default.readFileSync(cachePath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        return {};
    }
}
function writeCache(data) {
    const cacheDir = getCacheDir();
    const cachePath = getCachePath();
    // Crear directorio si no existe
    if (!fs_1.default.existsSync(cacheDir)) {
        fs_1.default.mkdirSync(cacheDir, { recursive: true });
    }
    fs_1.default.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf-8');
}
function getCachedProjectData(projectPath, variant = 'debug') {
    const cache = readCache();
    const projectKey = `${projectPath}:${variant}`;
    const projectCache = cache[projectKey];
    if (!projectCache) {
        return null;
    }
    // Encontrar build.gradle
    const buildGradlePath = path_1.default.join(projectPath, 'app', 'build.gradle');
    const buildGradleKtsPath = path_1.default.join(projectPath, 'app', 'build.gradle.kts');
    let gradleFile = buildGradlePath;
    if (!fs_1.default.existsSync(buildGradlePath) && fs_1.default.existsSync(buildGradleKtsPath)) {
        gradleFile = buildGradleKtsPath;
    }
    if (!fs_1.default.existsSync(gradleFile)) {
        return null;
    }
    // Validar fingerprint (timestamp de build.gradle)
    const stats = fs_1.default.statSync(gradleFile);
    const currentFingerprint = Math.floor(stats.mtimeMs).toString();
    if (currentFingerprint !== projectCache.fingerprint) {
        // build.gradle modificado, caché invalidada
        return null;
    }
    return projectCache;
}
function setCachedProjectData(projectPath, data, variant = 'debug') {
    const cache = readCache();
    // Encontrar build.gradle
    const buildGradlePath = path_1.default.join(projectPath, 'app', 'build.gradle');
    const buildGradleKtsPath = path_1.default.join(projectPath, 'app', 'build.gradle.kts');
    let gradleFile = buildGradlePath;
    if (!fs_1.default.existsSync(buildGradlePath) && fs_1.default.existsSync(buildGradleKtsPath)) {
        gradleFile = buildGradleKtsPath;
    }
    const stats = fs_1.default.existsSync(gradleFile) ? fs_1.default.statSync(gradleFile) : null;
    const projectKey = `${projectPath}:${variant}`;
    cache[projectKey] = {
        ...data,
        lastUpdated: Math.floor(Date.now() / 1000), // Unix timestamp
        source: 'aapt',
        fingerprint: stats
            ? Math.floor(stats.mtimeMs).toString()
            : Date.now().toString(),
    };
    writeCache(cache);
}
function clearCache(projectPath) {
    if (!projectPath) {
        // Limpiar toda la caché
        const cachePath = getCachePath();
        if (fs_1.default.existsSync(cachePath)) {
            fs_1.default.unlinkSync(cachePath);
        }
    }
    else {
        // Limpiar solo entradas de un proyecto específico
        const cache = readCache();
        const keysToDelete = Object.keys(cache).filter((key) => key.startsWith(projectPath + ':'));
        keysToDelete.forEach((key) => delete cache[key]);
        writeCache(cache);
    }
}
