/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { gnlCpy } from '@/utils'
import { type CompoType } from '.'
import Field from './field'
export default class Compo {
  key: string
  name: string
  ctype: CompoType // 绑定类型
  category: string
  slot: string
  props: Field[]
  inner: string
  components: Compo[]

  constructor() {
    this.key = ''
    this.name = ''
    this.ctype = 'Unknown'
    this.category = ''
    this.slot = ''
    this.props = []
    this.inner = ''
    this.components = []
  }

  reset() {
    this.key = ''
    this.name = ''
    this.ctype = 'Unknown'
    this.category = ''
    this.slot = ''
    this.props = []
    this.inner = ''
    this.components = []
  }

  static copy(src: any, tgt?: Compo, force = false): Compo {
    return gnlCpy(Compo, src, tgt, {
      force,
      cpyMapper: { props: Field.copy, components: Compo.copy }
    })
  }
}
