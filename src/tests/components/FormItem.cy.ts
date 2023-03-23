/// <reference path="../../../cypress/support/component.ts" />
import FormItem from '@/components/FormItem.vue'
import Field from '@/types/field'
import { createByField, getCopy } from '@/types/mapper'
import { bsTpDefault, CompoType } from '../types'
import Model from '../types/model'
import Project from '../types/project'
import { v4 } from 'uuid'
import { reactive } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { setProp } from '@/utils'
import { TinyEmitter as Emitter } from 'tiny-emitter'

const fieldMapper = {
  Text: '文本框',
  Block: '块',
  FormDialog: '.ant-modal',
  FormGroup: '.ant-form',
  FormItem: '.ant-form-item',
  Input: '.ant-input',
  Password: '.ant-input-password',
  IconField: 'button.w-full',
  Number: '.ant-input-number',
  Button: '.ant-button',
  Select: '.ant-select',
  DateTime: '.ant-picker-input',
  Checkbox: '.ant-checkbox',
  Switch: '.ant-switch',
  Table: '可编辑表',
  Textarea: 'textarea.ant-input',
  Delable: '可删除',
  SelOrIpt: '可选可输入',
  UploadFile: '上传',
  Cascader: '.ant-cascader',
  ListSelect: '.ant-list',
  TagList: 'button.ant-btn-dashed',
  CodeEditor: '.ace_content',
  EditList: 'button.ant-btn-background-ghost',
  Carousel: '滚动展示框',
  Row: '横向容器',
  Col: '纵向容器',
  Card: '卡片',
  Image: '图片',
  Unknown: '未知'
}

describe('<FormItem />', () => {
  it('正常显示', () => {
    cy.readFile('src/tests/resources/StockCrawler.json', 'utf8').then(project => {
      const model = project.models[0]
      const field = model.form.fields[0]
      cy.mount(FormItem, {
        props: {
          form: Object.fromEntries(
            model.props.map((prop: any) => [prop.name, bsTpDefault(prop.ptype)])
          ),
          skey: field.refer,
          value: createByField(Field.copy(field)),
          'onUpdate:value': cy.spy().as('onUpdate')
        }
      })

      cy.get('.ant-form-item-label')
        .should('contain.text', field.label)
        .get('.ant-form-item-control')
        .find(fieldMapper[field.ftype as CompoType])
        .should('exist')
    })
  })

  it('子 -> 父', () => cy.log('操作表单组件不会触发反馈'))

  it('父 -> 子', () => {
    cy.readFile('src/tests/resources/StockCrawler.json', 'utf8').then(project => {
      const model = Project.copy(project).models.find(mdl => mdl.name === 'stock') as Model
      const field = model.form.fields.find(fld => fld.refer === 'code') as Field
      const form = reactive(
        Object.fromEntries(model.props.map((prop: any) => [prop.name, bsTpDefault(prop.ptype)]))
      )
      const text = v4()
      cy.mount(FormItem, {
        props: {
          form,
          skey: field.refer,
          value: createByField(Field.copy(field))
        }
      })
        .then(({ wrapper }) => {
          form['code'] = text
          wrapper.setProps({ form })
        })
        .get('.ant-form-item-control input')
        .should('have.value', text)
    })
  })

  describe('测试各个组件是否正常', () => {
    it('<Select />', () => {
      cy.mount(FormItem, {
        props: {
          form: { value: '' },
          skey: 'value',
          value: getCopy({
            label: '选择框',
            type: 'Select',
            options: [
              { label: '上海', value: 'shanghai' },
              { label: '北京', value: 'beijing' },
              { label: '深圳', value: 'shenzhen' }
            ]
          })
        }
      }).then(({ component }) => {
        cy.get('.ant-select')
          .should('exist')
          .click()
          .get('.ant-select-dropdown')
          .should('not.have.css', 'display', 'none')
          .find('.ant-select-item')
          .should('have.length', 3)
          .eq(2)
          .click()
          .then(() => expect(component.formState).property('value', 'shenzhen'))
      })
    })

    it('<Number />', () => {
      cy.mount(FormItem, {
        props: {
          form: { value: '' },
          skey: 'value',
          value: getCopy({
            label: '数字框',
            type: 'Number'
          })
        }
      }).then(({ component }) => {
        const num = Math.random() * 1000
        cy.get('.ant-input-number input')
          .should('exist')
          .type(num.toString())
          .then(() => expect(component.formState).property('value', num))
      })
    })

    it('<Password />', () => {
      cy.mount(FormItem, {
        props: {
          form: { value: '' },
          skey: 'value',
          value: getCopy({
            label: '密码框',
            type: 'Password'
          })
        }
      }).then(({ component }) => {
        const text = v4()
        cy.get('.ant-input-password input')
          .should('exist')
          .type(text)
          .should('have.value', text)
          .then(() => expect(component.formState).property('value', text))
      })
    })

    it('<DateTime />', () => {
      const DtTmFmt = 'DD/MM/YYYY'
      const form = reactive({ value: dayjs() })
      cy.mount(FormItem, {
        props: {
          form,
          skey: 'value',
          value: getCopy({
            label: '日期时间',
            type: 'DateTime'
          }),
          'onUpdate:value': (value: Dayjs) => {
            setProp(form, 'value', value)
          }
        }
      }).then(({ component }) => {
        cy.get('.ant-picker-input')
          .click()
          .get('.ant-picker-dropdown')
          .should('exist')
          .get('.ant-picker-content td.ant-picker-cell-in-view')
          .should('have.length.above', 0)
          .then($els => cy.wrap($els[Math.floor(Math.random() * $els.length)]))
          .click()
          .then($el => {
            const selDtTm = dayjs($el.attr('title'))
            cy.get(
              [
                '.ant-picker-panel-container',
                '.ant-picker-footer',
                '.ant-picker-ok',
                'button'
              ].join(' ')
            )
              .should('exist')
              .click()
              .then({ timeout: 1000 }, () =>
                expect(component.formState.value.format(DtTmFmt)).eq(selDtTm.format(DtTmFmt))
              )
          })
      })
    })

    it('<Textarea />', () => {
      const text = v4()
      cy.mount(FormItem, {
        props: {
          form: { value: '' },
          skey: 'value',
          value: getCopy({
            label: '多行文本框',
            type: 'Textarea'
          })
        }
      }).then(({ component }) => {
        cy.get('textarea.ant-input')
          .should('exist')
          .type(text)
          .then(() => expect(component.formState).property('value', text))
      })
    })

    it('<Checkbox />', () => {
      const value = false
      cy.mount(FormItem, {
        props: {
          form: { value },
          skey: 'value',
          value: getCopy({
            label: '多项选择框',
            type: 'Checkbox',
            chkLabels: ['假', '真']
          })
        }
      }).then(({ component }) => {
        cy.get('.ant-checkbox-wrapper')
          .should('exist')
          .then($el =>
            cy
              .wrap($el)
              .children('span')
              .should('have.length', 2)
              .eq(1)
              .should('contain.text', '假')
              .then(() => cy.wrap($el))
          )
          .then($el =>
            cy
              .wrap($el)
              .find('.ant-checkbox input[type=checkbox]')
              .should('exist')
              .click()
              .check()
              .then(() => cy.wrap($el))
          )
          .then($el => {
            cy.wrap($el).children('span').eq(1).should('contain.text', '真')
          })
          .then(() => expect(component.formState).property('value', !value))
      })
    })

    it('<Switch />', () => {
      const value = false
      cy.mount(FormItem, {
        props: {
          form: { value },
          skey: 'value',
          value: getCopy({
            label: '单项选择框',
            type: 'Switch',
            chkLabels: ['假', '真']
          })
        }
      }).then(({ component }) => {
        cy.get('.ant-switch')
          .should('exist')
          .then($el =>
            cy
              .wrap($el)
              .children('.ant-switch-inner')
              .should('exist')
              .should('contain.text', '假')
              .then(() => cy.wrap($el))
          )
          .click()
          .then($el =>
            cy
              .wrap($el)
              .children('.ant-switch-inner')
              .should('exist')
              .should('contain.text', '真')
              .then(() => cy.wrap($el))
          )
          .then(() => expect(component.formState).property('value', !value))
      })
    })

    it('<Cascader />', () => {
      cy.readFile('src/tests/resources/CascaderOptions.json', 'utf8').then(fileData => {
        cy.mount(FormItem, {
          props: {
            form: { value: [] },
            skey: 'value',
            value: getCopy({
              label: '多级选择框',
              type: 'Cascader',
              options: fileData.data
            })
          }
        }).then(({ component }) => {
          const selected: string[] = []
          cy.get('.ant-select')
            .should('exist')
            .click()
            .get('.ant-cascader-dropdown .ant-cascader-menus')
            .should('exist')
            .then($el => {
              cy.wrap($el)
                .children('.ant-cascader-menu')
                .should('have.length', 1) // 仅在第一层，未显示区
                .children('.ant-cascader-menu-item')
                .should('have.length', 2) // 上海 + 北京 = 2
                .eq(Math.floor(Math.random() * 2))
                .click() // 点击【上海市】
                .then(() =>
                  cy
                    .wrap($el)
                    .children('.ant-cascader-menu')
                    .should('have.length', 2) // 展开第二层，显示区
                    .eq(1)
                    .then($el => cy.wrap($el))
                )
                .children('.ant-cascader-menu-item')
                .should('have.length.above', 0) // 有多个区
                .then($els =>
                  cy
                    .wrap($els)
                    .eq(Math.floor(Math.random() * $els.length))
                    .click()
                    .then($sel => {
                      selected.splice(
                        0,
                        selected.length,
                        ...($sel.attr('data-path-key') as string)
                          .trim()
                          .split('__RC_CASCADER_SPLIT__')
                      )
                    })
                )
                .get('.ant-cascader-dropdown')
                .should('have.css', 'display', 'none')
                .then(() => expect(component.formState.value.join('/')).eq(selected.join('/')))
            })
        })
      })
    })

    it('<Button />', () => {
      const emitter = new Emitter()
      cy.mount(FormItem, {
        props: {
          form: { value: [] },
          skey: 'value',
          value: getCopy({
            label: '按钮',
            type: 'Button',
            inner: '点一下',
            onClick: () => {
              emitter.emit('click')
            }
          })
        }
      })
      emitter.on('click', cy.spy().as('onClick'))
      cy.get('button.ant-btn')
        .should('exist')
        .should('contain.text', '点一下')
        .click()
        .get('@onClick')
        .should('be.called')
    })
  })
})
