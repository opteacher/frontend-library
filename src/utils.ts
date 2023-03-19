import { message } from 'ant-design-vue'
import axios, { AxiosRequestConfig } from 'axios'
import qs from 'qs'
import { Cond } from './types'
import Batch from './types/batch'
import Column from './types/column'

export interface RequestOptions {
  project?: string
  type?: string
  middles?: {
    before?: () => void
    after?: (resp: any) => void
  }
  messages?: {
    notShow?: boolean
    loading?: string
    succeed?: string
    failed?: string
  }
  ignores?: string[]
  axiosConfig?: AxiosRequestConfig<any>
  copy?: (src: any, tgt?: any) => any
  orgRes?: boolean
}

const getDftPjt = () => process.env.VUE_APP_PJT || 'frontend-library'

export async function makeRequest(pms: Promise<any>, options?: RequestOptions): Promise<any> {
  if (!options) {
    options = {}
  }
  if (!options.middles) {
    options.middles = {}
  }
  if (!options.messages) {
    options.messages = {}
  }
  options.middles.before && options.middles.before()
  if (!options.messages.notShow) {
    message.loading(options.messages.loading || '加载中……')
  }
  let resp = await pms
  if (!options.orgRes) {
    resp = resp.data
  }
  if (!options.messages.notShow) {
    message.destroy()
  }
  options.middles.after && options.middles.after(resp)
  let result = resp
  if (options.orgRes) {
    result = resp
  } else if (typeof resp.result !== 'undefined') {
    result = resp.result
  } else if (typeof resp.data !== 'undefined') {
    result = resp.data
  }
  if (resp.error || result.error) {
    if (!options.messages.notShow && options.messages.failed) {
      message.error(options.messages.failed)
    } else {
      message.error(resp.error || result.error)
    }
  } else {
    if (!options.messages.notShow && options.messages.succeed) {
      message.success(options.messages.succeed)
    } else if (result.message) {
      message.success(result.message)
    }
  }
  return Promise.resolve(result)
}

function reqType(options?: RequestOptions): string {
  return options && options.type ? options.type : 'mdl'
}

export async function reqAll(path: string, options?: RequestOptions): Promise<any> {
  if (!options) {
    options = {}
  }
  if (!options.project) {
    options.project = getDftPjt()
  }
  if (typeof options.orgRes === 'undefined') {
    options.orgRes = false
  }
  if (!options.messages) {
    options.messages = {}
  }
  if (!options.messages.loading) {
    options.messages.loading = '查询中……'
  }
  if (!options.messages.succeed) {
    options.messages.succeed = '查询成功！'
  }
  const result = await makeRequest(
    axios.get(
      `/${options.project}/${reqType(options)}/v1/${path}/s`,
      options.axiosConfig && options.axiosConfig.params
        ? Object.assign(options.axiosConfig, {
            paramsSerializer: (params: any) => qs.stringify(params, { indices: false })
          })
        : undefined
    ),
    options
  )
  return result.map((item: any) => (options && options.copy ? options.copy(item) : item))
}

export async function reqGet(path: string, iden?: any, options?: RequestOptions): Promise<any> {
  if (!options) {
    options = {}
  }
  if (!options.project) {
    options.project = getDftPjt()
  }
  if (typeof options.orgRes === 'undefined') {
    options.orgRes = false
  }
  if (!options.messages) {
    options.messages = {}
  }
  if (!options.messages.loading) {
    options.messages.loading = '查询中……'
  }
  if (!options.messages.succeed) {
    options.messages.succeed = '查询成功！'
  }
  const result = await makeRequest(
    axios.get(
      `/${options.project}/${reqType(options)}/v1/${path}${iden ? '/' + iden : ''}`,
      options.axiosConfig && options.axiosConfig.params
        ? Object.assign(options.axiosConfig, {
            paramsSerializer: (params: any) => qs.stringify(params, { indices: false })
          })
        : undefined
    ),
    options
  )
  return options && options.copy ? options.copy(result) : result
}

export function reqPost(path: string, body?: any, options?: RequestOptions): Promise<any> {
  if (!options) {
    options = {}
  }
  if (!options.project) {
    options.project = getDftPjt()
  }
  if (typeof options.orgRes === 'undefined') {
    options.orgRes = false
  }
  if (!options.messages) {
    options.messages = {}
  }
  if (!options.messages.loading) {
    options.messages.loading = '提交中……'
  }
  if (!options.messages.succeed) {
    options.messages.succeed = '提交成功！'
  }
  if (!options.ignores) {
    options.ignores = ['key']
  } else if (!options.ignores.includes('key')) {
    options.ignores.push('key')
  }
  return makeRequest(
    axios.post(
      `/${options.project}/${reqType(options)}/v1/${path}`,
      body ? pickOrIgnore(body, options.ignores) : undefined,
      options.axiosConfig
    ),
    options
  )
}

export function reqDelete(path: string, iden: any, options?: RequestOptions): Promise<any> {
  if (!options) {
    options = {}
  }
  if (!options.project) {
    options.project = getDftPjt()
  }
  if (typeof options.orgRes === 'undefined') {
    options.orgRes = false
  }
  if (!options.messages) {
    options.messages = {}
  }
  if (!options.messages.loading) {
    options.messages.loading = '删除中……'
  }
  if (!options.messages.succeed) {
    options.messages.succeed = '删除成功！'
  }
  return makeRequest(
    axios.delete(
      `/${options.project}/${reqType(options)}/v1/${path}/${iden}`,
      options.axiosConfig && options.axiosConfig.params
        ? Object.assign(options.axiosConfig, {
            paramsSerializer: (params: any) => qs.stringify(params, { indices: false })
          })
        : undefined
    ),
    options
  )
}

export function reqPut(
  path: string,
  iden: any,
  body?: any,
  options?: RequestOptions
): Promise<any> {
  if (!options) {
    options = {}
  }
  if (!options.project) {
    options.project = getDftPjt()
  }
  if (typeof options.orgRes === 'undefined') {
    options.orgRes = false
  }
  if (!options.messages) {
    options.messages = {}
  }
  if (!options.messages.loading) {
    options.messages.loading = '提交中……'
  }
  if (!options.messages.succeed) {
    options.messages.succeed = '提交成功！'
  }
  if (!options.ignores) {
    options.ignores = ['key']
  } else if (!options.ignores.includes('key')) {
    options.ignores.push('key')
  }
  return makeRequest(
    axios.put(
      `/${options.project}/${reqType(options)}/v1/${path}/${iden}`,
      body ? pickOrIgnore(body, options.ignores) : undefined,
      options.axiosConfig
    ),
    options
  )
}

export function reqLink(
  body: {
    parent: [string, any]
    child: [string, any]
  },
  link = true,
  options?: RequestOptions
): Promise<any> {
  if (!options) {
    options = {}
  }
  if (!options.project) {
    options.project = getDftPjt()
  }
  if (typeof options.orgRes === 'undefined') {
    options.orgRes = false
  }
  if (!options.messages) {
    options.messages = {}
  }
  if (!options.messages.loading) {
    options.messages.loading = '提交中……'
  }
  if (!options.messages.succeed) {
    options.messages.succeed = '提交成功！'
  }
  const url = [
    `/${options.project}/${reqType(options)}/v1`,
    body.parent[0],
    body.parent[1],
    body.child[0],
    body.child[1]
  ].join('/')
  if (link) {
    return makeRequest(axios.put(url, options.axiosConfig), options)
  } else {
    return makeRequest(axios.delete(url, options.axiosConfig), options)
  }
}

export function getProperty(obj: any, props: string | string[]): any {
  if (typeof props === 'string') {
    props = props.split('.')
  }
  for (const prop of props) {
    if (!obj) {
      return null
    } else if (obj instanceof Array && prop.startsWith('[') && prop.endsWith(']')) {
      const key = prop.substring(1, prop.length - 1)
      obj = obj.find(el => el.key === key)
    } else if (prop in obj) {
      obj = obj[prop]
    } else {
      return null
    }
  }
  return obj
}

export function pickOrIgnore(obj: { [key: string]: any }, attrs: string[], ignore = true): any {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => (ignore ? !attrs.includes(key) : attrs.includes(key)))
  )
}

export async function until(cdFun: () => Promise<boolean>, lpLimit = 500) {
  for (let i = 0; i < lpLimit; ++i) {
    if (await cdFun()) {
      return Promise.resolve()
    }
    await new Promise(res => setTimeout(res, 200))
  }
  return Promise.reject()
}

export async function waitFor(
  iden: string,
  options: {
    reqFun?: (el: any) => boolean
    loop?: number
    getBy?: 'id' | 'name' | 'class'
  } = {}
): Promise<HTMLElement | null> {
  if (!options.reqFun) {
    options.reqFun = () => true
  }
  if (!options.loop) {
    options.loop = 500
  }
  if (!options.getBy) {
    options.getBy = 'id'
  }
  let ret: any = null
  for (let i = 0; i < options.loop; ++i) {
    switch (options.getBy) {
      case 'id':
        ret = document.getElementById(iden)
        break
      case 'name':
        ret = document.getElementsByName(iden)
        break
      case 'class':
        ret = document.getElementsByClassName(iden)
        break
    }
    if (!ret || !ret.length) {
      await new Promise(res => setTimeout(res, 200))
      continue
    } else if (ret.length) {
      ret = ret[0]
    }
    if (ret) {
      if (options.reqFun(ret)) {
        return Promise.resolve(ret)
      }
    }
    await new Promise(res => setTimeout(res, 200))
  }
  return Promise.resolve(ret)
}

export function fixStartsWith(text: string, prefix: string) {
  return (text.substring(0, prefix.length) !== prefix ? prefix : '') + text
}

export function rmvStartsOf(text: string, prefix: string) {
  return text.substring(0, prefix.length) === prefix ? text.substring(prefix.length) : text
}

export function endsWith(text: string, suffix: string) {
  return text.toString().slice(-suffix.length) === suffix
}

export function intervalCheck(options: {
  chkFun: () => Promise<boolean>
  middle?: {
    waiting?: (countdown: number) => void
    failed?: () => void
    succeed?: () => void
  }
  interval?: number
  limit?: number
}) {
  let countdown = 0
  const func = async (options: {
    chkFun: () => Promise<boolean>
    middle?: {
      waiting?: (countdown: number) => void
      failed?: () => void
      succeed?: () => void
    }
    limit?: number
  }) => {
    if (!options.middle) {
      options.middle = {}
    }
    if (!options.middle.waiting) {
      options.middle.waiting = () => {
        console.log()
      }
    }
    if (!options.middle.failed) {
      options.middle.failed = () => {
        console.log()
      }
    }
    if (!options.middle.succeed) {
      options.middle.succeed = () => {
        console.log()
      }
    }
    if (!options.limit) {
      options.limit = 60
    }
    if (!(await options.chkFun())) {
      // 检查状态不满足要求
      options.middle.waiting(countdown)
      if (countdown > (options.limit || 60)) {
        // 如果超过等待极限时间，告知
        options.middle.failed()
        clearInterval(h)
      } else {
        ++countdown
      }
      return
    }
    clearInterval(h)
    // 状态满足要求，告知
    options.middle.succeed()
  }
  const h = setInterval(() => func(options), options.interval || 1000)
  setTimeout(() => func(options), 200)
}

export function fmtStrByObj(pattern: RegExp, obj: any, str: string) {
  let ret = str
  for (let result = pattern.exec(str); result; result = pattern.exec(str)) {
    ret = ret.replace(
      result[0] + ' ',
      getProperty(obj, result[0].substring(result[0].startsWith('@') ? 1 : 2))
    )
  }
  return ret
}

export function upperFirst(text: string): string {
  if (!text.length) {
    return ''
  }
  const char = text.charCodeAt(0)
  if (char >= 97 && char <= 122) {
    return String.fromCharCode(char - 32) + text.substring(1)
  }
  return text
}

export function lowerFirst(text: string): string {
  if (!text.length) {
    return ''
  }
  const char = text.charCodeAt(0)
  if (char >= 65 && char <= 90) {
    return String.fromCharCode(char + 32) + text.substring(1)
  }
  return text
}

export function charInc(str: string): string {
  if (!str.length) {
    return str
  }
  if (Array.from(str).every(c => c === 'Z')) {
    return new Array(str.length + 1).fill('A').join('')
  }
  if (str[str.length - 1] === 'Z') {
    return charInc(str.slice(0, -1)) + 'A'
  } else {
    return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length - 1) + 1)
  }
}

function getRow(formState: Batch, rowNo: number): Record<string, string> {
  if (!formState.worksheet) {
    return {}
  }
  const range = formState.worksheet['!ref'] as string
  const [beg, end] = range?.split(':')
  const [begCol] = /^[A-Z]+/g.exec(beg) as RegExpExecArray
  const [endCol] = /^[A-Z]+/g.exec(end) as RegExpExecArray
  const ret = {} as Record<string, string>
  for (let col = begCol; ; col = charInc(col)) {
    const key = `${col}${rowNo}`
    const txt = formState.worksheet[key] ? formState.worksheet[key].v : ''
    ret[col] = txt
    if (col === endCol) {
      break
    }
  }
  return ret
}

export function genDspColumns(formState: Batch) {
  if (!formState.worksheet) {
    return []
  }
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.font = '14px Microsoft YaHei'
  const ret = []
  for (const [key, txt] of Object.entries(getRow(formState, formState.hdRowNo))) {
    const textmetrics = context.measureText(txt)
    const width = textmetrics.width << 1
    ret.push(
      new Column(txt, key, {
        width,
        customCell: () => ({
          style: {
            'min-width': '100px',
            'max-width': `${width}px`,
            'white-space': 'nowrap',
            'text-overflow': 'ellipsis',
            overflow: 'hidden'
          }
        })
      })
    )
  }
  canvas.remove()
  return ret
}

export function genDspRecords(formState: Batch) {
  if (!formState.worksheet) {
    return []
  }
  const ret = [getRow(formState, formState.dtRowNo)]
  const endRowNo = parseInt(
    (/\d+$/.exec(formState.worksheet['!ref'] as string) as RegExpExecArray)[0] || '0'
  )
  if (formState.dtRowNo + 1 < endRowNo) {
    ret.push(getRow(formState, formState.dtRowNo + 1))
  }
  return ret
}

export function validConds(
  formState: any,
  value: boolean | Cond[] | { [cmpRel: string]: Cond[] } | undefined,
  valUndRet = false
): boolean {
  if (typeof value === 'undefined') {
    return valUndRet
  } else if (typeof value === 'boolean') {
    return value as boolean
  } else if (value && value.length) {
    return (value as Cond[])
      .map((cond: Cond) => cond.isValid(formState))
      .reduce((a: boolean, b: boolean) => a && b)
  } else {
    let ret = 'OR' in value ? true : false
    for (const [cmpRel, conds] of Object.entries(value)) {
      ret =
        ret &&
        (conds as Cond[])
          .map((cond: Cond) => cond.isValid(formState))
          .reduce((a: boolean, b: boolean) => {
            switch (cmpRel) {
              case 'OR':
                return a || b
              case 'AND':
              default:
                return a && b
            }
          })
    }
    return ret
  }
}

export function getProp(obj: any, prop: string) {
  if (!prop) {
    return obj
  }
  if (prop.indexOf('.') === -1 && prop in obj) {
    prop += '.'
  }
  for (const p of prop.split('.')) {
    if (p === '') {
      continue
    } else if (p.endsWith(']')) {
      if (p.endsWith('}]')) {
        const result = /^(\w+)\[\{(\w+):("?\w+"?)\}\]$/.exec(p)
        if (!result || result.length < 4) {
          throw new Error()
        }
        const sub = result[1]
        const key = result[2]
        const val = result[3]
        obj = obj[sub].find((itm: any) => itm[key] == val)
      } else {
        const result = /^(\w+)\[(\d+)\]$/.exec(p)
        if (!result || result.length < 3) {
          throw new Error()
        }
        const sub = result[1]
        const idx = parseInt(result[2])
        obj = obj[sub][idx]
      }
    } else {
      obj = obj[p]
    }
  }
  return obj
}

export function setProp(
  obj: any,
  prop: string,
  value: any,
  callback = (base: any, key: any, value: any) => {
    base[key] = value
  }
) {
  if (!prop) {
    return obj
  }
  if (prop.indexOf('.') === -1 && prop in obj) {
    prop = '.' + prop
  }
  const ret = obj
  const props = prop.split('.')
  const lstIdx = props.length - 1
  for (let i = 0; i < props.length; ++i) {
    const p = props[i]
    if (p === '') {
      continue
    } else if (p.endsWith(']')) {
      if (p.endsWith('}]')) {
        const result = /^(\w+)\[\{(\w+):("?\w+"?)\}\]$/.exec(p)
        if (!result || result.length < 4) {
          throw new Error()
        }
        const sub = result[1]
        const key = result[2]
        const val = result[3]
        const idx = obj[sub].findIndex((itm: any) => itm[key] == val)
        if (idx === -1) {
          throw new Error()
        }
        if (i === lstIdx) {
          callback(obj[sub], idx, value)
        } else {
          obj = obj[sub][idx]
        }
      } else {
        const result = /^(\w+)\[(\d+)\]$/.exec(p)
        if (!result || result.length < 3) {
          throw new Error()
        }
        const sub = result[1]
        const idx = parseInt(result[2])
        if (i === lstIdx) {
          callback(obj[sub], idx, value)
        } else {
          obj = obj[sub][idx]
        }
      }
    } else if (i === lstIdx) {
      callback(obj, p, value)
    } else {
      if (!obj[p]) {
        obj[p] = {}
      }
      obj = obj[p]
    }
  }
  return ret
}

export function revsKeyVal(obj: any) {
  return Object.fromEntries(Object.entries(obj).map(([key, val]) => [val, key]))
}

export function gnlCpy<T extends Record<string, any>>(
  t: { new (): T } | (() => T),
  src: any,
  tgt?: T,
  options?: {
    keys?: string[]
    force?: boolean
    ignProps?: string[]
    baseCpy?: (src: any, tgt?: any, force?: boolean) => any
    cpyMapper?: Record<string, (src: any, tgt?: any, force?: boolean) => any>
  }
): T {
  if (!options) {
    options = {}
  }
  if (!options.ignProps) {
    options.ignProps = []
  }
  if (!options.cpyMapper) {
    options.cpyMapper = {}
  }
  if (!options.keys) {
    options.keys = ['id', '_id', 'key']
  }
  const create = (): T => {
    // 通过判断能否使用new调用判断是类还是函数
    try {
      return new (t as any)()
    } catch (e) {
      return (t as any)()
    }
  }
  tgt = tgt || create()
  if (options.force && tgt.reset) {
    tgt.reset()
  }
  for (const key of options.keys) {
    if (src[key]) {
      setProp(tgt, 'key', src[key])
      options.ignProps.push('key')
      break
    }
  }
  if (options.baseCpy) {
    options.baseCpy(src, tgt, options.force)
  }
  for (const key of Object.keys(create())) {
    if (options.ignProps.includes(key)) {
      continue
    }
    if (
      typeof tgt[key] === 'string' ||
      typeof tgt[key] === 'number' ||
      typeof tgt[key] === 'boolean' ||
      typeof tgt[key] === 'function'
    ) {
      if (options.force || typeof src[key] !== 'undefined') {
        setProp(tgt, key, src[key])
      }
    } else if (tgt[key] instanceof Array) {
      if (src[key]) {
        if (typeof src[key][0] === 'object' && key in options.cpyMapper) {
          const cpy = options.cpyMapper[key]
          tgt[key].splice(
            0,
            tgt[key].length,
            ...src[key].map((ele: any) => cpy(ele, undefined, options?.force))
          )
        } else {
          tgt[key].splice(0, tgt[key].length, ...src[key])
        }
      } else if (options.force) {
        tgt[key].splice(0, tgt[key].length)
      }
    } else if (src[key] && key in options.cpyMapper) {
      const res = options.cpyMapper[key](src[key] || {}, tgt[key], options.force)
      if (!tgt[key]) {
        setProp(tgt, key, res)
      }
    } else if (src[key] || options.force) {
      setProp(tgt, key, src[key])
    }
  }
  return tgt as T
}

export function styleHyphenFormat(text: string) {
  function upperToHyphenLower(match: string) {
    return '-' + match.toLowerCase()
  }
  return rmvStartsOf(text.replace(/[A-Z]/g, upperToHyphenLower), '-')
}

export function rgb(r: number, g: number, b: number) {
  return (
    '#' +
    Math.floor(r).toString(16).toUpperCase().padStart(2, '0') +
    Math.floor(g).toString(16).toUpperCase().padStart(2, '0') +
    Math.floor(b).toString(16).toUpperCase().padStart(2, '0')
  )
}

export function rgba(r: number, g: number, b: number, a: number) {
  const alpha = Math.floor(a * 256)
  if (alpha === 1) {
    return rgb(r, g, b)
  } else {
    return rgb(r, g, b) + alpha.toString(16).toUpperCase().padStart(2, '0')
  }
}