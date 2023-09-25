import type { AnswerArr } from '../types'

export function normalizeOutput(answerArr: AnswerArr) {
  return `⚡️Generated Cmd:\n\n${answerArr
    .map((i, index) => `${index + 1}. ${i.cmd}  ${i.desc}`)
    .join('\n')}`
}
