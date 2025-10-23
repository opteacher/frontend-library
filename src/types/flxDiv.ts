import { gnlCpy } from "../utils"
import { TinyEmitter } from "tiny-emitter"

export default class FlxDiv {
  orientation: 'horizontal' | 'vertical'
  widHgt: number
  visible: boolean
  emitter: TinyEmitter
  ctrlSide: 'leftTop' | 'rightBottom'
  hideBtn: boolean
  hbtnPos: {
    left?: number | string
    top?: number | string
    right?: number | string
    bottom?: number | string
  }
  hbtnTxt: string
  
  constructor() {
    this.orientation = 'vertical'
    this.widHgt = 200
    this.visible = true
    this.emitter = new TinyEmitter()
    this.ctrlSide = 'rightBottom'
    this.hideBtn = false
    this.hbtnPos = { bottom: 10 }
    this.hbtnTxt = ''
  }

  reset() {
    this.widHgt = 200
    this.visible = true
    this.emitter = new TinyEmitter()
    this.ctrlSide = 'rightBottom'
    this.hideBtn = false
    this.hbtnPos.left = undefined
    this.hbtnPos.top = undefined
    this.hbtnPos.right = undefined
    this.hbtnPos.bottom = undefined
  }

  static copy(src: any, tgt?: FlxDiv, force = false) {
    tgt = gnlCpy(FlxDiv, src, tgt, { force, ignProps: ['emitter'] })
    tgt.emitter = new TinyEmitter()
    return tgt
  }
}