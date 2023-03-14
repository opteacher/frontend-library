/// <reference path="../../../cypress/support/component.ts" />
import ColorSelect from '@/components/ColorSelect.vue'

function mount() {
  // see: https://test-utils.vuejs.org/guide/
  cy.mount(ColorSelect, {
    props: {
      color: '#FF00FF',
      'onUpdate:color': cy.spy().as('onColorChange')
    }
  })
}

describe('<ColorSelect />', () => {
  beforeEach(mount)

  it('显示正常', () => {
    cy.get('.preset li').should('have.length.above', 0)
  })

  it('参数能否正常传入', () => {
    cy.get('.color-value .hex input')
      .should('have.value', '#FF00FF')
      .get('.color-value .rgba-r input')
      .should('have.value', '255')
      .get('.color-value .rgba-g input')
      .should('have.value', '0')
      .get('.color-value .rgba-b input')
      .should('have.value', '255')
  })

  it('颜色变化正常反馈', () => {
    cy.get('.saturation-value')
      .click(Math.random() * 200, Math.random() * 200)
      .get('@onColorChange')
      .should('have.been.called', cy.$$('.color-value .hex input').val())
  })

  // 修改props不能影响子组件！
  // it.skip('修改props影响子组件', () => {
  //   cy.then(() => { props.color = '#FF0000' })
  //     .get('.color-value .hex input')
  //     .should('have.value', '#FF0000')
  // })

  describe('saturation', () => {
    beforeEach(mount)

    it.skip('点击颜色发生变化', () => {})

    it('拖动无异常', () => {
      const width = cy.$$('.saturation-value').width() || 0
      const height = cy.$$('.saturation-value').height() || 0
      cy.get('.saturation-value')
        .trigger('mousedown', Math.random() * width, Math.random() * height)
        .trigger('mousemove', Math.random() * width, Math.random() * height)
        .trigger('mouseup')
    })
  })
})
