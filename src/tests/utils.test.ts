import { describe, it, beforeAll } from 'vitest'
import { gnlCpy } from '../utils'
import Project from './types/project'
import Middle from './types/middle'
import fs from 'fs'
import path from 'path'

describe('utils', () => {
  const StockCrawler = JSON.parse(
    fs.readFileSync(path.resolve('src', 'tests', 'resources', 'StockCrawler.json'), 'utf8')
  )

  describe('gnlCpy', () => {
    it('复制功能完整可用', ({ expect }) => {
      const res = gnlCpy(Project, StockCrawler)
      expect(res).toHaveProperty('name', 'stock-crawler')
      // 复制的对象不会影响原始对象
      res.desc = 'abcd'
      expect(StockCrawler).toHaveProperty('desc', '股票爬虫')
    })

    it('强制更新可用', ({ expect }) => {
      const res = new Project()
      gnlCpy(Project, StockCrawler, res)
      expect(res).toHaveProperty('name', 'stock-crawler')
      gnlCpy(Project, { desc: 'abcd' }, res)
      expect(res).toHaveProperty('name', 'stock-crawler')
      expect(res).toHaveProperty('desc', 'abcd')
      gnlCpy(Project, { desc: 'dcba' }, res, { force: true })
      expect(res.name).toBeUndefined()
      expect(res).toHaveProperty('desc', 'dcba')
    })

    it('设置跳过字段', ({ expect }) => {
      const res = new Project()
      gnlCpy(Project, StockCrawler, res, { ignProps: ['desc'] })
      expect(res).toHaveProperty('name', 'stock-crawler')
      expect(res).toHaveProperty('desc')
      expect(res.desc).not.toEqual('股票爬虫')
    })

    it('根据子字段映射表复制【对象】的子字段', ({ expect }) => {
      const res = new Project()
      gnlCpy(Project, StockCrawler, res)
      expect(res).haveOwnProperty('middle')
      expect(res.middle).toHaveProperty('key', '')
      res.reset()
      gnlCpy(Project, StockCrawler, res, {
        cpyMapper: {
          middle: (src: any, tgt?: Middle, options?: any) => gnlCpy(Middle, src, tgt, options)
        }
      })
      expect(res.middle.key).not.toBeUndefined()
      expect(res.middle.key).not.toEqual('')
    })
  })
})
