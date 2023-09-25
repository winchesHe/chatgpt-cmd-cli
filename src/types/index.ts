export interface Options {
  question?: string
}

export interface AnswerData {
  execute: boolean
  desc: string
  cmd: string
}

export type AnswerArr = AnswerData[]
