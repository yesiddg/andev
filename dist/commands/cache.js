"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const cache_1 = require("../utils/cache");
const chalk_1 = __importDefault(require("chalk"));
const cacheCommand = new commander_1.Command('cache').description('Manage andev cache');
cacheCommand
    .command('clear')
    .description('Clear all cached data')
    .option('--project <path>', 'Clear cache for specific project only')
    .action((opts) => {
    if (opts.project) {
        const absolutePath = path_1.default.resolve(opts.project);
        (0, cache_1.clearCache)(absolutePath);
        console.log(chalk_1.default.green(`✓ Cache cleared for project: ${opts.project}`));
    }
    else {
        (0, cache_1.clearCache)();
        console.log(chalk_1.default.green('✓ Cache cleared successfully'));
    }
});
cacheCommand
    .command('path')
    .description('Show cache file path')
    .action(() => {
    console.log((0, cache_1.getCachePath)());
});
cacheCommand
    .command('list')
    .description('List cached projects')
    .action(() => {
    const cache = (0, cache_1.readCache)();
    const projects = Object.keys(cache);
    if (projects.length === 0) {
        console.log(chalk_1.default.yellow('No cached projects'));
        return;
    }
    console.log(chalk_1.default.cyan(`\nCached projects (${projects.length}):\n`));
    projects.forEach((projectKey) => {
        const data = cache[projectKey];
        const [projectPath, variant] = projectKey.split(':');
        console.log(chalk_1.default.white(`📁 ${projectPath} (${variant})`));
        console.log(chalk_1.default.gray(`   Package: ${data.applicationId}`));
        console.log(chalk_1.default.gray(`   Updated: ${new Date(data.lastUpdated * 1000).toLocaleString()}\n`));
    });
});
exports.default = cacheCommand;
