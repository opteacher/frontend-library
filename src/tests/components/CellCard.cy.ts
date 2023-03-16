/// <reference path="../../../cypress/support/component.ts" />
import CellCard from '@/components/CellCard.vue'
import { Cells } from '@/types/cell'

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
    const ret = cy.mount(CellCard, {
      props: {
        cell: Cells.copy({}),
        text: 'abcd'
      }
    })
    cy.get('div[data-v-app] span').should('have.css', 'color', 'rgb(0, 0, 0)')
    ret.then(({ wrapper }) => {
      wrapper.setProps({ selected: true })
      cy.get('div[data-v-app] span').should('not.have.css', 'color', 'rgb(0, 0, 0)')
    })
  })
})
