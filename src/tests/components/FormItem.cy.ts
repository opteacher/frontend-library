/// <reference path="../../../cypress/support/component.ts" />
import FormItem from '@/components/FormItem.vue'
import Field from '@/types/field'
import { createByField, getCopy } from '@/types/mapper'
import { bsTpDefault, CompoType } from '../types'
import Model from '../types/model'
import Project from '../types/project'
import { v4 } from 'uuid'
import { reactive } from 'vue'

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

const jsonFile = 'src/tests/resources/StockCrawler.json'

describe('<FormItem />', () => {
  it('正常显示', () => {
    cy.readFile(jsonFile, 'utf8').then(project => {
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
    cy.readFile(jsonFile, 'utf8').then(project => {
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
      }).then(({ wrapper }) => {
        cy.get('.ant-select')
          .click()
          .get('.ant-select-dropdown')
          .should('not.have.css', 'display', 'none')
          .find('.ant-select-item')
          .should('have.length', 3)
          .eq(2)
          .click()
          .then(() => expect(wrapper.vm.formState).have.property('value', 'shenzhen'))
      })
    })
  })
})
