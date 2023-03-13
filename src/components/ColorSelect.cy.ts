/// <reference path="../../cypress/support/component.ts" />
import ColorSelect from './ColorSelect.vue'

describe('<ColorSelect />', () => {
  it('renders', () => {
    const props = {
      color: '#FF00FF',
      'onUpdate:color': cy.spy().as('onColorChange')
    }
    // see: https://test-utils.vuejs.org/guide/
    cy.mount(ColorSelect, { props })

    // 
    cy.get('.color-value .hex input')
      .should('have.value', '#FF00FF')
      .get('.color-value .rgba-r input')
      .should('have.value', '255')
      .get('.color-value .rgba-g input')
      .should('have.value', '0')
      .get('.color-value .rgba-b input')
      .should('have.value', '255')

    cy.get('.saturation-value')
      .click(Math.random() * 200, Math.random() * 200)
      .get('@onColorChange')
      .should('have.been.called', cy.$$('.color-value .hex input').val())

    cy.then(() => { props.color = '#FF0000' })
      .get('.color-value .hex input')
      .should('have.value', '#FF0000')
  })
})