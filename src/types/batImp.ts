import { gnlCpy } from '../utils'
import Batch from './batch'

export default class BatImp extends Batch {
  boolMapper: { TRUE: string; FALSE: string }
  dtTmFormat: string

  constructor() {
    super()
    this.boolMapper = { TRUE: '是', FALSE: '否' }
    this.dtTmFormat = 'YYYY-MM-DD HH:mm:ss'
  }

  reset() {
    super.reset()
    this.boolMapper = { TRUE: '是', FALSE: '否' }
    this.dtTmFormat = 'YYYY-MM-DD HH:mm:ss'
  }

  static copy(src: any, tgt?: BatImp, force = false): BatImp {
    return gnlCpy(BatImp, src, tgt, { force, baseCpy: Batch.copy })
  }
}
