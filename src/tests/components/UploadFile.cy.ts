/// <reference path="../../../cypress/support/component.ts" />
import UploadFile from '@/components/UploadFile.vue'

const IdAddBtn = 'button.w-full'

describe('<UploadFile />', () => {
  it('正常显示', () => {
    cy.mount(UploadFile)

    cy.get(IdAddBtn)
      .trigger('mouseenter')
      .get('.ant-dropdown')
      .should('not.have.css', 'display', 'none')
      .find('.ant-menu .ant-menu-item')
      .should('have.length', 2)
      .each(($el, idx) => {
        switch(idx) {
          case 0:
            cy.wrap($el).should('contain.text', '上传文件').click()
            break
          case 1:
            cy.wrap($el).should('contain.text', '上传文件夹')
            break
          default:
            cy.trigger('error')
        }
      })
  })
})
