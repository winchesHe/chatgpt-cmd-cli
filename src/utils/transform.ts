import type { AnswerArr } from '../types'

export function transformCmd(answerArr: AnswerArr) {
  const result = answerArr
    .map(i => i.execute && i.cmd)
    .filter(i => i)

  const returnArr = []
  for (const cmd of result) {
    const [_cmd, ..._opts] = (cmd as string).split(' ')
    returnArr.push([_cmd, _opts])
  }
  return returnArr as unknown as [string, string[]][]
}

export function convertCmd(answerArr: AnswerArr) {
  return answerArr
    .map(i => i.execute && i.cmd)
    .filter(i => i) as unknown as string[]
}
