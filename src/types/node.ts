import { gnlCpy } from '../utils'
import * as antdIcon from '@ant-design/icons-vue'

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
  }
  title: string
  desc: string
  icon: keyof typeof antdIcon
  color: string
  addMode: 'insert' | 'append'
  previous: string[]
  nexts: string[]
  display: boolean
  addable: boolean
  delable: boolean
  circle?: {
    node: string
    start: boolean
    side: 'left' | 'right'
  }

  constructor() {
    this.key = ''
    this.rect = genNewRect()
    this.title = ''
    this.desc = ''
    this.icon = 'NumberOutlined'
    this.color = '#1677ff'
    this.addMode = 'insert'
    this.previous = []
    this.nexts = []
    this.display = true
    this.addable = true
    this.delable = true
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
    this.title = ''
    this.desc = ''
    this.icon = 'NumberOutlined'
    this.color = '#1677ff'
    this.addMode = 'insert'
    this.previous = []
    this.nexts = []
    this.display = true
    this.addable = true
    this.delable = true
    this.circle = undefined
  }

  static copy(src: any, tgt?: Node, force = false) {
    return gnlCpy(Node, src, tgt, { force })
  }
}

export function genNewRect() {
  return {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    r: 0,
    b: 0,
    cx: 0,
    cy: 0
  }
}