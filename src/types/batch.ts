import { gnlCpy } from '../utils'
import { type WorkSheet } from 'xlsx'

export default class Batch {
  file: string[]
  uploading: boolean
  worksheet: WorkSheet | null
  hdRowNo: number
  totalNum: number
  dtRowNo: number
  mapper: Record<string, string>

  constructor() {
    this.file = []
    this.uploading = false
    this.worksheet = null
    this.hdRowNo = 0
    this.totalNum = 0
    this.dtRowNo = 1
    this.mapper = {}
  }

  reset() {
    this.file = []
    this.uploading = false
    this.worksheet = null
    this.hdRowNo = 0
    this.totalNum = 0
    this.dtRowNo = 1
    this.mapper = {}
  }

  static copy(src: any, tgt?: Batch, force = false): Batch {
    tgt = gnlCpy(Batch, src, tgt, { force, ignProps: ['worksheet'] })
    if (src.worksheet) {
      tgt.worksheet = src.worksheet
    } else if (force) {
      tgt.worksheet = null
    }
    return tgt
  }
}
