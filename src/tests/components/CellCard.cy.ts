/// <reference path="../../../cypress/support/component.ts" />
import CellCard from '@/components/CellCard.vue'
import Cell, { Cells } from '@/types/cell'
import { SelectMapper } from '@/types/mapper'
import { rgb, rgba } from '@/utils'

console.log(rgb(0, 0, 0), rgba(0, 0, 0, 1))

describe('<CellCard />', () => {
  it('显示正常', () => {
    cy.mount(CellCard, {
      props: {
        cell: Cells.copy({}),
        text: 'abcd'
      }
    })
    cy.get('div[data-v-app]').should('have.text', 'abcd')
  })

  it('显示链接', () => {
    cy.mount(CellCard, {
      props: {
        cell: Cells.copy({
          ctype: 'Link',
          format: { href: 'https://cn.bing.com/search?q=@text ' }
        }),
        text: 'abcd',
        record: { text: 'abcd' }
      }
    })
    cy.get('div[data-v-app] a')
      .should('have.length.above', 0)
      .should('have.attr', 'href', 'https://cn.bing.com/search?q=abcd')
  })

  it('选中变色', () => {
    cy.mount(CellCard, {
      props: {
        cell: Cells.copy({}),
        text: 'abcd'
      }
    })
    cy.get('div[data-v-app] span').then($el => {
      expect(eval($el.css('color')).startsWith('#000000')).to.true
    })
  })

  it('空值', () => {
    const ret = cy.mount(CellCard, {
      props: {
        cell: Cells.copy({}),
        text: undefined as any
      }
    })
    cy.get('div[data-v-app]').should('have.text', '-')
    ret
      .then(({ wrapper }) => wrapper.setProps({ text: '' }))
      .get('div[data-v-app]')
      .should('have.text', '')
  })

  it('布尔值', () => {
    const ret = cy.mount(CellCard, {
      props: {
        cell: Cells.copy({}),
        text: true as any
      }
    })
    cy.get('div[data-v-app]').should('have.text', '是')
    ret
      .then(({ wrapper }) => wrapper.setProps({ text: false }))
      .get('div[data-v-app]')
      .should('have.text', '否')
  })

  it('Select', () => {
    cy.mount(CellCard, {
      props: {
        cell: Cells.copy({}),
        text: 'bbbbbbbbbb',
        mapper: SelectMapper.copy({
          type: 'Select',
          options: [
            { label: '111111', value: 'aaaaa' },
            { label: '222222', value: 'bbbbbbbbbb' },
            { label: '33333', value: 'cccccccc' }
          ]
        })
      }
    })
    cy.get('div[data-v-app]').should('have.text', '222222')
  })

  it('条件Cell，根据数字加上正负号（数字类型也测试了）', () => {
    const cell = Cells.copy({
      cdCell: {
        'value_<_0': Cell.copy({
          color: '#00FF00',
          prefix: '-',
          ctype: 'Number',
          format: { fix: 2, unit: '%' }
        }),
        'value_>_0': Cell.copy({
          color: '#FF0000',
          prefix: '+',
          ctype: 'Number',
          format: { fix: 2, unit: '%' }
        })
      }
    })
    const ret = cy.mount(CellCard, {
      props: {
        cell,
        text: 100 as any,
        record: { value: 121 }
      }
    })
    cy.get('div[data-v-app]').should('have.text', '+100.00%')
    ret
      .then(({ wrapper }) => wrapper.setProps({ record: { value: -12 } }))
      .get('div[data-v-app]')
      .should('have.text', '-100.00%')
  })

  it('时间格式化', () => {
    cy.mount(CellCard, {
      props: {
        cell: Cells.copy({
          ctype: 'DateTime',
          format: { pattern: 'YY/MM/DD HH:mm:ss' }
        }),
        text: new Date() as any
      }
    })
    cy.get('div[data-v-app]')
      .invoke('text')
      .should('match', /^\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/)
  })
})
