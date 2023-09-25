import type { AnswerArr } from '../types'

export async function fetchQuestion(question: string): Promise<AnswerArr> {
  return [
    {
      cmd: 'git branch',
      desc: 'test',
      execute: true,
    },
    {
      cmd: 'git branch',
      desc: 'test',
      execute: true,
    },
  ]
}
