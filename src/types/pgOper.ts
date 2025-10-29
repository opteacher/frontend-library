import { gnlCpy } from '../utils'
import PageEle from './pageEle'

export const otypes = {
  input: { label: '输入', color: 'blue' },
  select: { label: '选择', color: 'orange' },
  click: { label: '点击', color: 'green' },
  scroll: { label: '滚动', color: 'pink' }
}

export default class PgOper {
  element: PageEle
  otype: keyof typeof otypes
  value: string
  encrypt: boolean

  constructor() {
    this.element = new PageEle()
    this.otype = 'click'
    this.value = ''
    this.encrypt = false
  }

  reset() {
    this.element.reset()
    this.otype = 'click'
    this.value = ''
    this.encrypt = false
  }
  
  static copy(src: any, tgt?: PgOper, force = false) {
    return gnlCpy(PgOper, src, tgt, { force, cpyMapper: { element: PageEle.copy } })
  }
}