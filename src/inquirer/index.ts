import inquirer from 'inquirer'

export async function getQuestion(): Promise<string> {
  const question = {
    type: 'input',
    name: 'question',
    message: '请填写你的问题: ',
  }
  return (await inquirer.prompt([question])).question
}
