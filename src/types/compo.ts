/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CompoType } from '.'
import Field from './field'
export default class Compo {
  key: string
  name: string
  ctype: CompoType // 绑定类型
  category: string
  props: Field[]
  inner: string

  constructor() {
    this.key = ''
    this.name = ''
    this.ctype = 'Unknown'
    this.category = ''
    this.props = []
    this.inner = ''
  }

  reset() {
    this.key = ''
    this.name = ''
    this.ctype = 'Unknown'
    this.category = ''
    this.props = []
    this.inner = ''
  }

  static copy(src: any, tgt?: Compo, force = false): Compo {
    tgt = tgt || new Compo()
    tgt.key = force ? (src.key || src._id) : (src.key || src._id || tgt.key)
    tgt.name = force ? src.name : src.name || tgt.name
    tgt.ctype = force ? src.ctype : src.ctype || tgt.ctype
    tgt.category = force ? src.category : src.category || tgt.category
    if (src.props) {
      tgt.props = src.props.map((field: any) => Field.copy(field))
    } else if (force) {
      tgt.props = []
    }
    tgt.inner = force ? src.inner : src.inner || tgt.inner
    return tgt
  }
}
