import type { ChatMessage } from 'chatgpt'
import { ChatGPTUnofficialProxyAPI } from 'chatgpt'
import { oraPromise } from 'ora'
import consola from 'consola'
import type { AnswerArr } from '../types'

let parentMessageId: string | undefined
let conversationId: string | undefined

export function createPromptFactory(instance: ChatGPTUnofficialProxyAPI, prompt: string) {
  return async (message: string) => {
    let res: ChatMessage | undefined

    if (!parentMessageId) {
      res = await instance.sendMessage(prompt)
      parentMessageId = res.id
      conversationId = res.conversationId
    }

    res = await instance.sendMessage(message, {
      parentMessageId,
      conversationId,
    })

    parentMessageId = res.id

    return res
  }
}

export function cmdRunner(instance: ChatGPTUnofficialProxyAPI) {
  const prompt = `我想要你作为一个终端，分析我提出的问题，并按照后面####符号圈起来的数据类型，回答我的时候只需要回答JSON数据类型，否则会使我的JSON.parse方法报错，你可以参考我####符号里圈起来的回答类型去输出，其中desc用来输出该cmd指令的作用，cmd是需要运行的指令，execute一定为true。
  ## 数据类型
  ####
  [
    {
      execute: true,
      desc: string,
      cmd: string
    }
  ]
  ####
  
  ## 示例
  示例提问：展示所有本地分支
  示例回答直接输出JSON类型：
  [
    {
      execute: true,
      desc: '这是用于展示所有本地分支的 git 指令',
      cmd: 'git branch'
    }
  ]
  `
  return {
    cmdRunner: async (message: string): Promise<ChatMessage> =>
      createPromptFactory(instance, prompt)(message),
  }
}

const api = new ChatGPTUnofficialProxyAPI({
  accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJjc2wxMzkwMTU4OTI4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7InVzZXJfaWQiOiJ1c2VyLUVYckhaTnBpcG5rWmN6MHZCaDlHMFNzVSJ9LCJpc3MiOiJodHRwczovL2F1dGgwLm9wZW5haS5jb20vIiwic3ViIjoiYXV0aDB8NjQ3MmMxY2IyOWEwNjJkYTY1YWM3MjdmIiwiYXVkIjpbImh0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEiLCJodHRwczovL29wZW5haS5vcGVuYWkuYXV0aDBhcHAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTY5NjI2MDc4OCwiZXhwIjoxNjk3MTI0Nzg4LCJhenAiOiJUZEpJY2JlMTZXb1RIdE45NW55eXdoNUU0eU9vNkl0RyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgbW9kZWwucmVhZCBtb2RlbC5yZXF1ZXN0IG9yZ2FuaXphdGlvbi5yZWFkIG9yZ2FuaXphdGlvbi53cml0ZSBvZmZsaW5lX2FjY2VzcyJ9.fARmQyyUhHmWAhc5QwOq5LzrVfDKlzVzK1dBNVrZ5sjkhITHiI6KSu65PVuaR5rLkvvxYgaJ4xQyzP1PkiQHCp1Z6bY4XwDrX8aVNJ2moX41CJlBECztHsnG24BHzcT5LlH54A6DjcrDSrk0kZqdLKZYNOxJ7TUKIdtkXuWcR5_FNpMJ2_6D_8GsbC0CIxZIUYcymN8BEkihd94zHB2NLWYdZVp6VeTiTOiyXbTsbYcZWgu20NLjzIWpBfios8-jBqZhsQAYcoAFYjsubnyWELFSUl0GZN990YnhPOqGb9lFIaS9OTn6mnm3iI9aFHlQ0S6vgopK-8_2oXs9DAvXGw',
  apiReverseProxyUrl: 'https://ai.fakeopen.com/api/conversation',
})

export async function fetchQuestion2() {
  return [
    {
      desc: 'test',
      cmd: 'git branch',
      execute: true,
    },
    {
      desc: 'test',
      cmd: 'git checkout hwc-test',
      execute: true,
    },
    {
      desc: 'test',
      cmd: 'git branch | grep \'hwc\'',
      execute: true,
    },
  ]
}

export async function fetchQuestion(question: string) {
  const _cmdRunner = cmdRunner(api)

  const res = await oraPromise(_cmdRunner.cmdRunner(question), {
    text: question,
  })

  try {
    const text = res.text
    const matchReg = /\[.*\]/ms
    const matchJson = text.match(matchReg)?.[0]

    if (!matchJson) {
      // eslint-disable-next-line no-throw-literal
      throw ('匹配不出JSON结果')
    }

    return JSON.parse(matchJson) as Promise<AnswerArr>
  }
  catch (error) {
    consola.error(error, res.text)
    process.exit(1)
  }
}
