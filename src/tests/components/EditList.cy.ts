/// <reference path="../../../cypress/support/component.ts" />
import EditList from '@/components/EditList.vue'
import { getCopy } from '@/types/mapper'
import { reactive, createVNode } from 'vue'
import FormItem from '@/components/FormItem.vue'
import { v4 } from 'uuid'
import { gnlCpy } from '@/utils'

const props = {
  mapper: getCopy({ type: 'EditList' }),
  value: reactive([] as any[])
}

const IdAddBtn = 'button.ant-btn-background-ghost'
const IdForm = 'form.ant-form'
const sbFormItm = '.ant-form-item'
const sbInput = 'input.ant-input'
const sbSelect = '.ant-select'
const IdFmItmIpt = [IdForm, sbFormItm, sbInput].join(' ')
const IdSbtBtn = 'form.ant-form .justify-end button[type=submit]'
const IdCclBtn = 'form.ant-form .justify-end button[type=button]'
const IdLstItm = '.ant-list .ant-list-items .ant-list-item'
const sbItmDel = '.ant-list-item-action button.ant-btn-dangerous'

describe('<EditList />', () => {
  describe('默认mapper', () => {
    beforeEach(function () {
      this['instance'] = cy.mount(EditList, {
        props: Object.assign({ 'onUpdate:value': cy.spy().as('onUpdate') }, props),
        slots: {
          formItem: subProps => createVNode(FormItem, subProps)
        }
      })
    })

    it('正常显示', () => {
      const text = v4()
      cy.contains('button', '添加')
        .click()
        .should('not.exist')
        .get(IdForm)
        .should('exist')
        .children(sbFormItm)
        .should('have.length', 1)
        .find(sbInput)
        .type(text)
        .get(IdSbtBtn)
        .should('exist')
        .click()
        .get(IdLstItm)
        .should('have.length', 1)
        .eq(0)
        .should('contain', text)
        .find(sbItmDel)
        .should('exist')
        .click()
        .get(IdLstItm)
        .should('not.exist')
        .contains('button', '添加')
        .click()
        .get(IdFmItmIpt)
        .should('exist')
        .get(IdCclBtn)
        .click()
        .get(IdFmItmIpt)
        .should('not.exist')
    })

    it('子 -> 父', () => {
      const array = [v4(), v4()]
      cy.contains('button', '添加')
        .click()
        .get(IdForm)
        .find(sbInput)
        .clear()
        .type(array[0])
        .get(IdSbtBtn)
        .click()
        .get('@onUpdate')
        .should('be.calledWith', [array[0]])
      cy.contains('button', '添加')
        .click()
        .get(IdForm)
        .find(sbInput)
        .clear()
        .type(array[1])
        .get(IdSbtBtn)
        .click()
        .get('@onUpdate')
        .should('be.calledWith', array)
      cy.get(IdLstItm)
        .eq(0)
        .find(sbItmDel)
        .click()
        .get('@onUpdate')
        .should('be.calledWith', [array[1]])
    })

    it('父 -> 子', function () {
      this['instance'].then(({ wrapper }: any) => wrapper.setProps({ value: [v4()] }))
      cy.get(IdLstItm).should('have.length', 1).eq(0).find(sbItmDel).click()
    })
  })

  const mapper = {
    type: 'EditList',
    flatItem: false,
    mapper: {
      iptProp: {
        type: 'Input'
      },
      sltProp: {
        type: 'Select',
        options: [
          { label: '上海', value: 'shanghai' },
          { label: '北京', value: 'beijing' },
          { label: '深圳', value: 'shenzhen' }
        ]
      }
    },
    copy: (src: any, tgt: any) => gnlCpy(() => ({ iptProp: '', sltProp: 'shanghai' }), src, tgt)
  }

  it('自定义mapper', () => {
    cy.mount(EditList, {
      props: {
        mapper: getCopy(Object.assign({ lblProp: 'iptProp' }, mapper)),
        value: reactive([]),
        'onUpdate:value': cy.spy().as('onUpdate')
      },
      slots: {
        formItem: subProps => createVNode(FormItem, subProps)
      }
    })

    const text = v4()
    cy.contains('button', '添加')
      .click()
      .get([IdForm, sbFormItm].join(' '))
      .should('have.length', 2)
      .each(($el, idx) => {
        const wrapper = cy.wrap($el)
        switch (idx) {
          case 0:
            wrapper.find(sbInput).should('exist').type(text)
            break
          case 1:
            wrapper
              .find(sbSelect)
              .should('exist')
              .click()
              .get('.ant-select-dropdown .ant-select-item')
              .eq(1)
              .click()
            break
          default:
            cy.trigger('error')
        }
      })
      .get(IdSbtBtn)
      .click()
      .get('@onUpdate')
      .should('be.calledWith', [{ iptProp: text, sltProp: 'beijing' }])
      .get(IdLstItm)
      .should('have.length', 1)
      .eq(0)
      .should('contain', text)
  })
})
