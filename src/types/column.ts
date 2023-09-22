/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export default class Column {
  title: string
  dataIndex: string
  group: string[]
  key: string
  width?: number
  align: 'left' | 'right' | 'center'
  sorter: ((a: any, b: any) => number) | undefined
  defaultSortOrder: string
  notDisplay: boolean
  resizable: boolean
  filterable: boolean
  fixed?: 'left' | 'right'
  searchable: boolean
  customFilterDropdown: boolean
  dict: any
  onFilter?: (value: string, record: any) => boolean
  custCell: any
  custHdCell: any
  children: Column[]

  constructor(
    title: string,
    dataIdx: string,
    options?: {
      key?: string
      group?: string[]
      width?: number
      align?: 'left' | 'right' | 'center'
      sortable?: boolean
      defaultSort?: string
      searchable?: boolean
      filterable?: boolean
      notDisplay?: boolean
      resizable?: boolean
      fixed?: 'left' | 'right'
      dict?: Record<string, any>
      filter?: (value: string, record: any) => boolean
      custCell?: any
      custHdCell?: any
      children?: Column[]
    }
  ) {
    this.title = title
    this.dataIndex = dataIdx
    this.searchable = false
    if (options) {
      this.group = options.group ? options.group : []
      this.key = options.key ? options.key : dataIdx
      if (options.width) {
        this.width = options.width
      }
      this.align = options.align || 'left'
      this.sorter = options.sortable ? (a: any, b: any) => a[dataIdx] - b[dataIdx] : undefined
      this.defaultSortOrder = typeof options.defaultSort !== 'undefined' ? options.defaultSort : ''
      this.notDisplay = typeof options.notDisplay !== 'undefined' ? options.notDisplay : false
      this.resizable = typeof options.resizable !== 'undefined' ? options.resizable : false
      this.filterable = typeof options.filterable !== 'undefined' ? options.filterable : false
      this.fixed = options.fixed ? options.fixed : undefined
      this.searchable = options.searchable as boolean
      this.dict = options.dict ? options.dict : {}
      this.onFilter = options.filter ? options.filter : undefined
      this.custCell = options?.custCell
      this.custHdCell = options?.custHdCell
      this.children =
        options.children && options.children.length
          ? options.children.map(col => Column.copy(col))
          : []
    } else {
      this.group = []
      this.key = dataIdx
      this.align = 'left'
      this.defaultSortOrder = ''
      this.notDisplay = false
      this.resizable = false
      this.filterable = false
      this.dict = {}
      this.children = []
    }
    this.customFilterDropdown = this.searchable
  }

  reset() {
    this.title = ''
    this.dataIndex = ''
    this.group = []
    this.key = ''
    this.width = 0
    this.align = 'left'
    this.sorter = undefined
    this.defaultSortOrder = ''
    this.notDisplay = false
    this.resizable = false
    this.filterable = false
    this.fixed = undefined
    this.searchable = false
    this.customFilterDropdown = false
    this.dict = {}
    this.onFilter = undefined
    this.custCell = undefined
    this.custHdCell = undefined
    this.children = []
  }

  static copy(src: any, tgt?: Column): Column {
    tgt = tgt || new Column('', '')
    tgt.key = src.key || src.dataIndex || tgt.key
    tgt.title = src.title || tgt.title
    tgt.dataIndex = src.dataIndex || tgt.dataIndex
    tgt.group = src.group || tgt.group
    tgt.width = src.width || tgt.width
    tgt.align = src.align || tgt.align
    tgt.sorter =
      typeof src.sorter !== 'undefined'
        ? src.sorter
        : src.sortable
        ? (a: any, b: any) => (tgt ? a[tgt.dataIndex as string] - b[tgt.dataIndex as string] : 1)
        : undefined
    tgt.defaultSortOrder =
      typeof src.defaultSortOrder !== 'undefined'
        ? src.defaultSortOrder
        : typeof src.defaultSort !== 'undefined'
        ? src.defaultSort
        : ''
    tgt.notDisplay = typeof src.notDisplay !== 'undefined' ? src.notDisplay : tgt.notDisplay
    tgt.resizable = typeof src.resizable !== 'undefined' ? src.resizable : tgt.resizable
    tgt.filterable = typeof src.filterable !== 'undefined' ? src.filterable : tgt.filterable
    tgt.fixed = src.fixed || tgt.fixed
    tgt.searchable = typeof src.searchable !== 'undefined' ? src.searchable : tgt.searchable
    tgt.customFilterDropdown =
      src.customFilterDropdown || src.searchable || tgt.customFilterDropdown
    tgt.dict = src.dict || tgt.dict
    tgt.onFilter = src.filter || src.onFilter || tgt.onFilter
    tgt.custCell = src.custCell || tgt.custCell
    tgt.custHdCell = src.custHdCell || tgt.custHdCell
    tgt.children.splice(
      0,
      tgt.children.length,
      ...(src.children || []).map((col: any) => Column.copy(col))
    )
    return tgt
  }
}
