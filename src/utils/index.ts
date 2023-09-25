import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export * from './fetch'

export const root = resolve(fileURLToPath(import.meta.url), '../../..')
export const pkgDir = resolve(fileURLToPath(import.meta.url), '../..')
export const resolver = (url: string) => resolve(root, url)
