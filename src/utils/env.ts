import { resolve } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

type EnvKey = 'parentMessageId' | 'conversationId' | 'accessToken' | 'powerShellHistory'

const __dirname = resolve(fileURLToPath(import.meta.url), '../..')
const outputDir = resolve(__dirname, '..')
const outputFile = resolve(outputDir, '.env')

export function readEnv() {
  const result: Record<EnvKey, string> = {} as Record<EnvKey, string>

  if (existsSync(outputFile)) {
    const data = readFileSync(outputFile, 'utf8')
    const dataList = data.split('\n').filter(i => i)

    for (const line of dataList) {
      const key = line.match(/(\w+)=/)?.[1] as EnvKey
      const val = line.match(/(?<=\w+)=(.*)/)?.[1] as string

      result[key] = val
    }
  }

  return result
}

export function writeEnv(target: Partial<Record<EnvKey, string>>) {
  let result = ''
  const envData = readEnv()

  for (const [key, val] of Object.entries({ ...envData, ...target })) {
    result += `${key}=${val}\n`
  }

  writeFileSync(outputFile, result, 'utf8')
}
