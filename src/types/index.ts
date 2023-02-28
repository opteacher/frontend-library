/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProperty, gnlCpy } from '@/utils'
import dayjs from 'dayjs'

export class Cond {
  key: string
  cmp: '=' | '!=' | 'in'
  val: any

  constructor() {
    this.key = ''
    this.cmp = '='
    this.val = 'undefined'
  }

  isValid(object: Record<string, any>) {
    switch (this.cmp) {
      case '!=':
        if (this.val === 'undefined') {
          return typeof getProperty(object, this.key) !== 'undefined'
        } else {
          return getProperty(object, this.key) !== this.val
        }
      case '=':
      default:
        if (this.val === 'undefined') {
          return typeof getProperty(object, this.key) === 'undefined'
        } else {
        return getProperty(object, this.key) === this.val
        }
    }
  }

  static copy(src: any, tgt?: Cond, force = false): Cond {
    return gnlCpy(Cond, src, tgt, { force })
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
  IconField: '图标框',
  Number: '数字框',
  Button: '按钮',
  Select: '选择框',
  DateTime: '日期选择',
  Checkbox: '多选框',
  Switch: '单选框',
  Table: '可编辑表',
  Textarea: '多行输入框',
  Delable: '可删除',
  SelOrIpt: '可选可输入',
  UploadFile: '上传',
  Cascader: '层级选择框',
  ListSelect: '列表选择框',
  TagList: '标签列表',
  CodeEditor: '代码编辑框',
  EditList: '可编辑列表',
  Carousel: '滚动展示框',
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
      return dayjs()
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
    case 'Select':
    case 'Textarea':
    case 'Delable':
    case 'SelOrIpt':
    case 'CodeEditor':
    case 'IconField':
    default:
      return ''
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
      return dayjs()
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
