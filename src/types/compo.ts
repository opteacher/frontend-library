/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Field from './field'
export default class Compo {
  key: string
  name: string
  ctype: string // 绑定类型
  category: string
  props: Field[]

  constructor() {
    this.key = ''
    this.name = ''
    this.ctype = 'Unknown'
    this.category = ''
    this.props = []
  }

  reset() {
    this.key = ''
    this.name = ''
    this.ctype = 'Unknown'
    this.category = ''
    this.props = []
  }

  static copy(src: any, tgt?: Compo): Compo {
    tgt = tgt || new Compo()
    tgt.key = src.key || src._id || tgt.key
    tgt.name = src.name || tgt.name
    tgt.ctype = src.ctype || tgt.ctype
    tgt.category = src.category || tgt.category
    tgt.props = src.props ? src.props.map((field: any) => Field.copy(field)) : tgt.props
    return tgt
  }
}
