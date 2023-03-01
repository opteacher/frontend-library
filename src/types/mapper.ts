/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CompoType, Cond, OpnType } from '.'
import Column from './column'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import Field from './field'
import { gnlCpy } from '../utils'

export class BaseMapper {
  label: string
  desc: string
  type: CompoType
  rules: any[]
  placeholder: string
  disabled: boolean | Cond[] | { [cmpRel: string]: Cond[] }
  loading: boolean
  display: boolean | Cond[] | { [cmpRel: string]: Cond[] }
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
    this.reset = true
    this.empty = false
    this.onChange = () => undefined
  }

  static copy(src: any, tgt?: BaseMapper, force = false): BaseMapper {
    tgt = gnlCpy(BaseMapper, src, tgt, { force, ignProps: ['disabled', 'display'] })
    if (src.disabled instanceof Array) {
      tgt.disabled = src.disabled.map((el: any) => Cond.copy(el))
    } else if (typeof src.disabled !== 'undefined') {
      tgt.disabled = src.disabled
    } else if (force) {
      tgt.disabled = false
    }
    if (src.display instanceof Array) {
      tgt.display = src.display.map((el: any) => Cond.copy(el))
    } else if (typeof src.display !== 'undefined') {
      tgt.display = src.display
    } else if (force) {
      tgt.display = false
    }
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

  static copy(src: any, tgt?: InputMapper, force = false): InputMapper {
    return gnlCpy(InputMapper, src, tgt, { force, baseCpy: BaseMapper.copy })
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

  static copy(src: any, tgt?: TextareaMapper, force = false): TextareaMapper {
    return gnlCpy(TextareaMapper, src, tgt, { force, baseCpy: BaseMapper.copy })
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

  static copy(src: any, tgt?: SelectMapper, force = false): SelectMapper {
    tgt = gnlCpy(SelectMapper, src, tgt, {
      force, ignProps: ['options'], baseCpy: BaseMapper.copy
    })
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
      : (force ? [] : tgt.options)
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

  static copy(src: any, tgt?: CheckboxMapper, force = false): CheckboxMapper {
    return gnlCpy(CheckboxMapper, src, tgt, { force, baseCpy: BaseMapper.copy })
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

  static copy(src: any, tgt?: ButtonMapper, force = false): ButtonMapper {
    return gnlCpy(ButtonMapper, src, tgt, { force, baseCpy: BaseMapper.copy })
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
    this.onSaved = () => undefined
    this.onDeleted = () => undefined
    this.addable = true
    this.editable = true
    this.delable = true
  }

  static copy(src: any, tgt?: TableMapper, force = false): TableMapper {
    return gnlCpy(TableMapper, src, tgt, {
      force,
      cpyMapper: { mapper: Mapper.copy },
      baseCpy: BaseMapper.copy
    })
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

  static copy(src: any, tgt?: SelOrIptMapper, force = false): SelOrIptMapper {
    return gnlCpy(SelOrIptMapper, src, tgt, { force, baseCpy: BaseMapper.copy })
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

  static copy(src: any, tgt?: LstOpnType, force = false): LstOpnType {
    return gnlCpy(LstOpnType, src, tgt, { force })
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

  static copy(src: any, tgt?: LstSelMapper, force = false): LstSelMapper {
    return gnlCpy(LstSelMapper, src, tgt, {
      force,
      baseCpy: BaseMapper.copy,
      cpyMapper: { options: LstOpnType.copy }
    })
  }
}

export class EdtLstMapper extends BaseMapper {
  lblProp: string
  lblMapper: Record<any, string>
  inline: boolean
  flatItem: boolean // 抹平单元素表单列表：[{ key: 'abc' }] => ['abc']，（注意：会抹去元素的键信息）
  mapper: Mapper
  emitter: Emitter
  copy: (src: any, tgt?: any) => any
  onSaved: (record: any) => void

  constructor() {
    super()
    this.lblProp = ''
    this.lblMapper = {}
    this.inline = true
    this.flatItem = true
    this.mapper = new Mapper({
      value: {
        type: 'Input',
        placeholder: '请输入'
      }
    })
    this.emitter = new Emitter()
    this.copy = (src: any, tgt?: { value: any }) => {
      tgt = tgt || { value: '' }
      tgt.value = src.value || tgt.value
      return tgt
    }
    this.onSaved = () => {
      this.emitter.emit('update:show', { show: false })
    }
  }

  static copy(src: any, tgt?: EdtLstMapper, force = false): EdtLstMapper {
    return gnlCpy(EdtLstMapper, src, tgt, {
      force,
      baseCpy: BaseMapper.copy,
      cpyMapper: {
        options: LstOpnType.copy
      }
    })
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

  static copy(src: any, tgt?: GroupMapper, force = false): GroupMapper {
    tgt = gnlCpy(GroupMapper, src, tgt, {
      force,
      baseCpy: BaseMapper.copy,
      ignProps: ['items'],
      cpyMapper: { options: LstOpnType.copy }
    })
    Mapper.copy(src.items, tgt.items, force)
    return tgt
  }
}

export class CdEdtMapper extends BaseMapper {
  lang: 'javascript' | 'json'

  constructor() {
    super()
    this.lang = 'javascript'
  }

  static copy(src: any, tgt?: CdEdtMapper, force = false): CdEdtMapper {
    return gnlCpy(CdEdtMapper, src, tgt, { force, baseCpy: BaseMapper.copy })
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

  static copy(src: any, tgt?: UploadMapper, force = false): UploadMapper {
    return gnlCpy(UploadMapper, src, tgt, { force, baseCpy: BaseMapper.copy })
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
        this[key] = EleTypeCopies[value.type](value)
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
      const type = value.type && value.type !== 'Unknown' ? value.type : (
        tgt && tgt[key] && tgt[key].type && tgt[key].type !== 'Unknown' ? tgt[key].type : undefined
      )
      if (!type) {
        continue
      }
      tgt[key] = EleTypeCopies[type](value, tgt[key], force)
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
