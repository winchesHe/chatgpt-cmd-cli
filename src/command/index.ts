/* eslint-disable no-console */
import { printColorLogs } from '@winches/utils'
import { consola } from 'consola'
import { getQuestion } from '../inquirer'
import { fetchQuestion } from '../utils'
import { normalizeOutput } from '../utils/log'

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

  const result = await fetchQuestion(question)

  consola.box(normalizeOutput(result))
}
