import { gnlCpy } from "../utils"

export default class PageEle {
  xpath: string
  idCls: string
  tagName: string
  rectBox: {
    x: number
    y: number
    width: number
    height: number
  }
  idType: 'xpath' | 'idCls' | 'tagName'

  constructor() {
    this.xpath = ''
    this.idCls = ''
    this.tagName = ''
    this.rectBox = PageEle.newRect()
    this.idType = 'xpath'
  }

  reset() {
    this.xpath = ''
    this.idCls = ''
    this.tagName = ''
    this.rectBox.x = 0
    this.rectBox.y = 0
    this.rectBox.width = 0
    this.rectBox.height = 0
    this.idType = 'xpath'
  }

  static copy(src: any, tgt?: PageEle, force = false) {
    return gnlCpy(PageEle, src, tgt, { force })
  }

  static newRect() {
    return ({ x: 0, y: 0, width: 0, height: 0 })
  }

  inRect(x: number, y: number): boolean {
    return (
      x >= this.rectBox.x &&
      y >= this.rectBox.y &&
      x <= this.rectBox.x + this.rectBox.width &&
      y <= this.rectBox.y + this.rectBox.height
    )
  }
}