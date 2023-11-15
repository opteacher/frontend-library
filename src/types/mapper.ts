/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep } from 'lodash'
import { TinyEmitter as Emitter } from 'tiny-emitter'

import { CompoType, Cond, OpnType } from '.'
import Column from './column'
import Field from './field'

export class BaseMapper {
  label: string
  desc: string
  type: CompoType
  rules: any[]
  placeholder: string
  disabled: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  loading: boolean
  display: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  empty: boolean
  onChange: (record: any, to: any, from?: any, extra?: any) => void

  constructor() {
    this.label = ''
    this.desc = ''
    this.type = 'Unknown'
    this.rules = []
    this.placeholder = ''
    this.disabled = false
    this.loading = false
    this.display = true
    this.empty = false
    this.onChange = () => undefined
  }

  reset() {
    this.label = ''
    this.desc = ''
    this.type = 'Unknown'
    this.rules = []
    this.placeholder = ''
    this.disabled = false
    this.loading = false
    this.display = true
    this.empty = false
    this.onChange = () => undefined
  }
}

export class InputMapper extends BaseMapper {
  iptType: string
  prefix: string
  suffix: string
  onBlur: (record: any, to: any) => void

  constructor() {
    super()
    this.iptType = ''
    this.prefix = ''
    this.suffix = ''
    this.onBlur = () => undefined
  }

  reset() {
    super.reset()
    this.iptType = ''
    this.prefix = ''
    this.suffix = ''
    this.onBlur = () => undefined
  }
}

export class TextareaMapper extends BaseMapper {
  maxRows: number
  onBlur: (record: any, to: any) => void

  constructor() {
    super()
    this.maxRows = 3
    this.onBlur = () => undefined
  }

  reset() {
    super.reset()
    this.maxRows = 3
    this.onBlur = () => undefined
  }
}

export class SelectMapper extends BaseMapper {
  allowClear: boolean
  options: string[] | OpnType[]
  onDropdown: (open: boolean) => void

  constructor() {
    super()
    this.allowClear = false
    this.options = []
    this.onDropdown = () => undefined
  }

  reset() {
    super.reset()
    this.allowClear = false
    this.options = []
    this.onDropdown = () => undefined
  }
}

export class CheckboxMapper extends BaseMapper {
  // 0为false，1为true
  chkLabels: [string, string]
  options: OpnType[]

  constructor() {
    super()
    this.chkLabels = ['否', '是']
    this.options = []
  }

  reset() {
    super.reset()
    this.chkLabels = ['否', '是']
    this.options = []
  }
}

export class ButtonMapper extends BaseMapper {
  inner: string
  danger: boolean
  primary: boolean
  onClick: () => void

  constructor() {
    super()
    this.inner = ''
    this.danger = false
    this.primary = true
    this.onClick = () => undefined
  }

  reset() {
    super.reset()
    this.inner = ''
    this.danger = false
    this.primary = true
    this.onClick = () => undefined
  }
}

export class TableMapper extends BaseMapper {
  mapper: Mapper
  columns: Column[]
  emitter: Emitter
  newFun: () => any
  onEdit: (record: any) => void
  onSaved: (record: any, extra?: any) => void
  onDeleted: (key: any, extra?: any) => void
  addable: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  editable: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  delable: boolean | Cond[] | { [cmpRel: string]: Cond[] }

  constructor() {
    super()
    this.mapper = new Mapper()
    this.columns = []
    this.emitter = new Emitter()
    this.newFun = () => ({})
    this.onEdit = () => undefined
    this.onSaved = <T extends { key: string }>(nItm: T, array: T[]) => {
      array.push(cloneDeep(nItm))
      this.emitter.emit('update:show', false)
    }
    this.onDeleted = <T extends { key: string }>(key: string, array: T[]) => {
      array.splice(
        array.findIndex(item => item.key === key),
        1
      )
      this.emitter.emit('update:show', false)
    }
    this.addable = true
    this.editable = true
    this.delable = true
  }

  reset() {
    super.reset()
    this.mapper = new Mapper()
    this.columns = []
    this.emitter = new Emitter()
    this.newFun = () => ({})
    this.onEdit = () => undefined
    this.onSaved = <T extends { key: string }>(nItm: T, array: T[]) => {
      array.push(cloneDeep(nItm))
      this.emitter.emit('update:show', false)
    }
    this.onDeleted = <T extends { key: string }>(key: string, array: T[]) => {
      array.splice(
        array.findIndex(item => item.key === key),
        1
      )
      this.emitter.emit('update:show', false)
    }
    this.addable = true
    this.editable = true
    this.delable = true
  }
}

export class SelOrIptMapper extends BaseMapper {
  mode: 'select' | 'input'
  options: OpnType[]

  constructor() {
    super()
    this.mode = 'input'
    this.options = []
  }

  reset() {
    super.reset()
    this.mode = 'input'
    this.options = []
  }
}

export class LstSelMapper extends BaseMapper {
  height: number
  options: { key: string; title: string; subTitle?: string; avatar?: string; href?: string }[]

  constructor() {
    super()
    this.height = 200
    this.options = []
  }

  reset() {
    super.reset()
    this.height = 200
    this.options = []
  }
}

export class EdtLstMapper extends BaseMapper {
  lblProp: string
  // 存在lblProp的情况下，则显示lblMapper[item[lblProp]]，不存在的话显示lblMapper[item]
  lblMapper: Record<any, string>
  inline: boolean
  // 抹平单元素表单列表：[{ key: 'abc' }] => ['abc']
  // 注意：会抹去元素的键信息
  // 注意：抹平只作用于onSaved，不会影响元素的显示！
  //      但抹平确实会影响lblProp（产生如：string[lblProp]
  //      这样的问题），所以两者最好不要同时为真
  // 如果抹平，则取新元素第一个字段，反之调用copy
  flatItem: boolean
  // 子标题字段
  subProp: string
  mapper: Mapper
  // 数据发生变化后必须触发update:value，重写onSaved也必须注意这一点！
  emitter: Emitter
  newFun: () => any
  onAdded: () => Promise<void>
  onSaved: (nItem: any, array?: any[]) => Promise<void>

  constructor() {
    super()
    this.lblProp = ''
    this.lblMapper = {}
    this.inline = true
    this.flatItem = true
    this.subProp = ''
    this.mapper = new Mapper()
    this.emitter = new Emitter()
    this.newFun = () => ({})
    this.onAdded = () => Promise.resolve()
    this.onSaved = () => Promise.resolve()
  }

  reset() {
    super.reset()
    this.lblProp = ''
    this.lblMapper = {}
    this.inline = true
    this.flatItem = true
    this.subProp = ''
    this.mapper = new Mapper({})
    this.emitter = new Emitter()
    this.newFun = () => ({})
    this.onAdded = () => Promise.resolve()
    this.onSaved = () => Promise.resolve()
  }
}

export class GroupMapper extends BaseMapper {
  fold: boolean
  items: Mapper

  constructor() {
    super()
    this.fold = false
    this.items = new Mapper()
  }

  reset() {
    super.reset()
    this.fold = false
    this.items = new Mapper()
  }
}

export class CdEdtMapper extends BaseMapper {
  lang: 'javascript' | 'json'

  constructor() {
    super()
    this.lang = 'javascript'
  }

  reset() {
    super.reset()
    this.lang = 'javascript'
  }
}

export class UploadMapper extends BaseMapper {
  path: string
  params: any
  directory: boolean
  headers: Record<string, any>
  onBeforeUpload: (file: any, fileList: any[]) => boolean | Promise<any>

  constructor() {
    super()
    this.path = ''
    this.params = undefined
    this.headers = {}
    this.directory = false
    this.onBeforeUpload = () => true
  }

  reset() {
    super.reset()
    this.path = ''
    this.params = undefined
    this.headers = {}
    this.directory = false
    this.onBeforeUpload = () => true
  }
}

export class RadioMapper extends SelectMapper {
  style: 'circle' | 'button'

  constructor() {
    super()
    this.style = 'circle'
  }

  reset() {
    super.reset()
    this.style = 'circle'
  }
}

const mapTypeTemps = {
  Unknown: () => new BaseMapper(),
  Input: () => new InputMapper(),
  Number: () => new InputMapper(),
  Password: () => new InputMapper(),
  Textarea: () => new TextareaMapper(),
  Select: () => new SelectMapper(),
  Cascader: () => new SelectMapper(),
  Checkbox: () => new CheckboxMapper(),
  Radio: () => new RadioMapper(),
  Switch: () => new CheckboxMapper(),
  Button: () => new ButtonMapper(),
  Table: () => new TableMapper(),
  Text: () => new BaseMapper(),
  Delable: () => new TableMapper(),
  SelOrIpt: () => new SelOrIptMapper(),
  UploadFile: () => new UploadMapper(),
  DateTime: () => new BaseMapper(),
  TagList: () => new EdtLstMapper(),
  ListSelect: () => new LstSelMapper(),
  CodeEditor: () => new CdEdtMapper(),
  JsonEditor: () => new TextareaMapper(),
  EditList: () => new EdtLstMapper(),
  FormGroup: () => new GroupMapper()
} as { [mapType: string]: () => any }

export type MapperType = BaseMapper & Record<string, any>

export default class Mapper {
  [prop: string]: MapperType

  constructor(init?: any) {
    if (init) {
      for (const [key, val] of Object.entries(init)) {
        const value = val as BaseMapper
        if (!value.type) {
          value.type = 'Unknown'
        }
        this[key] = Object.assign(mapTypeTemps[value.type](), cloneDeep(value))
      }
    }
  }
}

function adjExtra(value: any): any {
  if (typeof value === 'string' && value.startsWith('return ')) {
    return eval(`(function () {${value}})()`)
  } else if (value instanceof Array) {
    return value.map(itm => adjExtra(itm))
  } else if (value instanceof Object) {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, adjExtra(val)]))
  }
  return value
}

export function createByField(field: Field): MapperType {
  return Object.assign(
    {
      type: field.ftype,
      label: field.label,
      desc: field.desc,
      rules: field.rules,
      placeholder: field.placeholder
    },
    Object.fromEntries(Object.entries(field.extra || {}).map(([key, val]) => [key, adjExtra(val)]))
  ) as MapperType
}

export function createByFields(fields: Field[]): Mapper {
  const data = {} as Record<string, any>
  for (const field of fields) {
    const mpItm = createByField(field)
    if (field.refer.indexOf('.') === -1) {
      data[field.refer] = mpItm
    } else {
      const [group] = field.refer.split('.')
      let grpLabel = group + '组'
      let itmLabel = mpItm.label
      if (mpItm.label.indexOf('/') !== -1) {
        ;[grpLabel, itmLabel] = mpItm.label.split('/')
      }
      const upMpItm = Object.assign(mpItm, { label: itmLabel })
      if (group in data) {
        data[group].items[field.refer] = upMpItm
      } else {
        const mapper = new GroupMapper()
        mapper.label = grpLabel
        mapper.type = 'FormGroup'
        mapper.items = {
          [field.refer]: upMpItm
        }
        data[group] = mapper
      }
    }
  }
  return new Mapper(data)
}
