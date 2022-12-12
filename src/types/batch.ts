import { WorkSheet } from 'xlsx'

export default class Batch {
  file: string[]
  uploading: boolean
  worksheet: WorkSheet | null
  hdRowNo: number
  dtRowNo: number

  constructor() {
    this.file = []
    this.uploading = false
    this.worksheet = null
    this.hdRowNo = 1
    this.dtRowNo = 2
  }

  reset() {
    this.file = []
    this.uploading = false
    this.worksheet = null
    this.hdRowNo = 1
    this.dtRowNo = 2
  }

  static copy(src: any, tgt?: Batch, force = false): Batch {
    tgt = tgt || new Batch()
    tgt.file = force ? src.file : src.file || tgt.file
    tgt.hdRowNo = force ? src.hdRowNo : src.hdRowNo || tgt.hdRowNo
    tgt.dtRowNo = force ? src.dtRowNo : src.dtRowNo || tgt.dtRowNo
    return tgt
  }
}
