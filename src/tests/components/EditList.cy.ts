/// <reference path="../../../cypress/support/component.ts" />
import EditList from '@/components/EditList.vue'
import { getCopy } from '@/types/mapper'
import { reactive, createVNode } from 'vue'
import FormItem from '@/components/FormItem.vue'
import { v4 } from 'uuid'

const props = {
  mapper: getCopy({ type: 'EditList' }),
  value: reactive([] as any[])
}

describe('<EditList />', () => {
  it('正常显示', () => {
    cy.mount(EditList, {
      props: Object.assign({ 'onUpdate:value': cy.spy().as('onUpdate') }, props),
      slots: {
        formItem: subProps => createVNode(FormItem, subProps)
      }
    })
    cy.get('button.ant-btn-background-ghost')
      .click()
      .should('not.exist')
      .get('form.ant-form')
      .should('exist')
      .children('.ant-form-item')
      .should('have.length', 1)
      .find('input.ant-input')
      .type(v4())
      .get('form.ant-form .justify-end button')
      .should('have.length', 2)
      .each(($el, idx) => {
        switch (idx) {
          case 0:
            cy.wrap($el).should('have.text', '确 定')
            break
          case 1:
            cy.wrap($el).should('have.text', '取 消').click()
            break
        }
      })
      .get('form.ant-form')
      .should('not.exist')
  })
})
