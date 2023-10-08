import type { AnswerArr } from '../types'

export function normalizeOutput(answerArr: AnswerArr) {
  return `⚡️Generated Cmd:\n\n${answerArr
    .map((i, index) => `${index + 1}. ${i.cmd}`)
    .join('\n')}`
}

export function normalizeDesc(answerArr: AnswerArr) {
  return `⚙️ Description:\n\n${answerArr
    .map((i, index) => `${index + 1}. ${i.desc}`)
    .join('\n')}`
}
