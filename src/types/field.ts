/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { fixStartsWith, gnlCpy } from '@/utils'
import { Cond, type BaseTypes, type CompoType } from '.'
import _ from 'lodash'

export default class Field {
  key: string
  label: string
  desc: string
  ftype: CompoType // 表单组件类型
  vtype: BaseTypes // 绑定值的类型
  default: any // 默认值
  expable: boolean
  rules: any[]
  refer: string
  placeholder: string
  disabled: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  display: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  empty: boolean
  vModel: boolean // 双向绑定
  vOn: boolean // 事件绑定，vtype固定为Function
  onChange: (newVal: any, oldVal: any) => any
  extra: any

  constructor() {
    this.key = ''
    this.label = ''
    this.desc = ''
    this.vtype = 'Unknown'
    this.default = undefined
    this.expable = false
    this.ftype = 'Unknown'
    this.rules = []
    this.refer = ''
    this.placeholder = ''
    this.disabled = false
    this.display = true
    this.empty = false
    this.vModel = false
    this.vOn = false
    this.onChange = () => undefined
    this.extra = {}
  }

  reset() {
    this.key = ''
    this.label = ''
    this.desc = ''
    this.vtype = 'Unknown'
    this.default = undefined
    this.expable = false
    this.ftype = 'Unknown'
    this.rules = []
    this.refer = ''
    this.placeholder = ''
    this.disabled = false
    this.display = true
    this.empty = false
    this.vModel = false
    this.vOn = false
    this.onChange = () => undefined
    this.extra = {}
  }

  static copy(src: any, tgt?: Field, force = false): Field {
    return gnlCpy(Field, src, tgt, {
      force,
      cpyMapper: {
        default: () => cvtValByType(src.default, src.vtype),
        onChange: () => cvtValByType(src.onChange, 'Function')
      },
      ignProps: ['disabled', 'display']
    })
  }
}

export function cvtValByType(value: any, type: BaseTypes) {
  switch (type) {
    case 'Object':
      return typeof value === 'string' ? JSON.parse(value) : value
    case 'Function':
      return typeof value === 'string' ? new Function(fixStartsWith(value, 'return '))() : value
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
