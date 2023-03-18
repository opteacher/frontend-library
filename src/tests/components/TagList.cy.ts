/// <reference path="../../../cypress/support/component.ts" />
import TagList from '@/components/TagList.vue'
import FormDialog from '@/components/FormDialog.vue'
import Mapper, { getCopy } from '@/types/mapper'
import { createVNode, reactive } from 'vue'
import { v4 } from 'uuid'
import { Cond } from '../types'

const props = {
  mapper: getCopy({ type: 'TagList' }),
  value: reactive([])
} as any

const slots = {
  FormDialog: createVNode(FormDialog, {
    title: props.mapper.label || '编辑表单',
    mapper: props.mapper.mapper,
    copy: props.mapper.copy,
    emitter: props.mapper.emitter,
    object: props.mapper.editing,
    onSubmit: (newOne: any, next: Function) => {
      // , form[prop]只在TagList内嵌在FormDialog中才存在
      props.mapper.onSaved(newOne, props.value)
      next()
    }
  })
}

describe('<TagList />', () => {
  describe('正常显示（默认配置）', () => {
    beforeEach(() => {
      cy.mount(TagList, {
        props: Object.assign({ 'onUpdate:value': cy.spy().as('onChange') }, props),
        slots
      })
    })

    it('对话框', () => {
      cy.get('button.ant-btn-dashed')
        .click()
        .get('.ant-modal-root .ant-modal-mask')
        .should('not.have.css', 'display', 'none')
        .get('.ant-modal-root .ant-modal')
        .should('not.have.css', 'display', 'none')
      cy.get('form.ant-form .ant-form-item')
        .should('have.length', 1)
        .eq(0)
        .get('input')
        .should('have.length', 1)
      cy.get('.ant-modal .ant-modal-footer button[type=button]')
        .click()
        .get('.ant-modal-root .ant-modal-mask')
        .should('have.css', 'display', 'none')
        .get('.ant-modal-root .ant-modal')
        .should('have.css', 'display', 'none')
    })

    it('子 -> 父：子组件的操作结果反馈到父组件', function () {
      cy.log('添加多个标签……')
      const tags = v4().split('-')
      cy.wrap(tags).each((tag: string, idx: number) =>
        cy
          .get('button.ant-btn-dashed')
          .click()
          .get('form.ant-form .ant-form-item input')
          .type(tag)
          .get('.ant-modal .ant-modal-footer button[type=submit]')
          .click()
          .get('@onChange')
          .should('have.been.calledWith', tags.slice(0, idx + 1))
      )
      cy.log('检查标签添加成功……')
      cy.get('.ant-tag')
        .should('have.length', tags.length)
        .each(($el, idx) => cy.wrap($el).should('have.text', tags[idx]))
      cy.log('删除标签并检查……')
      const ary = tags.slice(0, tags.length)
      cy.wrap(
        Array.from({ length: tags.length }, (_v, k: number) =>
          Math.floor(Math.random() * (tags.length - k))
        )
      ).each((index: number) =>
        cy
          .get('.ant-tag')
          .eq(index)
          .children('span[aria-label=close]')
          .click()
          .then(() => ary.splice(index, 1))
          .get('@onChange')
          .should('have.been.calledWith', ary)
      )
    })

    it.skip('父 -> 子：父组件传进去的数组直接交由子组件操作，所以不用测试')
  })

  describe('多种多样的Mapper参数', () => {
    const orgMapper = {
      label: '编辑条件',
      type: 'TagList',
      flatItem: false,
      mapper: new Mapper({
        key: {
          label: '键',
          type: 'Input'
        },
        cmp: {
          label: '条件',
          type: 'Select',
          options: [
            { label: '等于', value: '=' },
            { label: '不等于', value: '!=' },
            { label: '存在于', value: 'in' }
          ]
        },
        val: {
          label: '值',
          type: 'Textarea'
        }
      }),
      copy: Cond.copy
    }

    it('指定展示的字段', () => {
      getCopy(Object.assign({ lblProp: 'key' }, orgMapper), props.mapper)
      cy.mount(TagList, {
        props: Object.assign({ 'onUpdate:value': cy.spy().as('onChange') }, props),
        slots
      })

      cy.get('button.ant-btn-dashed')
        .click()
        .wait(500)
        .get('form.ant-form .ant-form-item')
        .should('have.length', 3)
        .each(($el, idx) => {
          const wrapper = cy.wrap($el)
          switch (idx) {
            case 0:
              wrapper.find('.ant-input', {}).should('exist').type('name')
              break
            case 1:
              wrapper
                .find('.ant-select')
                .should('exist')
                .click()
                .get('.ant-select-dropdown .ant-select-item')
                .should('have.length', 3)
                .eq(Math.floor(Math.random() * 3))
                .click()
              break
            case 2:
              wrapper.find('textarea.ant-input').should('exist').type('opteacher')
              break
            default:
              cy.trigger('error')
          }
        })
        .wait(500)
        .get('.ant-modal-footer button[type=submit]')
        .click()
        .get('.ant-tag')
        .should('have.length', 1)
        .should('have.text', 'name')
        .get('@onChange')
        .should('be.called')
        .get('.ant-tag')
        .eq(0)
        .children('span[aria-label=close]')
        .click()
    })

    describe('根据标签参照表显示标签', () => {
      it('不带lblProp', function () {
        const lblMapper = { no1: '第一名', no2: '第二名', no3: '第三名' }
        getCopy(
          {
            label: '名次',
            type: 'TagList',
            lblProp: '',
            lblMapper,
            flatItem: true,
            mapper: new Mapper({
              value: {
                label: '内容',
                type: 'Select',
                options: Object.entries(lblMapper).map(([value, label]) => ({ label, value })),
                placeholder: '请选择',
                rules: [{ required: true, message: '不能输入空内容！' }]
              }
            }),
            copy: (src: any, tgt?: { value: any }) => {
              tgt = tgt || { value: '' }
              tgt.value = src.value || tgt.value
              return tgt
            }
          },
          props.mapper
        )
        cy.mount(TagList, {
          props: Object.assign({ 'onUpdate:value': cy.spy().as('onChange') }, props),
          slots
        })

        cy.get('button.ant-btn-dashed')
          .click()
          .wait(500)
          .get('form.ant-form .ant-form-item')
          .find('.ant-select')
          .click()
          .get('.ant-select-dropdown .ant-select-item')
          .should('have.length', 3)
          .eq(1)
          .click()
          .get('.ant-modal-footer button[type=submit]')
          .click()
          .wait(500)
          .get('.ant-tag')
          .should('have.length', 1)
          .should('have.text', '第二名')
          .get('.ant-tag')
          .eq(0)
          .children('span[aria-label=close]')
          .click()
      })

      it('带lblProp', () => {
        getCopy(
          Object.assign(
            {
              lblProp: 'cmp',
              lblMapper: Object.fromEntries(
                orgMapper.mapper.cmp.options.map((opn: any) => [opn.value, opn.label])
              )
            },
            orgMapper
          ),
          props.mapper
        )
        cy.mount(TagList, {
          props: Object.assign({ 'onUpdate:value': cy.spy().as('onChange') }, props),
          slots
        })

        cy.get('button.ant-btn-dashed')
          .click()
          .wait(500)
          .get('form.ant-form .ant-form-item')
          .should('have.length', 3)
          .each(($el, idx) => {
            const wrapper = cy.wrap($el)
            switch (idx) {
              case 0:
                wrapper.find('.ant-input', {}).should('exist').type('name')
                break
              case 1:
                wrapper
                  .find('.ant-select')
                  .should('exist')
                  .click()
                  .get('.ant-select-dropdown .ant-select-item')
                  .eq(2)
                  .click()
                break
              case 2:
                wrapper.find('textarea.ant-input').should('exist').type('opteacher')
                break
              default:
                cy.trigger('error')
            }
          })
          .wait(500)
          .get('.ant-modal-footer button[type=submit]')
          .click()
          .get('.ant-tag')
          .should('have.length', 1)
          .should('have.text', '存在于')
      })
    })
  })
})
