/// <reference path="../../../cypress/support/component.ts" />
import IconField from '../../components/IconField.vue'

const IdAddBtn = 'button.w-full'
const IdMdlMsk = '.ant-modal-root .ant-modal-mask'
const IdModel = '.ant-modal-root .ant-modal'
const IdSelLnk = '.ant-modal-body .justify-between div:first a'
const IdIcnBlk = '.ant-modal-body .ant-col'
const IdSbtBtn = '.ant-modal-footer button.ant-btn-primary'
const IdNxtPgBtn = '.ant-modal-body .justify-between .ant-pagination .ant-pagination-next'

describe('<IconField />', () => {
  beforeEach(function () {
    const props = {
      icon: '',
      'onUpdate:icon': (icon: string) => {
        cy.get('@compIns').then(({ wrapper }: any) => wrapper.setProps({ icon }))
      }
    }
    cy.spy(props, 'onUpdate:icon').as('onUpdate')
    cy.mount(IconField, { props }).as('compIns')
  })

  it('正常显示', () => {
    cy.get(IdAddBtn)
      .click()
      .get(IdMdlMsk)
      .should('not.have.css', 'display', 'none')
      .get(IdModel)
      .should('not.have.css', 'display', 'none')
      .get(IdSelLnk)
      .should('have.text', '')
      .get(IdIcnBlk)
      .should('have.length.above', 0)
      .then($els => {
        cy.wrap($els)
          .eq(Math.floor(Math.random() * $els.length))
          .then($el => {
            const humpName = $el.find('p.mb-0').text()
            cy.wrap($el)
              .should('not.have.class', 'border-primary')
              .click()
              .should('have.class', 'border-primary')
              .get(IdSelLnk)
              .should('have.text', humpName)
              .get(IdSbtBtn)
              .click()
              .get(IdMdlMsk)
              .should('have.css', 'display', 'none')
              .get(IdModel)
              .should('have.css', 'display', 'none')
              .get([IdAddBtn, 'span.anticon'].join(' '))
              .should('exist')
              .get([IdAddBtn, 'span'].join(' '))
              .eq(1)
              .should('have.text', humpName)
          })
      })
  })

  it('子 -> 父', () => {
    cy.get(IdAddBtn)
      .click()
      .wrap(Array.from({ length: 5 }))
      .each(() => cy.get(IdNxtPgBtn).click())
      .get(IdIcnBlk)
      .then($els => {
        const index = Math.floor(Math.random() * $els.length)
        cy.wrap($els)
          .eq(index)
          .click()
          .get(IdSbtBtn)
          .click()
          .get('@onUpdate')
          .should('be.calledWith', $els.eq(index).find('p.mb-0').text())
      })
  })

  it('父 -> 子', () => {
    cy.get(IdAddBtn)
      .click()
      .get(IdIcnBlk)
      .eq(3)
      .then($el => {
        const humpName = $el.find('p.mb-0').text()
        cy.get('@compIns')
          .then(({ wrapper }: any) => wrapper.setProps({ icon: humpName }))
          .get('.ant-modal .ant-modal-close') // 并没有点击确认
          .click()
          .get([IdAddBtn, 'span.anticon'].join(' '))
          .should('exist')
          .get([IdAddBtn, 'span'].join(' '))
          .eq(1)
          .should('have.text', humpName)
      })
  })
})
