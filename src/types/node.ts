import { gnlCpy } from "../utils"

export default class Node {
  key: string
  rect: {
    x: number
    y: number
    w: number
    h: number
    r: number
    b: number
    cx: number
    cy: number
    sxy: number
    swh: number
  }
  title: string
  desc: string
  color: string
  addMode: 'insert' | 'append'
  previous: string[]
  nexts: string[]
  relative: string

  constructor() {
    this.key = ''
    this.rect = {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      r: 0,
      b: 0,
      cx: 0,
      cy: 0,
      sxy: 0,
      swh: 0
    }
    this.title = ''
    this.desc = ''
    this.color = '#1677ff'
    this.addMode = 'insert'
    this.previous = []
    this.nexts = []
    this.relative = ''
  }

  reset() {
    this.key = ''
    this.rect.x = 0
    this.rect.y = 0
    this.rect.w = 0
    this.rect.h = 0
    this.rect.r = 0
    this.rect.b = 0
    this.rect.cx = 0
    this.rect.cy = 0
    this.rect.sxy = 0
    this.rect.swh = 0
    this.title = ''
    this.desc = ''
    this.color = '#1677ff'
    this.addMode = 'insert'
    this.previous = []
    this.nexts = []
    this.relative = ''
  }

  static copy(src: any, tgt?: Node, force = false) {
    return gnlCpy(Node, src, tgt, { force })
  }
}