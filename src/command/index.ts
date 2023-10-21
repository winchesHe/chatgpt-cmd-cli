/* eslint-disable no-console */
import { printColorLogs, printErrorLogs, scanDirFile } from '@winches/utils'
import { consola } from 'consola'
import { getIsExecuteSelect, getQuestion, getReloadSelect } from '../inquirer'
import { fetchQuestion } from '../utils'
import { normalizeDesc, normalizeOutput } from '../utils/log'
import { convertCmd } from '../utils/transform'
import { exec, execFn } from '../utils/execa'
import { readEnv, writeEnv } from '../utils/env'
import type { AnswerArr } from '../types'
import { platform } from 'os'
import { excludeList } from '../const'
import { readFileSync } from 'fs'
import { oraPromise } from 'ora'

const defaultBanner = '欢迎使用 cli-gpt 智能终端应用'
const gradientBanner = printColorLogs(defaultBanner)
const accessToken = readEnv().accessToken
const isWin = platform() === 'win32'
let powerShellHistory = readEnv().powerShellHistory

export async function start(question?: ({} & string) | 'fix') {
  console.log()
  // 如果标准输出处于交互式终端模式，并且终端支持至少 24 位
  console.log(
    (process.stdout.isTTY && process.stdout.getColorDepth() > 8)
      ? gradientBanner
      : defaultBanner,
  )
  console.log()

  if (!question)
    question = await getQuestion()
  if (!accessToken) {
    const token = await getQuestion('请输入你的accessToken（https://chat.openai.com/api/auth/session）：')
    writeEnv({ accessToken: token })
  }

  // 执行修复功能
  if (question === 'fix') {
    // 验证是否有PowerShell记录
    if (isWin && !powerShellHistory) {
      powerShellHistory = scanDirFile('C:/Users', ['.txt'], excludeList).filter(item => item.includes('ConsoleHost_history'))?.[0]

      if (!powerShellHistory) {
        printErrorLogs('无法找到终端历史记录文件')
        process.exit(1)
      }

      // 写入env
      writeEnv({
        powerShellHistory
      })
    }

    const historyList = readFileSync(powerShellHistory, 'utf8').split('\n').filter(i => i)
    const lastHistory = historyList[historyList.length - 2]
    const transformHistory = lastHistory.replace(/\r/g, '')
    let errorInfo = ''

    await runCmd(transformHistory)

    await fetchAnswer(question, [transformHistory, errorInfo])
    process.exit(1)

    async function runCmd(cmd: string) {
      return new Promise(resolve => {
        execFn(cmd, (err: any, stdout: string, stderr: string) => {
          errorInfo = `Error: ${err?.message}\n${stdout || ''}`
          resolve(true)
        })
      })
    }
  }

  // 请求GPT
  await generateAnswer(question)

  async function generateAnswer(question: string, errorInfo?: string[]) {
    const result = await fetchQuestion(question!, errorInfo)

    if (result.length) {
      // 输出结果
      consola.box(normalizeOutput(result))
      consola.success(normalizeDesc(result))
      console.log()

      // 询问是否执行命令
      const choice = await getReloadSelect()

      if (choice === 'execute') {
        await runCmd(result)
      }
      else if (choice === 'reRun') {
        const question = await getQuestion()
        await generateAnswer(question)
      }
      else if (choice === 'choiceExecute') {
        for (const index in result) {
          const resultData = result[index]
          const choice = await getIsExecuteSelect(`${+index + 1}. ${resultData.cmd}`)
          if (choice === 'no') {
            resultData.execute = false
          }
          else if (choice === 'change') {
            const changeCmd = await getQuestion(`${+index + 1}. 调整该指令（${resultData.cmd}）`, resultData.cmd)
            resultData.cmd = changeCmd
          }
        }

        await runCmd(result)
      }
    }
    else {
      consola.error('未能生成终端指令，请重新调整提问词输入')
    }
  }

  async function runCmd(result: AnswerArr) {
    const cmdList = convertCmd(result)

    try {
      for (const cmd of cmdList) {
        await oraPromise(exec(cmd), {
          text: `正在运行 ${cmd}...`,
          successText: `✨ ${cmd} 运行成功！`
        })
      }
    }
    catch (error) {
      consola.error('命令执行错误：', error)
    }
  }
}
