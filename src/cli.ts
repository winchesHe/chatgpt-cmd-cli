#!/usr/bin/env node
import { Command } from 'commander'
import pkg from '../package.json'
import { start } from './command/index'

const program = new Command()
program.version(pkg.version, '-v --version', '显示当前版本号')

program
  .description('用于智能终端执行命令的 cli-gpt 应用')
  .argument('[question]', '向 gpt 提出的问题')
  .action(start)

program.parse(process.argv)
