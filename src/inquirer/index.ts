import type { QuestionCollection } from 'inquirer'
import inquirer from 'inquirer'
import select from '@inquirer/select'

type SelectData = Parameters<typeof select>['0']
type ReloadValue = 'execute' | 'reRun'

export async function getQuestion(msg = '请填写你的问题: '): Promise<string> {
  const question: QuestionCollection = {
    type: 'input',
    name: 'question',
    message: msg,
  }
  return (await inquirer.prompt([question])).question
}

export async function getConfirm(message: string): Promise<string> {
  const execute: QuestionCollection = {
    type: 'confirm',
    name: 'execute',
    message,
  }
  return (await inquirer.prompt([execute])).execute
}

export async function getSelect(choices: SelectData['choices'], message: string) {
  const selectData: Parameters<typeof select>['0'] = {
    message,
    choices,
  }
  return select(selectData) as Promise<string>
}

export async function getReloadSelect() {
  return getSelect(
    [
      {
        name: '执行全部命令',
        value: 'execute',
      },
      {
        name: '重新输入并生成新指令',
        value: 'reRun',
      },
    ],
    '选择命令并执行',
  ) as Promise<ReloadValue>
}
