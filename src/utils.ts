import { message, notification } from 'ant-design-vue'
import axios, { type AxiosRequestConfig } from 'axios'
import dayjs from 'dayjs'
import qs from 'qs'
import { cloneDeep } from 'lodash'

import { Cond } from './types'
import Batch from './types/batch'
import Column from './types/column'
import type { CondType } from './types/mapper'

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
  action?: string
  ignores?: string[]
  axiosConfig?: AxiosRequestConfig<any>
  copy?: (src: any, tgt?: any) => any
  orgRes?: boolean
}

export const getDftPjt = () => import.meta.env.VITE_PJT || 'frontend-library'

export async function makeRequest<T = any>(
  pms: Promise<any>,
  options?: RequestOptions
): Promise<T> {
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
  const resp = await pms
  const resData = resp.data
  if (!options.messages.notShow) {
    message.destroy()
  }
  options.middles.after && options.middles.after(options.orgRes ? resp : resData)
  let ret = resData
  if (options.orgRes) {
    ret = resp
  } else {
    if (typeof resData.result !== 'undefined') {
      ret = resData.result
    } else if (typeof resData.data !== 'undefined') {
      ret = resData.data
    }
    if (options && options.copy) {
      const cpyFun = options.copy
      if (Array.isArray(ret)) {
        if (ret.length) {
          if (cpyFun(ret[0]) instanceof Promise) {
            ret = await Promise.all(ret.map((item: any) => cpyFun(item)))
          } else {
            ret = ret.map((item: any) => cpyFun(item))
          }
        } else {
          ret = []
        }
      } else {
        ret = cpyFun(ret) instanceof Promise ? await cpyFun(ret) : cpyFun(ret)
      }
    }
  }

  if (!options.messages.notShow) {
    if (resp.status !== 200) {
      notification.error({
        message: '请求失败！',
        description: [options.messages.failed || '', resp.statusText].join('  ')
      })
    } else if (resData.error || ret.error) {
      notification.error({
        message: '请求失败！',
        description: resData.error || ret.error
      })
    } else {
      if (options.messages.succeed) {
        message.success(options.messages.succeed)
      } else if (ret.message) {
        message.success(ret.message)
      }
    }
  }
  return Promise.resolve(ret)
}

function reqType(options?: RequestOptions): string {
  return options && options.type ? options.type : 'mdl'
}

export async function reqAll<T = any>(path: string, options?: RequestOptions): Promise<T[]> {
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
  if (options.axiosConfig && options.axiosConfig.params) {
    Object.assign(options.axiosConfig, {
      paramsSerializer: (params: any) => qs.stringify(params, { indices: false })
    })
  }
  const action = options.action ? fixStartsWith(options.action, '/') : ''
  return makeRequest<T[]>(
    axios.get(`/${options.project}/${reqType(options)}/v1/${path}/s${action}`, options.axiosConfig),
    options
  )
}

export async function reqGet<T = any>(
  path: string,
  iden?: any,
  options?: RequestOptions
): Promise<T> {
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
  if (options.axiosConfig && options.axiosConfig.params) {
    Object.assign(options.axiosConfig, {
      paramsSerializer: (params: any) => qs.stringify(params, { indices: false })
    })
  }
  const key = iden ? '/' + iden : ''
  const action = options.action ? fixStartsWith(options.action, '/') : ''
  return makeRequest<T>(
    axios.get(
      `/${options.project}/${reqType(options)}/v1/${path}${key}${action}`,
      options.axiosConfig
    ),
    options
  )
}

export function reqPost<T = any>(path: string, body?: any, options?: RequestOptions): Promise<T> {
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
  const action = options.action ? fixStartsWith(options.action, '/') : ''
  // @_@: 对于FormData作为body的请求，pickOrIgnore方法会破坏参数结构，从而引发参数为空的问题
  return makeRequest<T>(
    axios.post(
      `/${options.project}/${reqType(options)}/v1/${path}${action}`,
      body ? pickOrIgnore(body, options.ignores) : undefined,
      options.axiosConfig
    ),
    options
  )
}

export function reqDelete<T = number>(
  path: string,
  iden: any,
  options?: RequestOptions
): Promise<T> {
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
  if (options.axiosConfig && options.axiosConfig.params) {
    Object.assign(options.axiosConfig, {
      paramsSerializer: (params: any) => qs.stringify(params, { indices: false })
    })
  }
  const action = options.action ? fixStartsWith(options.action, '/') : ''
  return makeRequest<T>(
    axios.delete(
      `/${options.project}/${reqType(options)}/v1/${path}/${iden}${action}`,
      options.axiosConfig
    ),
    options
  )
}

export function reqPut<T = any>(
  path: string,
  iden: any,
  body?: any,
  options?: RequestOptions
): Promise<T> {
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
  const action = options.action ? fixStartsWith(options.action, '/') : ''
  return makeRequest<T>(
    axios.put(
      `/${options.project}/${reqType(options)}/v1/${path}/${iden}${action}`,
      body ? pickOrIgnore(body, options.ignores) : undefined,
      options.axiosConfig
    ),
    options
  )
}

export function reqLink<T = any>(
  body: {
    parent: [string, any]
    child: [string, any]
  },
  link = true,
  options?: RequestOptions
): Promise<T> {
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
  const action = options.action ? fixStartsWith(options.action, '/') : ''
  const url =
    [
      `/${options.project}/${reqType(options)}/v1`,
      body.parent[0],
      body.parent[1],
      body.child[0],
      body.child[1]
    ].join('/') + action
  if (link) {
    return makeRequest<T>(axios.put(url, options.axiosConfig?.data, options.axiosConfig), options)
  } else {
    return makeRequest<T>(axios.delete(url, options.axiosConfig), options)
  }
}

export function getProperty(obj: any, props: string | string[]): any {
  if (typeof props === 'string') {
    props = props.split('.')
  }
  for (const prop of props) {
    if (!obj) {
      return null
    } else if (Array.isArray(obj) && prop.startsWith('[') && prop.endsWith(']')) {
      const key = prop.slice(1, -1)
      const numKey = parseInt(key)
      if (!Number.isNaN(numKey)) {
        obj = obj[numKey]
      } else {
        obj = obj.find(el => el.key === key)
      }
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

export async function until(
  cdFun: () => Promise<boolean>,
  options?: { loop?: number; interval?: number }
) {
  if (!options) {
    options = { loop: 500, interval: 200 }
  }
  if (!options.loop) {
    options.loop = 500
  }
  if (!options.interval) {
    options.interval = 200
  }
  for (let i = 0; i < options.loop; ++i) {
    if (await cdFun()) {
      return Promise.resolve()
    }
    await new Promise(res => setTimeout(res, options.interval))
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
    if (!ret) {
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
  if (text.length < prefix.length) {
    return prefix
  }
  return (text.substring(0, prefix.length) !== prefix ? prefix : '') + text
}

export function fixEndsWith(text: string, suffix: string) {
  if (text.length < suffix.length) {
    return suffix
  }
  return text + (text.slice(-suffix.length) !== suffix ? suffix : '')
}

export function rmvStartsOf(text: string, prefix: string) {
  return text.substring(0, prefix.length) === prefix ? text.substring(prefix.length) : text
}

export function endsWith(text: string, suffix: string) {
  return text.toString().slice(-suffix.length) === suffix
}

export function intervalCheck(options: {
  chkFun: (stop: () => boolean) => Promise<boolean>
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
    chkFun: (stop: () => boolean) => Promise<boolean>
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
    if (
      !(await options.chkFun(() => {
        clearInterval(h)
        return true
      }))
    ) {
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
        custCell: {
          style: {
            'min-width': '100px',
            'max-width': `${width}px`,
            'white-space': 'nowrap',
            'text-overflow': 'ellipsis',
            overflow: 'hidden'
          }
        }
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
  value: CondType | undefined,
  valUndRet = false
): boolean {
  if (typeof value === 'undefined') {
    return valUndRet
  } else if (typeof value === 'boolean') {
    return value as boolean
  } else if (typeof value === 'function') {
    return value(formState) as boolean
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

export function getProp(obj: any, prop: string, dftVal: any = undefined) {
  if (!prop) {
    return obj
  }
  if (prop.indexOf('.') === -1 && prop in obj) {
    prop += '.'
  }
  for (const p of prop.split('.')) {
    if (p === '') {
      continue
    } else if (!obj) {
      return dftVal
    } else if (p.endsWith(']')) {
      if (p.endsWith('}]')) {
        const result = /^(\w+)\[\{(\w+):("?\w+"?)\}\]$/.exec(p)
        if (!result || result.length < 4) {
          return dftVal
        }
        const sub = result[1]
        const key = result[2]
        const val = result[3]
        if (!(sub in obj)) {
          return dftVal
        }
        obj = obj[sub].find((itm: any) => itm[key] == val)
      } else {
        const result = /^(\w+)\[(\d+)\]$/.exec(p)
        if (!result || result.length < 3) {
          return dftVal
        }
        const sub = result[1]
        const idx = parseInt(result[2])
        if (!(sub in obj)) {
          return dftVal
        }
        obj = obj[sub][idx]
      }
    } else {
      obj = obj[p]
    }
  }
  return obj || dftVal
}

export function setProp(
  obj: any,
  prop: string,
  value: any,
  options?: {
    callback?: (base: any, key: any, value: any) => void;
    selfChange?: boolean
  }
) {
  if (!options) {
    options = { callback: (base: any, key: any, value: any) => (base[key] = value) }
  }
  if (!options.callback) {
    options.callback = (base: any, key: any, value: any) => (base[key] = value)
  }
  if (typeof options.selfChange === 'undefined') {
    options.selfChange = true
  }
  if (!prop) {
    return obj
  }
  if (prop.indexOf('.') === -1 && prop in obj) {
    prop = '.' + prop
  }
  const ret = options.selfChange ? obj : cloneDeep(obj)
  const props = prop.split('.')
  const lstIdx = props.length - 1
  for (let i = 0, tmp = ret; i < props.length; ++i) {
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
        const idx = tmp[sub].findIndex((itm: any) => itm[key] == val)
        if (idx === -1) {
          throw new Error()
        }
        if (i === lstIdx) {
          options.callback(tmp[sub], idx, value)
        } else {
          tmp = tmp[sub][idx]
        }
      } else {
        const result = /^(\w+)\[(\d+)\]$/.exec(p)
        if (!result || result.length < 3) {
          throw new Error()
        }
        const sub = result[1]
        const idx = parseInt(result[2])
        if (i === lstIdx) {
          options.callback(tmp[sub], idx, value)
        } else {
          tmp = tmp[sub][idx]
        }
      }
    } else if (i === lstIdx) {
      options.callback(tmp, p, value)
    } else {
      if (!tmp[p]) {
        tmp[p] = {}
      }
      tmp = tmp[p]
    }
  }
  return ret
}

export function swchBoolProp(obj: any, prop: string) {
  setProp(obj, prop, !getProp(obj, prop))
}

export function revsKeyVal(obj: any) {
  return Object.fromEntries(Object.entries(obj).map(([key, val]) => [val, key]))
}

export function notUndefAndNull(value: any, valEmpty = false) {
  const isUndefOrNull = typeof value === 'undefined' || value == null
  if (isUndefOrNull) {
    return false
  }
  return !(valEmpty ? value === '' || !value.length : false)
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
  if (!src) {
    src = {}
  }
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
  for (const key of options.keys) {
    if (typeof src[key] !== 'undefined') {
      setProp(tgt, 'key', src[key])
      options.ignProps.push('key')
      break
    }
  }
  if (options.baseCpy) {
    tgt = options.baseCpy(src, tgt, options.force) as T
  }
  for (const key of Object.keys(create())) {
    if (options.ignProps.includes(key)) {
      continue
    }
    const srcnotUndefAndNull = notUndefAndNull(src[key])
    if (key in options.cpyMapper) {
      const cpy = options.cpyMapper[key]
      if (Array.isArray(tgt[key]) && srcnotUndefAndNull && src[key].length) {
        if (typeof src[key][0] === 'object') {
          tgt[key].splice(0, tgt[key].length, ...src[key].map((ele: any) => cpy(ele)))
        } else {
          tgt[key].splice(0, tgt[key].length, ...src[key])
        }
      } else if (src[key]) {
        if (typeof src[key] === 'object') {
          const res = cpy(src[key], tgt[key], options.force)
          if (res || options.force) {
            setProp(tgt, key, res)
          }
        } else {
          setProp(tgt, key, src[key])
        }
      }
    } else if (
      typeof tgt[key] === 'string' ||
      typeof tgt[key] === 'number' ||
      typeof tgt[key] === 'boolean' ||
      typeof tgt[key] === 'function'
    ) {
      if (options.force || srcnotUndefAndNull) {
        setProp(tgt, key, src[key])
      }
    } else if (typeof tgt[key] === 'object') {
      if (options.force || srcnotUndefAndNull) {
        if (tgt[key] instanceof dayjs) {
          setProp(tgt, key, src[key] ? dayjs(src[key]) : null)
        } else {
          setProp(tgt, key, src[key] ? cloneDeep(src[key]) : null)
        }
      }
    } else if (Array.isArray(tgt[key])) {
      if (src[key]) {
        tgt[key].splice(0, tgt[key].length, ...src[key])
      } else if (options.force) {
        tgt[key].splice(0, tgt[key].length)
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

export function code2Func(code: string, args?: Record<string, any>): Function {
  return new Function(...Object.keys(args || {}), code)
}

export function callFunc(code: string, args?: Record<string, any>) {
  return code2Func(code, args)(...Object.values(args || {}))
}

export function newOne<T>(t: { new (): T }): T {
  return new t()
}

export function json2Object(json: object, params?: Record<string, any>) {
  for (let [key, value] of Object.entries(json)) {
    switch (true) {
      case typeof value === 'string':
        if (value.startsWith('() => ')) {
          value = value.replace('() => ', 'return ')
        }
        if (value.startsWith('return ')) {
          setProp(json, key, { callback: callFunc(value, params) })
        }
        break
      case typeof value === 'object':
        setProp(json, key, { callback: json2Object(value, params) })
        break
    }
  }
  return json
}

export function replaceObjProps(obj: object, vals: any) {
  return { ...pickOrIgnore(obj, Object.keys(vals)), ...vals }
}
