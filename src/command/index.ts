/* eslint-disable no-console */
import { printColorLogs } from '@winches/utils'
import { consola } from 'consola'
import { getIsExecuteSelect, getQuestion, getReloadSelect } from '../inquirer'
import { fetchQuestion } from '../utils'
import { normalizeDesc, normalizeOutput } from '../utils/log'
import { convertCmd } from '../utils/transform'
import { exec } from '../utils/execa'
import { readEnv, writeEnv } from '../utils/env'
import type { AnswerArr } from '../types'

const defaultBanner = '欢迎使用 cli-gpt 智能终端应用'
const gradientBanner = printColorLogs(defaultBanner)
const accessToken = readEnv().accessToken

export async function start(question?: string) {
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

  // 请求GPT
  await generateAnswer(question)

  async function generateAnswer(question: string) {
    const result = await fetchQuestion(question!)

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
        for (const resultData of result) {
          const choice = await getIsExecuteSelect(resultData.cmd)
          if (choice === 'no') {
            resultData.execute = false
          }
          else if (choice === 'change') {
            const changeCmd = await getQuestion(`调整该指令（${resultData.cmd}）`, resultData.cmd)
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
        await exec(cmd)
      }
    }
    catch (error) {
      consola.error('命令执行错误：', error)
    }
  }
}
