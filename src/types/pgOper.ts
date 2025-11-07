import {
  ColumnHeightOutlined,
  DownloadOutlined,
  EditOutlined,
  SelectOutlined
} from '@ant-design/icons-vue'
import { gnlCpy } from '../utils'
import PageEle from './pageEle'

export const otypes = {
  input: { label: '输入', color: 'blue', icon: EditOutlined },
  select: { label: '选择', color: 'orange', icon: SelectOutlined },
  click: { label: '点击', color: 'green', icon: DownloadOutlined },
  scroll: { label: '滚动', color: 'pink', icon: ColumnHeightOutlined },
  pick: { label: '提取', color: 'purple', icon: SelectOutlined }
}

export default class PgOper {
  element: PageEle
  otype: keyof typeof otypes
  value: string
  encrypt: boolean
  timeout: number

  constructor() {
    this.element = new PageEle()
    this.otype = 'click'
    this.value = ''
    this.encrypt = false
    this.timeout = 0
  }

  reset() {
    this.element.reset()
    this.otype = 'click'
    this.value = ''
    this.encrypt = false
    this.timeout = 0
  }
  
  static copy(src: any, tgt?: PgOper, force = false) {
    return gnlCpy(PgOper, src, tgt, { force, cpyMapper: { element: PageEle.copy } })
  }
}