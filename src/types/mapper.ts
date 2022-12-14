/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CompoType, Cond, OpnType } from '.'
import Column from './column'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import Field from './field'
import dayjs from 'dayjs'

export class BaseMapper {
  label: string
  desc: string
  type: CompoType
  rules: any[]
  placeholder: string
  disabled: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  loading: boolean
  display: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  expanded: boolean
  reset: boolean
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
    this.expanded = false
    this.reset = true
    this.empty = false
    this.onChange = () => undefined
  }

  static copy(src: any, tgt?: BaseMapper): BaseMapper {
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
    tgt.expanded = typeof src.expanded !== 'undefined' ? src.expanded : tgt.expanded
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

  static copy(src: any, tgt?: InputMapper): InputMapper {
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

  static copy(src: any, tgt?: TextareaMapper): TextareaMapper {
    tgt = tgt || new TextareaMapper()
    BaseMapper.copy(src, tgt)
    tgt.maxRows = src.maxRows || tgt.maxRows
    tgt.onBlur = src.onBlur || tgt.onBlur
    return tgt
  }
}

export class SelectMapper extends BaseMapper {
  loading: boolean
  options: string[] | OpnType[]
  onDropdown: (open: boolean) => void

  constructor() {
    super()
    this.loading = false
    this.options = []
    this.onDropdown = () => undefined
  }

  static copy(src: any, tgt?: SelectMapper): SelectMapper {
    tgt = tgt || new SelectMapper()
    BaseMapper.copy(src, tgt)
    tgt.loading = typeof src.loading !== 'undefined' ? src.loading : tgt.loading
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
  // 0???false???1???true
  chkLabels: [string, string]

  constructor() {
    super()
    this.chkLabels = ['???', '???']
  }

  static copy(src: any, tgt?: CheckboxMapper): CheckboxMapper {
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

  static copy(src: any, tgt?: ButtonMapper): ButtonMapper {
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
  show: boolean
  mapper: Mapper
  columns: Column[]
  emitter: Emitter
  copy: (one: any) => any
  onEdit: (record: any) => void
  onSaved: (record: any, extra?: any) => void
  onDeleted: (key: any, extra?: any) => void
  addable: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  edtable: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  delable: boolean | Cond[] | { [cmpRel: string]: Cond[] }

  constructor() {
    super()
    this.show = false
    this.mapper = new Mapper()
    this.columns = []
    this.emitter = new Emitter()
    this.copy = () => undefined
    this.onEdit = () => undefined
    this.onSaved = () => undefined
    this.onDeleted = () => undefined
    this.addable = true
    this.edtable = true
    this.delable = true
  }

  static copy(src: any, tgt?: TableMapper): TableMapper {
    tgt = tgt || new TableMapper()
    BaseMapper.copy(src, tgt)
    tgt.show = src.show || tgt.show
    tgt.mapper = src.mapper ? Mapper.copy(src.mapper, tgt.mapper) : tgt.mapper
    tgt.columns = src.columns || tgt.columns
    tgt.emitter = src.emitter || tgt.emitter
    tgt.copy = src.copy || tgt.copy
    tgt.onEdit = src.onEdit || tgt.onEdit
    tgt.onSaved = src.onSaved || tgt.onSaved
    tgt.onDeleted = src.onDeleted || tgt.onDeleted
    tgt.addable = typeof src.addable != 'undefined' ? src.addable : tgt.addable
    tgt.edtable = typeof src.edtable != 'undefined' ? src.edtable : tgt.edtable
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

  static copy(src: any, tgt?: SelOrIptMapper): SelOrIptMapper {
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
  }

  static copy(src: any, tgt?: LstOpnType): LstOpnType {
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

  static copy(src: any, tgt?: LstSelMapper): LstSelMapper {
    tgt = tgt || new LstSelMapper()
    BaseMapper.copy(src, tgt)
    tgt.height = src.height || tgt.height
    tgt.options = src.options ? src.options.map((opn: any) => LstOpnType.copy(opn)) : tgt.options
    return tgt
  }
}

export class EdtLstMapper extends BaseMapper {
  lblProp: string
  lblMapper: Record<any, string>
  inline: boolean
  flatItem: boolean // ??????????????????????????????[{ key: 'abc' }] => ['abc']?????????????????????????????????????????????
  mapper: Mapper
  emitter: Emitter
  copy: (src: any, tgt?: any) => any

  constructor() {
    super()
    this.lblProp = ''
    this.lblMapper = {}
    this.inline = true
    this.flatItem = true
    this.mapper = new Mapper({
      value: {
        type: 'Input',
        placeholder: '?????????'
      }
    })
    this.emitter = new Emitter()
    this.copy = (src: any, tgt?: { value: any }) => {
      tgt = tgt || { value: '' }
      tgt.value = src.value || tgt.value
      return tgt
    }
  }

  static copy(src: any, tgt?: EdtLstMapper): EdtLstMapper {
    tgt = tgt || new EdtLstMapper()
    BaseMapper.copy(src, tgt)
    tgt.lblProp = src.lblProp || tgt.lblProp
    tgt.lblMapper = src.lblMapper || tgt.lblMapper
    tgt.inline = typeof src.inline !== 'undefined' ? src.inline : tgt.inline
    tgt.flatItem = typeof src.flatItem !== 'undefined' ? src.flatItem : tgt.flatItem
    tgt.mapper = src.mapper || tgt.mapper
    tgt.emitter = src.emitter || tgt.emitter
    tgt.copy = src.copy || tgt.copy
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

  static copy(src: any, tgt?: GroupMapper): GroupMapper {
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

  static copy(src: any, tgt?: CdEdtMapper): CdEdtMapper {
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

  static copy(src: any, tgt?: UploadMapper): UploadMapper {
    tgt = tgt || new UploadMapper()
    BaseMapper.copy(src, tgt)
    tgt.path = src.path || tgt.path
    tgt.headers = src.headers || tgt.headers
    tgt.onBeforeUpload = src.onBeforeUpload || tgt.onBeforeUpload
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
} as { [elType: string]: (src: any, tgt?: any) => any }

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
        this[key] = EleTypeCopies[value.type](value)
      }
    }
  }

  static copy(src: any, tgt?: Mapper): Mapper {
    tgt = tgt || new Mapper()
    for (const [key, val] of Object.entries(src)) {
      const value = val as BaseMapper
      if (!value.type) {
        value.type = 'Unknown'
      }
      tgt[key] = EleTypeCopies[value.type](value)
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
    Object.fromEntries(
      Object.entries(field.extra || {}).map(([key, val]) => [key, adjExtra(val)])
    )
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
      let grpLabel = group + '???'
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
