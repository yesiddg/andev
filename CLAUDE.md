# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**andev** is an ultra-lightweight Android development CLI that replaces the heavy workflow of Android Studio with a VS Code + CLI-first approach. Part of the **yeli-tools** suite.

### Main Goal
Build a fast, minimal CLI to develop Android apps without Android Studio, using:
- VS Code as the editor
- CLI-first workflow
- Node.js + TypeScript
- Physical Android device
- ADB + Gradle
- No framework assumptions (works with React Native, Flutter, native, etc.)
- No responsibilities delegated to the app itself

Design inspiration: React Native CLI philosophy (not implementation) + Unix tools (do one thing well). Optimized for machines with 16 GB RAM or less.

### Core Design Philosophy

> **"andev doesn't know anything about your app — it just asks the operating system."**

This makes the tool:
- Framework-agnostic
- Resilient to configuration changes
- Safe for legacy or messy projects
- Fast and portable

**Key principles:**
- ✅ Gradle is the source of truth
- ✅ ADB is the API
- ✅ andev is only an intelligent orchestrator
- ❌ No parsing build.gradle
- ❌ No reading AndroidManifest.xml
- ❌ No framework-specific logic
- ❌ No app cooperation required
- ❌ No `adb shell monkey`

## Build and Development Commands

### Building the CLI Tool
```bash
# Compile TypeScript to JavaScript
npx tsc

# The compiled output goes to dist/ directory
```

### Testing the CLI Locally
```bash
# Run directly with ts-node during development
npm run dev

# Or build and test the compiled version:
npx tsc
node bin/andev <command>

# Link globally for system-wide testing (recommended):
npm link
andev <command>
```

### Available CLI Commands

#### `andev run` (Fully Implemented)
The complete build → install → launch pipeline:

1. **Build**: `./gradlew assembleDebug`
2. **Install**: `adb install -r app/build/outputs/apk/debug/app-debug.apk`
3. **Detect package**: `adb shell pm list packages -3` (heuristic: last user-installed package)
4. **Resolve launcher activity**: `adb shell cmd package resolve-activity --brief <package>`
5. **Launch app**: `adb shell am start -n <package>/<activity>`

#### `andev build`
```bash
andev build             # Builds debug APK (default)
andev build --ext aab   # Builds release AAB
```

#### `andev emulator`
```bash
andev emulator --list          # List available emulators
andev emulator --launch <name> # Launch specific emulator
```

## Architecture

### Tech Stack
- **Language**: TypeScript (compiled to CommonJS)
- **Runtime**: Node.js
- **CLI framework**: Commander
- **Command execution**: execa
- **Output styling**: chalk

### Directory Structure
```
andev/
├─ bin/andev               # CLI entrypoint (#!/usr/bin/env node)
├─ src/
│  ├─ index.ts             # Command registry (Commander setup)
│  ├─ commands/
│  │  ├─ run.ts            # andev run (build → install → launch)
│  │  ├─ build.ts          # andev build
│  │  └─ emulator.ts       # andev emulator
│  └─ utils/
│     ├─ exec.ts           # execa wrapper
│     └─ android.ts        # Android helpers (ADB utilities)
├─ dist/                   # Compiled TypeScript output
├─ package.json
└─ tsconfig.json
```

### Entry Point Flow
`bin/andev` → `dist/index.js` (compiled from `src/index.ts`)

### Code Structure Details

- **src/index.ts**: Main entry point that sets up the Commander.js program and registers all commands
- **src/commands/**: Each file exports a Commander Command instance
  - `run.ts`: Complete pipeline (build → install → detect package → resolve activity → launch)
  - `build.ts`: Wraps Gradle build tasks (assembleDebug or bundleRelease)
  - `emulator.ts`: Wraps Android emulator CLI commands
- **src/utils/**:
  - `exec.ts`: Wrapper around execa for executing shell commands (supports silent mode, returns stdout)
  - `android.ts`: Android-specific utilities (find Android project root, ADB operations)

### Adding New Commands

1. Create a new file in `src/commands/<name>.ts`
2. Export a new Commander Command instance:
   ```typescript
   import { Command } from 'commander'
   import { exec } from '../utils/exec'
   import { findAndroidRoot } from '../utils/android'
   import chalk from 'chalk'

   export default new Command('command-name')
     .description('Command description')
     .action(async () => {
       const androidRoot = findAndroidRoot()

       if (!androidRoot) {
         console.log(chalk.red('✖ Android project root not found'))
         process.exit(1)
       }

       await exec('your-shell-command', { cwd: androidRoot })
     })
   ```
3. Import and register it in `src/index.ts`:
   ```typescript
   import newCommand from './commands/<name>'
   program.addCommand(newCommand)
   ```
4. Rebuild with `npx tsc` (or use `npm run dev` for development)

## Roadmap & Future Features

### Current Status
- ✅ `andev run` working (build → install → launch pipeline stable)
- ✅ Package detection solved correctly (no build.gradle parsing)
- ✅ CLI globally linkable via `npm link`
- ✅ Solid foundation with no technical debt

### Natural Next Steps
1. 🔍 Automatic APK detection (no hardcoded paths)
2. 📱 `andev devices` - List connected devices/emulators
3. 🧠 Per-project package caching (avoid re-detection)
4. ⚡ Incremental/parallel builds
5. 📦 Enhanced `andev build` with more options
6. ☁️ Future: Cloud emulator support

### Design Constraints to Maintain
- No framework assumptions
- No parsing build files
- No requiring app-side changes
- Fast and lightweight
- Works on 16GB RAM machines

## Important Implementation Details

### Command Execution (`src/utils/exec.ts`)
- Uses execa with `shell: true` for cross-platform compatibility
- Supports `silent` mode (returns stdout as string)
- Default behavior: pipes stdio to inherit (shows output in terminal)
- Returns stdout for programmatic access

### Android Project Detection (`src/utils/android.ts`)
- `findAndroidRoot()`: Searches for `gradlew` file to locate Android project root
- Allows running `andev` from any subdirectory of an Android project
- Commands execute with `cwd` set to the detected Android root

### Package Detection Strategy (andev run)
**Problem solved:** How to launch the app without parsing build.gradle or AndroidManifest.xml?

**Solution:**
1. Use `adb shell pm list packages -3` to list user-installed packages
2. Heuristic: assume last package in the list is the most recently installed (the one we just built)
3. Use `adb shell cmd package resolve-activity --brief <package>` to find launcher activity
4. Launch with `adb shell am start -n <package>/<activity>`

This approach:
- Works with any framework (React Native, Flutter, native, etc.)
- No parsing required
- No app-side metadata needed
- Resilient to configuration changes

### Current Limitations & TODOs
- **APK path**: Hardcoded to `app/build/outputs/apk/debug/app-debug.apk` - needs automatic detection
- **Package detection**: Uses "last installed" heuristic - could add per-project caching
- **No multi-module support**: Assumes single-app module structure

### TypeScript Configuration
Target: ES2020, Module: CommonJS, strict mode enabled. Compiles `src/` to `dist/`.
