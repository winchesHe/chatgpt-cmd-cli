import { exec as _exec } from 'node:child_process'
import { $ as _$ } from 'execa'
import consola from 'consola'
import c from 'chalk'

export const $$ = _$({ stdio: 'inherit' })
export const $ = _$

export const execFn = _exec

export async function exec(cmd: string) {
  return new Promise((resolve) => {
    _exec(cmd, (error: any, stdout: string, stderr: string) => {
      if (error) {
        consola.error(`${c.red(cmd)} 执行命令时出错：\n\n${error}`)
        throw (error)
      }

      const successOutput = `${stderr ? `${stderr}\n` : ''}${stdout || ''}`

      consola.success(`${c.green(cmd)} 执行成功\n\n${successOutput}`)

      resolve(true)
    })
  })
}
