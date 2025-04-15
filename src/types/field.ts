/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { gnlCpy } from '@/utils'
import { Cond, type BaseTypes, type CompoType } from '.'

export default class Field {
  key: string
  label: string
  desc: string
  ftype: CompoType // 表单组件类型
  vtype: BaseTypes // 绑定值的类型
  default: any // 默认值
  rules: any[]
  refer: string
  placeholder: string
  disabled: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  display: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  empty: boolean
  vModel: boolean // 双向绑定
  onChange: (newVal: any, oldVal: any) => any
  extra: any

  constructor() {
    this.key = ''
    this.label = ''
    this.desc = ''
    this.vtype = 'Unknown'
    this.default = undefined
    this.ftype = 'Unknown'
    this.rules = []
    this.refer = ''
    this.placeholder = ''
    this.disabled = false
    this.display = true
    this.empty = false
    this.vModel = false
    this.onChange = () => undefined
    this.extra = {}
  }

  reset() {
    this.key = ''
    this.label = ''
    this.desc = ''
    this.vtype = 'Unknown'
    this.default = undefined
    this.ftype = 'Unknown'
    this.rules = []
    this.refer = ''
    this.placeholder = ''
    this.disabled = false
    this.display = true
    this.empty = false
    this.vModel = false
    this.onChange = () => undefined
    this.extra = {}
  }

  static copy(src: any, tgt?: Field, force = false): Field {
    tgt = gnlCpy(Field, src, tgt, { force, ignProps: ['default', 'disabled', 'display'] })
    tgt.default = force
      ? cvtValByType(src.default, tgt.vtype) 
      : src.default
      ? cvtValByType(src.default, tgt.vtype)
      : tgt.default
    return tgt
  }
}

function cvtValByType(value: any, type: BaseTypes) {
  switch (type) {
    case 'Object':
      return typeof value === 'string' ? JSON.parse(value) : value
    case 'Function':
      return typeof value === 'string' ? new Function(value) : value
    default:
      return value
  }
}

export function fieldsDftVals(fields: Field[]) {
  return Object.fromEntries(fields.map(f => [f.refer, fieldDftVal(f.ftype)]))
}

export function fieldDftVal(ctype: CompoType) {
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