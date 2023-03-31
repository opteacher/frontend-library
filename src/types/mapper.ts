/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CompoType, Cond, OpnType } from '.'
import Column from './column'
import { TinyEmitter as Emitter } from 'tiny-emitter'
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

  static copy(src: any, tgt?: BaseMapper, force = false): BaseMapper {
    tgt = tgt || new BaseMapper()
    tgt.label = src.label || tgt.label
    tgt.desc = src.desc || tgt.desc
    tgt.type = src.type || tgt.type
    tgt.rules = src.rules || tgt.rules
    tgt.placeholder = src.placeholder || tgt.placeholder
    tgt.disabled =
      src.disabled && src.disabled.length
        ? src.disabled.map((el: any) => Cond.copy(el))
        : typeof src.disabled !== 'undefined'
        ? src.disabled
        : tgt.disabled
    tgt.display =
      src.display && src.display.length
        ? src.display.map((el: any) => Cond.copy(el))
        : typeof src.display !== 'undefined'
        ? src.display
        : tgt.display
    tgt.empty = typeof src.empty !== 'undefined' ? src.empty : tgt.empty
    tgt.onChange = src.onChange || tgt.onChange
    return tgt
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

  static copy(src: any, tgt?: InputMapper, force = false): InputMapper {
    tgt = tgt || new InputMapper()
    BaseMapper.copy(src, tgt)
    tgt.iptType = src.iptType || tgt.iptType
    tgt.prefix = src.prefix || tgt.prefix
    tgt.suffix = src.suffix || tgt.suffix
    tgt.onBlur = src.onBlur || tgt.onBlur
    return tgt
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

  static copy(src: any, tgt?: TextareaMapper, force = false): TextareaMapper {
    tgt = tgt || new TextareaMapper()
    BaseMapper.copy(src, tgt)
    tgt.maxRows = src.maxRows || tgt.maxRows
    tgt.onBlur = src.onBlur || tgt.onBlur
    return tgt
  }
}

export class SelectMapper extends BaseMapper {
  loading: boolean
  allowClear: boolean
  options: string[] | OpnType[]
  onDropdown: (open: boolean) => void

  constructor() {
    super()
    this.loading = false
    this.allowClear = false
    this.options = []
    this.onDropdown = () => undefined
  }

  reset() {
    super.reset()
    this.loading = false
    this.allowClear = false
    this.options = []
    this.onDropdown = () => undefined
  }

  static copy(src: any, tgt?: SelectMapper, force = false): SelectMapper {
    tgt = tgt || new SelectMapper()
    BaseMapper.copy(src, tgt)
    tgt.loading = typeof src.loading !== 'undefined' ? src.loading : tgt.loading
    tgt.allowClear = typeof src.allowClear !== 'undefined' ? src.allowClear : tgt.allowClear
    tgt.options = src.options
      ? src.options.map((opn: any) => {
          if (typeof opn === 'string') {
            return opn
          } else {
            return {
              label: opn.label,
              value: opn.value,
              subLabel: opn.subLabel || '',
              children: opn.children || []
            }
          }
        })
      : tgt.options
    tgt.onDropdown = src.onDropdown || tgt.onDropdown
    return tgt
  }
}

export class CheckboxMapper extends BaseMapper {
  // 0为false，1为true
  chkLabels: [string, string]

  constructor() {
    super()
    this.chkLabels = ['否', '是']
  }

  reset() {
    super.reset()
    this.chkLabels = ['否', '是']
  }

  static copy(src: any, tgt?: CheckboxMapper, force = false): CheckboxMapper {
    tgt = tgt || new CheckboxMapper()
    BaseMapper.copy(src, tgt)
    tgt.chkLabels = src.chkLabels || tgt.chkLabels
    return tgt
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

  static copy(src: any, tgt?: ButtonMapper, force = false): ButtonMapper {
    tgt = tgt || new ButtonMapper()
    BaseMapper.copy(src, tgt)
    tgt.inner = src.inner || tgt.inner
    tgt.danger = src.danger || tgt.danger
    tgt.primary = src.primary || tgt.primary
    tgt.onClick = src.onClick || tgt.onClick
    return tgt
  }
}

export class TableMapper extends BaseMapper {
  mapper: Mapper
  columns: Column[]
  emitter: Emitter
  copy: (one: any) => any
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
    this.copy = () => undefined
    this.onEdit = () => undefined
    this.onSaved = <T extends { key: string }>(nItm: T, array: T[]) => {
      array.push(this.copy(nItm))
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
    this.copy = () => undefined
    this.onEdit = () => undefined
    this.onSaved = <T extends { key: string }>(nItm: T, array: T[]) => {
      array.push(this.copy(nItm))
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

  static copy(src: any, tgt?: TableMapper, force = false): TableMapper {
    tgt = tgt || new TableMapper()
    BaseMapper.copy(src, tgt)
    tgt.mapper = src.mapper ? Mapper.copy(src.mapper, tgt.mapper) : tgt.mapper
    tgt.columns = src.columns || tgt.columns
    tgt.emitter = src.emitter || tgt.emitter
    tgt.copy = src.copy || tgt.copy
    tgt.onEdit = src.onEdit || tgt.onEdit
    tgt.onSaved = src.onSaved || tgt.onSaved
    tgt.onDeleted = src.onDeleted || tgt.onDeleted
    tgt.addable = typeof src.addable != 'undefined' ? src.addable : tgt.addable
    tgt.editable = typeof src.editable != 'undefined' ? src.editable : tgt.editable
    tgt.delable = typeof src.delable != 'undefined' ? src.delable : tgt.delable
    return tgt
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

  static copy(src: any, tgt?: SelOrIptMapper, force = false): SelOrIptMapper {
    tgt = tgt || new SelOrIptMapper()
    BaseMapper.copy(src, tgt)
    tgt.mode = src.mode || tgt.mode
    tgt.options = src.options || tgt.options
    return tgt
  }
}

export class LstOpnType {
  key: string
  title: string
  subTitle?: string
  avatar?: string
  href?: string

  constructor() {
    this.key = ''
    this.title = ''
    this.subTitle = ''
    this.avatar = ''
    this.href = ''
  }

  reset() {
    this.key = ''
    this.title = ''
    this.subTitle = ''
    this.avatar = ''
    this.href = ''
  }

  static copy(src: any, tgt?: LstOpnType, force = false): LstOpnType {
    tgt = tgt || new LstOpnType()
    tgt.title = src.title || tgt.title
    tgt.key = src.key || tgt.key
    tgt.subTitle = src.subTitle || tgt.subTitle
    tgt.avatar = src.avatar || tgt.avatar
    tgt.href = src.href || tgt.href
    return tgt
  }
}

export class LstSelMapper extends BaseMapper {
  height: number
  options: LstOpnType[]

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

  static copy(src: any, tgt?: LstSelMapper, force = false): LstSelMapper {
    tgt = tgt || new LstSelMapper()
    BaseMapper.copy(src, tgt)
    tgt.height = src.height || tgt.height
    tgt.options = src.options ? src.options.map((opn: any) => LstOpnType.copy(opn)) : tgt.options
    return tgt
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
  mapper: Mapper
  // 数据发生变化后必须触发update:value，重写onSaved也必须注意这一点！
  emitter: Emitter
  copy: (src: any, tgt?: any) => any
  onAdded: () => Promise<void>
  onSaved: (nItem: any, array?: any[]) => void

  constructor() {
    super()
    this.lblProp = ''
    this.lblMapper = {}
    this.inline = true
    this.flatItem = true
    this.mapper = new Mapper()
    this.emitter = new Emitter()
    this.copy = () => undefined
    this.onAdded = () => Promise.resolve()
    this.onSaved = () => Promise.resolve()
  }

  reset() {
    super.reset()
    this.lblProp = ''
    this.lblMapper = {}
    this.inline = true
    this.flatItem = true
    this.mapper = new Mapper({})
    this.emitter = new Emitter()
    this.copy = () => undefined
    this.onAdded = () => Promise.resolve()
    this.onSaved = () => Promise.resolve()
  }

  static copy(src: any, tgt?: EdtLstMapper, force = false): EdtLstMapper {
    tgt = tgt || new EdtLstMapper()
    BaseMapper.copy(src, tgt)
    tgt.lblProp = src.lblProp || tgt.lblProp
    tgt.lblMapper = src.lblMapper || tgt.lblMapper
    tgt.inline = typeof src.inline !== 'undefined' ? src.inline : tgt.inline
    tgt.flatItem = typeof src.flatItem !== 'undefined' ? src.flatItem : tgt.flatItem
    tgt.mapper = src.mapper || tgt.mapper
    tgt.emitter = src.emitter || tgt.emitter
    tgt.copy = src.copy || tgt.copy
    tgt.onAdded = src.onAdded || tgt.onAdded
    tgt.onSaved = src.onSaved || tgt.onSaved
    return tgt
  }
}

export class GroupMapper extends BaseMapper {
  fold: boolean
  items: Mapper

  constructor() {
    super()
    this.fold = false
    this.items = {}
  }

  reset() {
    super.reset()
    this.fold = false
    this.items = {}
  }

  static copy(src: any, tgt?: GroupMapper, force = false): GroupMapper {
    tgt = tgt || new GroupMapper()
    BaseMapper.copy(src, tgt)
    tgt.fold = typeof src.fold !== 'undefined' ? JSON.parse(src.fold) : tgt.fold
    Mapper.copy(src.items, tgt.items)
    return tgt
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

  static copy(src: any, tgt?: CdEdtMapper, force = false): CdEdtMapper {
    tgt = tgt || new CdEdtMapper()
    BaseMapper.copy(src, tgt)
    tgt.lang = src.lang || tgt.lang
    return tgt
  }
}

export class UploadMapper extends BaseMapper {
  path: string
  headers: Record<string, any>
  onBeforeUpload: (file: any, fileList: any[]) => boolean | Promise<any>

  constructor() {
    super()
    this.path = ''
    this.headers = {}
    this.onBeforeUpload = () => true
  }

  reset() {
    super.reset()
    this.path = ''
    this.headers = {}
    this.onBeforeUpload = () => true
  }

  static copy(src: any, tgt?: UploadMapper, force = false): UploadMapper {
    tgt = tgt || new UploadMapper()
    BaseMapper.copy(src, tgt)
    tgt.path = src.path || tgt.path
    tgt.headers = src.headers || tgt.headers
    tgt.onBeforeUpload = src.onBeforeUpload || tgt.onBeforeUpload
    return tgt
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

  static copy(src: any, tgt?: RadioMapper, force = false): RadioMapper {
    tgt = tgt || new RadioMapper()
    SelectMapper.copy(src, tgt)
    tgt.style = src.style || tgt.style
    return tgt
  }
}

const EleTypeCopies = {
  Unknown: BaseMapper.copy,
  Input: InputMapper.copy,
  Number: InputMapper.copy,
  Password: InputMapper.copy,
  Textarea: TextareaMapper.copy,
  Select: SelectMapper.copy,
  Cascader: SelectMapper.copy,
  Checkbox: CheckboxMapper.copy,
  Radio: RadioMapper.copy,
  Switch: CheckboxMapper.copy,
  Button: ButtonMapper.copy,
  Table: TableMapper.copy,
  Text: BaseMapper.copy,
  Delable: TableMapper.copy,
  SelOrIpt: SelOrIptMapper.copy,
  UploadFile: UploadMapper.copy,
  DateTime: BaseMapper.copy,
  TagList: EdtLstMapper.copy,
  ListSelect: LstSelMapper.copy,
  CodeEditor: CdEdtMapper.copy,
  EditList: EdtLstMapper.copy,
  FormGroup: GroupMapper.copy
} as { [elType: string]: (src: any, tgt?: any, force?: boolean) => any }

export type MapperType = BaseMapper & Record<string, any>

export function getCopy(mt: any, tgt?: any): MapperType {
  return EleTypeCopies[mt.type](mt, tgt)
}
export default class Mapper {
  [prop: string]: MapperType

  constructor(init?: any) {
    if (init) {
      for (const [key, val] of Object.entries(init)) {
        const value = val as BaseMapper
        if (!value.type) {
          value.type = 'Unknown'
        }
        this[key] = EleTypeCopies[value.type](value, undefined, true)
      }
    }
  }

  static copy(src: any, tgt?: Mapper, force = false): Mapper {
    tgt = tgt || new Mapper()
    if (force) {
      const srcKeys = Object.keys(src)
      for (const key of Object.keys(tgt)) {
        if (!srcKeys.includes(key)) {
          delete tgt[key]
        }
      }
    }
    for (const [key, val] of Object.entries(src)) {
      const value = val as BaseMapper
      const type =
        value.type && value.type !== 'Unknown'
          ? value.type
          : tgt && tgt[key] && tgt[key].type && tgt[key].type !== 'Unknown'
          ? tgt[key].type
          : undefined
      if (!type) {
        continue
      }
      const cpyFun = EleTypeCopies[type]
      if (tgt[key]) {
        cpyFun(value, tgt[key], force)
      } else {
        tgt[key] = cpyFun(value)
      }
    }
    return tgt
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
        data[group] = GroupMapper.copy({
          label: grpLabel,
          type: 'FormGroup',
          items: {
            [field.refer]: upMpItm
          }
        })
      }
    }
  }
  return new Mapper(data)
}
