import { gnlCpy } from '../utils'
import PageEle from './pageEle'

export const otypes = {
  input: '输入',
  select: '选择',
  click: '点击',
  scroll: '滚动'
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