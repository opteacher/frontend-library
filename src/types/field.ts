/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { BaseTypes, CompoType } from '.'

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Field {
  key: string
  label: string
  desc: string
  vtype: BaseTypes // 绑定值的类型
  default: any // 默认值
  ftype: CompoType // 表单组件类型
  rules: any[]
  refer: string
  placeholder: string
  vModel: boolean
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
    this.vModel = false
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
    this.vModel = false
    this.extra = {}
  }

  static copy(src: any, tgt?: Field, force = false): Field {
    tgt = tgt || new Field()
    const srcKey = src.key || src._id || ''
    tgt.key = force ? srcKey : srcKey || tgt.key
    tgt.label = force ? src.label : src.label || tgt.label
    tgt.desc = force ? src.desc : src.desc || tgt.desc
    tgt.vtype = force ? src.vtype : src.vtype || tgt.vtype
    tgt.default = force
      ? cvtValByType(src.default, tgt.vtype)
      : src.default
      ? cvtValByType(src.default, tgt.vtype)
      : tgt.default
    tgt.ftype = force ? src.ftype : src.ftype || tgt.ftype
    tgt.rules = force ? src.rules : src.rules || tgt.rules
    tgt.refer = force ? src.refer : src.refer || tgt.refer
    tgt.placeholder = force ? src.placeholder : src.placeholder || tgt.placeholder
    tgt.vModel = force ? src.vModel : typeof src.vModel !== 'undefined' ? src.vModel : tgt.vModel
    tgt.extra = force ? src.extra : src.extra || tgt.extra
    return tgt
  }
}

function cvtValByType(value: any, type: BaseTypes) {
  switch (type) {
    case 'Object':
      return JSON.parse(value)
    default:
      return value
  }
}
