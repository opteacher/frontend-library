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
    tgt = tgt || new Cell()
    tgt.color = force ? src.color : src.color || tgt.color
    tgt.prefix = force ? src.prefix : src.prefix || tgt.prefix
    tgt.suffix = force ? src.suffix : src.suffix || tgt.suffix
    tgt.ctype = force ? src.ctype : src.ctype || tgt.ctype
    tgt.format = force ? src.format : src.format || tgt.format
    tgt.refer = force ? src.refer : src.refer || tgt.refer
    return tgt
  }
}

export class Cells extends Cell {
  refer: string
  selCond: string
  cdCell: Record<string, Cell>

  constructor() {
    super()
    this.refer = ''
    this.selCond = ''
    this.cdCell = {}
  }

  reset() {
    super.reset()
    this.refer = ''
    this.selCond = ''
    this.cdCell = {}
  }

  static copy(src: any, tgt?: Cells, force = false): Cells {
    tgt = tgt || new Cells()
    Cell.copy(src, tgt, force)
    tgt.refer = force ? src.refer : src.refer || tgt.refer
    tgt.selCond = force ? src.selCond : src.selCond || tgt.selCond
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
