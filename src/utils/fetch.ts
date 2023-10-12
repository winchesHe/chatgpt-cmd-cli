import type { ChatMessage } from 'chatgpt'
import { ChatGPTUnofficialProxyAPI } from 'chatgpt'
import { oraPromise } from 'ora'
import consola from 'consola'
import type { AnswerArr } from '../types'
import { readEnv, writeEnv } from './env'

let parentMessageId: string | undefined = readEnv().parentMessageId
let conversationId: string | undefined = readEnv().conversationId

export function createPromptFactory(instance: ChatGPTUnofficialProxyAPI, prompt: string) {
  return async (message: string) => {
    let res: ChatMessage | undefined

    if (!parentMessageId) {
      res = await instance.sendMessage(prompt)
      parentMessageId = res.id
      conversationId = res.conversationId!
      writeEnv({
        parentMessageId,
        conversationId,
      })
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
  const prompt = `我想要你作为一个终端，分析我提出的问题，并按照后面三个引号符号括起来的数据类型回答，回答我的时候只需要回答JSON数据类型，否则会使我的JSON.parse方法报错，其中desc用来输出该cmd指令的作用，cmd是需要运行的指令，execute一定为true。
  ## 数据类型
  """
  [
    {
      execute: true,
      desc: string,
      cmd: string
    }
  ]
  """
  
  ## 示例
  示例提问：展示所有本地分支
  示例回答直接输出JSON类型：
  ***
  [
    {
      execute: true,
      desc: '这是用于展示所有本地分支的 git 指令',
      cmd: 'git branch'
    }
  ]
  ***
  `
  return {
    cmdRunner: async (message: string): Promise<ChatMessage> =>
      createPromptFactory(instance, prompt)(message),
  }
}

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
  const api = new ChatGPTUnofficialProxyAPI({
    accessToken: readEnv().accessToken,
    apiReverseProxyUrl: 'https://ai.fakeopen.com/api/conversation',
  })

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
