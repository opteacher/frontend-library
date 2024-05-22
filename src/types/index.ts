/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProperty } from '../utils'
import dayjs from 'dayjs'

export const compares = {
  '=': '等于',
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
      this.cmp = '='
      this.val = undefined
    } else {
      this.key = params.key
      this.cmp = params.cmp
      this.val = params.val
    }
  }

  isValid(object: Record<string, any>) {
    switch (this.cmp) {
      case '!=':
        if (this.val === 'undefined' || typeof this.val === 'undefined') {
          return typeof getProperty(object, this.key) !== 'undefined'
        } else {
          return getProperty(object, this.key) !== this.val
        }
      case '=':
      default:
        if (this.val === 'undefined' || typeof this.val === 'undefined') {
          return typeof getProperty(object, this.key) === 'undefined'
        } else {
          return getProperty(object, this.key) === this.val
        }
    }
  }
}

export const cmpLblMap = {
  Text: '文本框',
  Block: '块',
  FormDialog: '表单对话框',
  FormGroup: '表单组',
  FormItem: '表单项',
  Input: '输入框',
  Password: '密码框',
  IpAddress: 'IP地址框',
  IconField: '图标框',
  Number: '数字框',
  Button: '按钮',
  Select: '选择框',
  DateTime: '日期选择',
  Radio: '单选框',
  Checkbox: '多选框',
  Switch: '开关',
  Table: '可编辑表',
  Textarea: '多行输入框',
  Delable: '可删除',
  SelOrIpt: '可选可输入',
  UploadFile: '上传',
  Cascader: '层级选择框',
  ListSelect: '列表选择框',
  TagList: '标签列表',
  CodeEditor: '代码编辑框',
  JsonEditor: 'JSON编辑框',
  EditList: '可编辑列表',
  Carousel: '滚动展示框',
  ColorSelect: '颜色选择框',
  Row: '横向容器',
  Col: '纵向容器',
  Card: '卡片',
  Image: '图片',
  Unknown: '未知'
}

export type CompoType = keyof typeof cmpLblMap

export const compoOpns = Object.entries(cmpLblMap).map(([value, label]) => ({ label, value }))

export function compoDftVal(ctype: CompoType) {
  switch (ctype) {
    case 'Number':
      return 0
    case 'DateTime':
    case 'Select':
      return null
    case 'Checkbox':
    case 'Switch':
      return false
    case 'Table':
    case 'UploadFile':
    case 'Cascader':
    case 'ListSelect':
    case 'EditList':
    case 'TagList':
      return []
    case 'Input':
    case 'Password':
    case 'Textarea':
    case 'Delable':
    case 'SelOrIpt':
    case 'CodeEditor':
    case 'IconField':
    case 'Radio':
    default:
      return ''
    case 'IpAddress':
      return '0.0.0.0'
    case 'JsonEditor':
      return '{}'
  }
}

export type OpnType = {
  label: string
  subLabel?: string
  value: any
  children?: any[]
}

export type CmpRel = 'AND' | 'OR'

export const bsTpMap = {
  Id: '标识',
  String: '字符串',
  LongStr: '长字符串',
  Number: '数字',
  DateTime: '日期时间',
  Boolean: '布尔',
  Array: '数组',
  Object: '对象',
  Function: '函数',
  Any: '任意',
  Unknown: '未知'
}

export const bsTpOpns = Object.entries(bsTpMap).map(([value, label]) => ({ label, value }))

export const baseTypes = Object.keys(bsTpMap)

export const methods = ['POST', 'PUT', 'DELETE', 'GET']

export type BaseTypes = keyof typeof bsTpMap

export function bsTpDefault(bsTp: BaseTypes) {
  switch (bsTp) {
    case 'Id':
    case 'Any':
      return null
    case 'Number':
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
      return () => ({})
    case 'Unknown':
    default:
      return undefined
  }
}

export const colors: Color[] = [
  'warning',
  'error',
  'success',
  'primary',
  'cyan',
  'black',
  'purple',
  'pink',
  'red',
  'orange',
  'green',
  'blue'
]

export const clrMap = {
  warning: '#ff9900',
  error: '#ff3300',
  success: '#00cc66',
  primary: '#2db7f5',
  cyan: '#04c1e1',
  black: '#131313',
  purple: '#b500fe',
  pink: '#c41d7f',
  red: '#cf1322',
  orange: '#d46b08',
  green: '#389e0d',
  blue: '#0958d9'
}
export type Color = keyof typeof clrMap
