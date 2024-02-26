import { exec, execSync } from 'child_process'
import * as vscode from 'vscode'
import * as path from 'path'
import { TreeItem, TreeItemCheckboxState } from 'vscode'
import { ConfigurationProvider } from './configuration-provider'

export interface NxProjInfo {
    name: string;
    root: string;
    projectType: string;
}

export class NxProvider {
    static async getNxProjects(loadInParallel = true): Promise<NxProjInfo[]> {
        const nxCmd = await findNx()

        if (!nxCmd) {
            return []
        }

        try {
            console.time('getNxProjects')

            const projectNames = await execAsyncParse<string[]>(`${nxCmd} show projects --json`)

            const projectDetails = loadInParallel
                ? await NxProvider.loadProjectsParallel(projectNames, nxCmd)
                : await NxProvider.loadProjectsSeq(projectNames, nxCmd)

            projectDetails.sort((a, b) => a.root.localeCompare(b.root))

            console.timeEnd('getNxProjects')

            return projectDetails
        } catch (error: any) {
            console.error('Error when receiving projects:', error.message)
            throw error
        }
    }

    private static async loadProjectsSeq(projectNames: string[], nxCmd: string) {
        const projectDetails: NxProjInfo[] = []

        for (const projectName of projectNames) {
            const details = await execAsyncParse<NxProjInfo>(`${nxCmd} show project ${projectName} --json`)
            projectDetails.push(details)
        }

        return projectDetails
    }

    private static loadProjectsParallel(projectNames: string[], nxCmd: string): Promise<NxProjInfo[]> {
        const promises = projectNames.map(projectName => execAsyncParse<NxProjInfo>(`${nxCmd} show project ${projectName} --json`))
        
        return Promise.all(promises)
    }
}


function execAsync(command: string, cwd?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: cwd || vscode.workspace.rootPath }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing command:', error.message)
                reject(error)
            } else {
                resolve(stdout.trim())
            }
        })
    })
}

async function execAsyncParse<T>(command: string, cwd?: string): Promise<T> {
    const json = await execAsync(command, cwd)
    return JSON.parse(json)
}

async function findNx(): Promise<string | null> {
    
    // if nx is installed globally then the 'nx' command will execute much faster than 'mpx nx'
    try {
        await execAsync('nx --version')
        
        console.log(`'nx' command will be used`)
        
        return 'nx'
    } catch (error) { }

    try {
        await execAsync('npx nx --version')
        
        console.log(`'npx nx' command will be used`)
        
        return 'npx nx'
    } catch (error) { }

    vscode.window.showErrorMessage('Nx is not installed. Have you run npm/yarn install?')

    return null
}