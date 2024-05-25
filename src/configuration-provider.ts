import { workspace, window, ConfigurationTarget } from 'vscode'
import * as path from 'path'

const FILES_EXCLUDE_CONFIG_KEY = 'files.exclude'

type Map = { [key: string]: boolean | undefined }

export class ConfigurationProvider {

    static async addToExclude(path: string): Promise<void> {
        path = normalizePath(path)

        let excludes = workspace.getConfiguration().get<Map>(FILES_EXCLUDE_CONFIG_KEY, {})

        if (!excludes[path]) {
            removeDefaults(excludes)
            excludes[path] = true
            await workspace.getConfiguration().update(FILES_EXCLUDE_CONFIG_KEY, excludes, ConfigurationTarget.Workspace)
        }
    }

    static async removeFromExclude(path: string): Promise<void> {
        path = normalizePath(path)

        let excludes = workspace.getConfiguration().get<Map>(FILES_EXCLUDE_CONFIG_KEY, {})

        if (excludes[path]) {
            removeDefaults(excludes)
            excludes[path] = undefined
            await workspace.getConfiguration().update(FILES_EXCLUDE_CONFIG_KEY, excludes, ConfigurationTarget.Workspace)
        }
    }

    static hasExclude(path: string): boolean {
        path = normalizePath(path)

        let currentValue = workspace.getConfiguration().get<Map>(FILES_EXCLUDE_CONFIG_KEY, {})
        
        return currentValue[path] || false
    }

    static getExcludes(keys: string[]): Map {
        let currentValue = workspace.getConfiguration().get<Map>(FILES_EXCLUDE_CONFIG_KEY, {})
        
        return Object.fromEntries(keys.map(key => [key, currentValue[normalizePath(key)] || false]))
    }
}


function normalizePath(value: string): string {
    return value
    // return path.normalize(value) + '\\**';
}

function removeDefaults(map: Map): Map {
    const defaultsToRemove = [
        "**/.git",
        "**/.svn",
        "**/.hg",
        "**/CVS",
        "**/.DS_Store",
        "**/Thumbs.db",
    ]

    for (const prop of defaultsToRemove) {
        map[prop] = undefined
    }

    return map
}