/// <reference path="../../cypress/support/component.ts" />
import ColorSelect from './ColorSelect.vue'

describe('<ColorSelect />', () => {
  it('renders', () => {
    // see: https://test-utils.vuejs.org/guide/
    cy.mount(ColorSelect, {
      props: {
        color: '#FF00FF'
      }
    })

    cy.get('.color-value .hex input')
      .should('have.value', '#FF00FF')
      .get('.color-value .rgba-r input')
      .should('have.value', '255')
      .get('.color-value .rgba-g input')
      .should('have.value', '0')
      .get('.color-value .rgba-b input')
      .should('have.value', '255')
  })
})