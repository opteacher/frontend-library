import { gnlCpy } from "../utils"

export default class PageEle {
  xpath: string
  clazz: string
  tagName: string
  rectBox: {
    x: number
    y: number
    width: number
    height: number
  }

  constructor() {
    this.xpath = ''
    this.clazz = ''
    this.tagName = ''
    this.rectBox = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  }

  reset() {
    this.xpath = ''
    this.clazz = ''
    this.tagName = ''
    this.rectBox.x = 0
    this.rectBox.y = 0
    this.rectBox.width = 0
    this.rectBox.height = 0
  }

  static copy(src: any, tgt?: PageEle, force = false) {
    return gnlCpy(PageEle, src, tgt, { force })
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