import { gnlCpy } from '../utils'

export default class Cell {
  color: string
  prefix: string
  suffix: string
  ctype: string
  format: any
  refer: string

  constructor() {
    this.color = '#000000'
    this.prefix = ''
    this.suffix = ''
    this.ctype = ''
    this.format = null
    this.refer = ''
  }

  reset() {
    this.color = '#000000'
    this.prefix = ''
    this.suffix = ''
    this.ctype = ''
    this.format = null
    this.refer = ''
  }

  static copy(src: any, tgt?: Cell, force = false): Cell {
    return gnlCpy(Cell, src, tgt, { force })
  }
}

export class Cells extends Cell {
  refer: string
  selCond: string
  cdCell: Record<string, Cell> | null

  constructor() {
    super()
    this.refer = ''
    this.selCond = ''
    this.cdCell = null
  }

  reset() {
    super.reset()
    this.refer = ''
    this.selCond = ''
    this.cdCell = null
  }

  static copy(src: any, tgt?: Cells, force = false): Cells {
    tgt = gnlCpy(Cells, src, tgt, { force, baseCpy: Cell.copy, ignProps: ['cdCell'] })
    tgt.cdCell = src.cdCell
      ? Object.fromEntries(
          Object.entries(src.cdCell).map(([cond, data]: [string, any]) => [cond, Cell.copy(data)])
        )
      : force
      ? {}
      : tgt.cdCell
    return tgt
  }
}
