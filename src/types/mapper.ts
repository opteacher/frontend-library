/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep } from 'lodash'
import { TinyEmitter as Emitter, TinyEmitter } from 'tiny-emitter'

import { type CompoType, Cond, type OpnType } from '.'
import Column from './column'
import Field, { fieldDftVal } from './field'
import { Dayjs } from 'dayjs'
import { type RuleItem } from 'async-validator'
import type { IdType } from './pageEle'
import type PageEle from './pageEle'

export type CondType = boolean | ((...args: any) => boolean) | Cond[] | { [cmpRel: string]: Cond[] }

export class BaseMapper {
  key: string
  label: string
  offset: number
  desc: string
  type?: CompoType
  rules: RuleItem[]
  placeholder: string
  disabled: CondType
  loading: boolean | (() => boolean)
  display: CondType
  empty: boolean
  expable: boolean
  vwOnly: boolean
  onChange: (record: any, to: any, from?: any, extra?: any) => void

  constructor() {
    this.key = ''
    this.label = ''
    this.offset = 0
    this.desc = ''
    this.type = undefined
    this.rules = []
    this.placeholder = ''
    this.disabled = false
    this.loading = false
    this.display = true
    this.empty = false
    this.expable = false
    this.vwOnly = false
    this.onChange = () => undefined
  }

  reset() {
    this.key = ''
    this.label = ''
    this.offset = 0
    this.desc = ''
    this.type = undefined
    this.rules = []
    this.placeholder = ''
    this.disabled = false
    this.loading = false
    this.display = true
    this.empty = false
    this.expable = false
    this.vwOnly = false
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

export class PasswordMapper extends InputMapper {
  visible: boolean

  constructor() {
    super()
    this.visible = true
  }

  reset(): void {
    super.reset()
    this.visible = true
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
  searchable: boolean
  onDropdown: (open: boolean) => void

  constructor() {
    super()
    this.allowClear = false
    this.options = []
    this.searchable = false
    this.onDropdown = () => undefined
  }

  reset() {
    super.reset()
    this.allowClear = false
    this.options = []
    this.searchable = false
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
  icon: string
  danger: boolean
  primary: boolean
  ghost: boolean
  dashed: boolean
  htmlType: 'button' | 'submit' | 'reset'
  fullWid: boolean
  onClick: () => void

  constructor() {
    super()
    this.inner = ''
    this.icon = ''
    this.danger = false
    this.primary = true
    this.ghost = true
    this.dashed = false
    this.htmlType = 'button'
    this.fullWid = true
    this.onClick = () => undefined
  }

  reset() {
    super.reset()
    this.inner = ''
    this.icon = ''
    this.danger = false
    this.primary = true
    this.ghost = true
    this.dashed = false
    this.htmlType = 'button'
    this.fullWid = true
    this.onClick = () => undefined
  }
}

export class ButtonsMapper extends BaseMapper {
  buttons: ButtonMapper[]
  orientation: 'horizontal' | 'vertical'

  constructor() {
    super()
    this.buttons = []
    this.orientation = 'horizontal'
  }

  reset(): void {
    super.reset()
    this.buttons = []
    this.orientation = 'horizontal'
  }
}

export class TableMapper extends BaseMapper {
  width: string | number
  mapper: Mapper
  columns: Column[]
  emitter: Emitter
  newFun: () => any
  genIdFun: (editing: any) => Promise<any>
  onEdit: (record: any) => void
  onSaved: (record: any, extra?: any) => void
  onDeleted: (key: any, extra?: any) => void
  addable: CondType
  edtable: CondType
  delable: CondType

  constructor() {
    super()
    this.width = '40vw'
    this.mapper = new Mapper()
    this.columns = []
    this.emitter = new Emitter()
    this.newFun = () => ({})
    this.genIdFun = () => Promise.resolve()
    this.onEdit = () => undefined
    this.onSaved = () => undefined
    this.onDeleted = () => undefined
    this.addable = true
    this.edtable = true
    this.delable = true
  }

  reset() {
    super.reset()
    this.width = '40vw'
    this.mapper = new Mapper()
    this.columns = []
    this.emitter = new Emitter()
    this.newFun = () => ({})
    this.genIdFun = () => Promise.resolve()
    this.onEdit = () => undefined
    this.onSaved = () => undefined
    this.onDeleted = () => undefined
    this.addable = true
    this.edtable = true
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
  lblDict: Record<any, string>
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
  // 不可删除的项索引
  disRmvIdxs: number[]
  newFun: () => any
  onAddClick: (mapper: EdtLstMapper) => Promise<void>
  onAddSubmit: (newAdd: any) => Promise<void>
  onSaved: (nItem: any, array?: any[]) => Promise<void>

  constructor() {
    super()
    this.lblProp = ''
    this.lblDict = {}
    this.inline = true
    this.flatItem = true
    this.subProp = ''
    this.mapper = new Mapper()
    this.emitter = new Emitter()
    this.disRmvIdxs = []
    this.newFun = () => ({})
    this.onAddClick = () => Promise.resolve()
    this.onAddSubmit = () => Promise.resolve()
    this.onSaved = () => Promise.resolve()
  }

  reset() {
    super.reset()
    this.lblProp = ''
    this.lblDict = {}
    this.inline = true
    this.flatItem = true
    this.subProp = ''
    this.mapper = new Mapper({})
    this.emitter = new Emitter()
    this.disRmvIdxs = []
    this.newFun = () => ({})
    this.onAddClick = () => Promise.resolve()
    this.onAddSubmit = () => Promise.resolve()
    this.onSaved = () => Promise.resolve()
  }
}

export class GroupMapper extends BaseMapper {
  prefix: boolean // 组件组的键值是否作为items下字段的前缀
  /** 演示如下
   * ...
   * testGroup: {
   *   type: 'FormGroup',
   *   label: '测试组',
   *   items: {
   *     name: {
   *       type: 'Input',
   *       label: '名称'
   *     },
   *     abcd: {
   *       type: 'Input',
   *       label: 'ABCD'
   *     }
   * }
   * ---- 对应对象 -----------------
   * {
   *   ...,
   *   testGroup: {
   *     name: '1111',
   *     abcd: '2222'
   *   }
   * }
   */
  canFold: boolean
  fold: boolean
  items: Mapper

  constructor() {
    super()
    this.prefix = false
    this.canFold = true
    this.fold = false
    this.items = new Mapper()
  }

  reset() {
    super.reset()
    this.prefix = false
    this.canFold = true
    this.fold = false
    this.items = new Mapper()
  }
}

export class CdEdtMapper extends BaseMapper {
  lang: 'javascript' | 'json'
  height: number

  constructor() {
    super()
    this.lang = 'javascript'
    this.height = 200
  }

  reset() {
    super.reset()
    this.lang = 'javascript'
    this.height = 200
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

export class DateTimeMapper extends BaseMapper {
  format: string
  showTime: boolean
  hourStep: number
  minuteStep: number
  secondStep: number
  dsbHours: number[]
  dsbDates: (date: Dayjs) => Boolean

  constructor() {
    super()
    this.format = 'YYYY/MM/DD HH:mm:ss'
    this.showTime = true
    this.hourStep = 1
    this.minuteStep = 1
    this.secondStep = 1
    this.dsbHours = []
    this.dsbDates = () => false
  }

  reset() {
    super.reset()
    this.format = 'YYYY/MM/DD HH:mm:ss'
    this.showTime = true
    this.hourStep = 1
    this.minuteStep = 1
    this.secondStep = 1
    this.dsbHours = []
    this.dsbDates = () => false
  }
}

export class JsonEditorMapper extends TextareaMapper {
  mode: 'text' | 'tree' | 'table'
  mainMenuBar: boolean
  navigationBar: boolean
  statusBar: boolean

  constructor() {
    super()
    this.mode = 'text'
    this.mainMenuBar = true
    this.navigationBar = true
    this.statusBar = true
  }
}

export class CpctIptMapper extends BaseMapper {
  placeholders: string[]
  splitLetter: string

  constructor() {
    super()
    this.placeholders = []
    this.splitLetter = '/'
  }

  reset() {
    super.reset()
    this.placeholders = []
    this.splitLetter = '/'
  }
}

export class ColSelMapper extends BaseMapper {
  preset: string[]

  constructor() {
    super()
    this.preset = []
  }

  reset() {
    super.reset()
    this.preset = []
  }
}

export class EleSelMapper extends BaseMapper {
  emitter: TinyEmitter
  selEle?: PageEle
  seledStop: boolean
  onSelEleClear: (prop: string) => void
  onSelEleStart: (prop: string) => void
  onEleIdenChange: (prop: string, key: IdType) => void

  constructor() {
    super()
    this.emitter = new TinyEmitter()
    this.seledStop = true
    this.onSelEleClear = () => undefined
    this.onSelEleStart = () => undefined
    this.onEleIdenChange = () => undefined
  }

  reset() {
    super.reset()
    this.emitter = new TinyEmitter()
    this.selEle = undefined
    this.seledStop = true
    this.onSelEleClear = () => undefined
    this.onSelEleStart = () => undefined
    this.onEleIdenChange = () => undefined
  }
}

export const mapTypeTemps = {
  Unknown: () => new BaseMapper(),
  Input: () => new InputMapper(),
  Number: () => new InputMapper(),
  IpAddress: () => new BaseMapper(),
  CompactInput: () => new CpctIptMapper(),
  Password: () => new PasswordMapper(),
  Textarea: () => new TextareaMapper(),
  Select: () => new SelectMapper(),
  Cascader: () => new SelectMapper(),
  Checkbox: () => new CheckboxMapper(),
  Radio: () => new RadioMapper(),
  Switch: () => new CheckboxMapper(),
  Button: () => new ButtonMapper(),
  Buttons: () => new ButtonsMapper(),
  Table: () => new TableMapper(),
  Text: () => new BaseMapper(),
  Delable: () => new TableMapper(),
  SelOrIpt: () => new SelOrIptMapper(),
  UploadFile: () => new UploadMapper(),
  DateTime: () => new DateTimeMapper(),
  TagList: () => new EdtLstMapper(),
  ListSelect: () => new LstSelMapper(),
  CodeEditor: () => new CdEdtMapper(),
  JsonEditor: () => new JsonEditorMapper(),
  EditList: () => new EdtLstMapper(),
  IconField: () => new BaseMapper(),
  FormGroup: () => new GroupMapper(),
  ColorSelect: () => new ColSelMapper(),
  PageEleSel: () => new EleSelMapper()
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
        // 不复制Emitter对象和Mapper对象
        for (const [k, v] of Object.entries(value)) {
          if (v instanceof Emitter || v instanceof Mapper) {
            this[key][k] = v
          }
        }
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
  return {
    type: field.ftype,
    label: field.label,
    desc: field.desc,
    rules: field.rules,
    display: field.display,
    expable: typeof field.expable !== 'undefined' ? field.expable : undefined,
    placeholder: field.placeholder,
    onChange: field.onChange,
    onBlur: field.onBlur,
    empty: field.empty,
    ...(field.extra ? adjExtra(field.extra) : {})
  } as MapperType
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

export function newObjByMapper(mapper: Mapper) {
  return Object.fromEntries(
    Object.entries(mapper).map(([key, value]) => [key, fieldDftVal(value.type as CompoType)])
  )
}
