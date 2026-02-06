import { Command } from 'commander'
import path from 'path'
import { clearCache, getCachePath, readCache } from '../utils/cache'
import chalk from 'chalk'

const cacheCommand = new Command('cache').description('Manage andev cache')

cacheCommand
  .command('clear')
  .description('Clear all cached data')
  .option('--project <path>', 'Clear cache for specific project only')
  .action((opts) => {
    if (opts.project) {
      const absolutePath = path.resolve(opts.project)
      clearCache(absolutePath)
      console.log(
        chalk.green(`✓ Cache cleared for project: ${opts.project}`)
      )
    } else {
      clearCache()
      console.log(chalk.green('✓ Cache cleared successfully'))
    }
  })

cacheCommand
  .command('path')
  .description('Show cache file path')
  .action(() => {
    console.log(getCachePath())
  })

cacheCommand
  .command('list')
  .description('List cached projects')
  .action(() => {
    const cache = readCache()
    const projects = Object.keys(cache)

    if (projects.length === 0) {
      console.log(chalk.yellow('No cached projects'))
      return
    }

    console.log(chalk.cyan(`\nCached projects (${projects.length}):\n`))
    projects.forEach((projectKey) => {
      const data = cache[projectKey]
      const [projectPath, variant] = projectKey.split(':')
      console.log(chalk.white(`📁 ${projectPath} (${variant})`))
      console.log(chalk.gray(`   Package: ${data.applicationId}`))
      console.log(
        chalk.gray(
          `   Updated: ${new Date(data.lastUpdated * 1000).toLocaleString()}\n`
        )
      )
    })
  })

export default cacheCommand
