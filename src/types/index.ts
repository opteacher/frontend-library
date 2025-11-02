/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs'
import { fixEndsWith, fixStartsWith, getProp } from '../utils'

export const compares = {
  '==': '等于',
  '!=': '不等于',
  in: '包含',
  starts: '开头是',
  ends: '结尾是'
}

export const cmpOpns = Object.entries(compares).map(([value, label]) => ({ label, value }))

export type CmpType = keyof typeof compares

export class Cond {
  key: string
  cmp: CmpType
  val: any

  constructor(params?: { key: string; cmp: CmpType; val: any }) {
    if (!params) {
      this.key = ''
      this.cmp = '=='
      this.val = undefined
    } else {
      this.key = params.key
      this.cmp = params.cmp
      this.val = params.val
    }
  }

  static create(key: string, cmp: CmpType, val: any): Cond {
    return new Cond({ key, cmp, val })
  }

  isValid(object: Record<string, any>) {
    switch (this.cmp) {
      case '!=':
        if (this.val === 'undefined' || typeof this.val === 'undefined') {
          return typeof getProp(object, this.key) !== 'undefined'
        } else {
          return getProp(object, this.key) !== this.val
        }
      case '==':
      default:
        if (this.val === 'undefined' || typeof this.val === 'undefined') {
          return typeof getProp(object, this.key) === 'undefined'
        } else {
          return getProp(object, this.key) === this.val
        }
    }
  }
}

export const cmpNickDict = {
  Text: '文本框',
  Block: '块',
  FormDialog: '表单对话框',
  FormGroup: '表单组',
  FormItem: '表单项',
  Input: '输入框',
  Password: '密码框',
  IpAddress: 'IP地址框',
  CompactInput: '组合输入框',
  IconField: '图标框',
  Number: '数字框',
  Button: '按钮',
  Buttons: '按钮组',
  Select: '选择框',
  DateTime: '日期选择',
  Radio: '单选框',
  Checkbox: '多选框',
  Switch: '开关',
  Table: '可编辑表',
  Steps: '步骤条',
  Textarea: '多行输入框',
  Delable: '可删除',
  SelOrIpt: '可选可输入',
  UploadFile: '上传文件',
  Cascader: '层级选择框',
  ListSelect: '列表选择框',
  TagList: '标签列表',
  CodeEditor: '代码编辑框',
  JsonEditor: 'JSON编辑框',
  EditList: '可编辑列表',
  Carousel: '滚动展示框',
  ColorSelect: '颜色选择框',
  PageEleSel: '页面元素选择框',
  Row: '横向容器',
  Col: '纵向容器',
  Card: '卡片',
  Image: '图片',
  Unknown: '未知'
}

export type CompoType = keyof typeof cmpNickDict

export const compoOpns = Object.entries(cmpNickDict).map(([value, label]) => ({ label, value }))

export type OpnType = {
  label: string
  subLabel?: string
  value: any
  children?: any[]
}

export type CmpRel = 'AND' | 'OR'

export const typeDict = {
  Id: '标识',
  String: '字符串',
  LongStr: '长字符串',
  Number: '数字',
  Decimal: '高精浮点数',
  DateTime: '日期时间',
  Boolean: '布尔',
  Array: '数组',
  Object: '对象',
  Function: '函数',
  Any: '任意',
  Unknown: '未知'
}

export const typeOpns = Object.entries(typeDict).map(([value, label]) => ({ label, value }))

export const baseTypes = Object.keys(typeDict)

export const methods = ['POST', 'PUT', 'DELETE', 'GET']

export type BaseTypes = keyof typeof typeDict

export function typeDftVal(bsTp: BaseTypes) {
  switch (bsTp) {
    case 'Id':
    case 'Any':
      return null
    case 'Number':
    case 'Decimal':
      return 0
    case 'String':
    case 'LongStr':
      return ''
    case 'Boolean':
      return false
    case 'DateTime':
      return null
    case 'Array':
      return []
    case 'Object':
      return {}
    case 'Function':
      return function () {
        return
      }
    case 'Unknown':
    default:
      return undefined
  }
}

const boolDict = { true: true, false: false }

export function strToType(str: string, bsTp: BaseTypes) {
  switch (bsTp) {
    case 'Number':
    case 'Decimal':
      return str.includes('.') ? parseFloat(str) : parseInt(str)
    case 'Boolean':
      return str.toLowerCase() in boolDict
        ? boolDict[str.toLowerCase() as keyof typeof boolDict]
        : str
    case 'DateTime':
      return dayjs(str)
    case 'Array':
      return fixEndsWith(fixStartsWith(str, '['), ']')
        .split(',')
        .map(itm => itm.trim())
    case 'Object':
      return JSON.parse(str)
    case 'Function':
      return new Function(str)()
    case 'Id':
    case 'Any':
    case 'Unknown':
    case 'String':
    case 'LongStr':
    default:
      return str
  }
}

export const colors = [
  'purple',
  'red',
  'orange',
  'green',
  'blue'
]

export function genRandColor(disables: string[]) {
  let color = colors[Math.floor(Math.random() * colors.length)]
  if (disables.includes(color)) {
    color = genRandColor(disables)
  }
  return color
}
