import { gnlCpy } from '@/utils'
import Batch from './batch'

export type CmpTyp = '=' | '!=' | '>' | '<' | '>=' | '<='

export default class BchEpt extends Batch {
  filterCols: string[]
  ttlMap: Record<string, string>

  constructor() {
    super()
    this.filterCols = []
    this.ttlMap = {}
  }

  reset() {
    super.reset()
    this.filterCols = []
    this.ttlMap = {}
  }

  static copy(src: any, tgt?: BchEpt, force = false): BchEpt {
    return gnlCpy(BchEpt, src, tgt, { force, baseCpy: Batch.copy })
  }
}
