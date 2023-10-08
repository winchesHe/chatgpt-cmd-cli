/* eslint-disable no-console */
import { printColorLogs } from '@winches/utils'
import { consola } from 'consola'
import { getQuestion, getReloadSelect } from '../inquirer'
import { fetchQuestion } from '../utils'
import { normalizeDesc, normalizeOutput } from '../utils/log'
import { convertCmd } from '../utils/transform'
import { exec } from '../utils/execa'

const defaultBanner = '欢迎使用 cli-gpt 智能终端应用'
const gradientBanner = printColorLogs(defaultBanner)

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

  // 请求GPT
  const result = await fetchQuestion(question)

  if (result.length) {
    // 输出结果
    consola.box(normalizeOutput(result))
    consola.success(normalizeDesc(result))
    console.log()

    // 询问是否执行命令
    const choice = await getReloadSelect()

    if (choice === 'execute') {
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
    else if (choice === 'reRun') {
      consola.info('reRun')
    }
  }
  else {
    consola.error('未能生成终端指令，请重新调整提问词输入')
  }
}
