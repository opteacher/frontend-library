/// <reference path="../../../cypress/support/component.ts" />
import CodeEditor from '@/components/CodeEditor.vue'

describe('<CodeEditor />', () => {
  describe('正常显示', () => {
    beforeEach(function () {
      this['instance'] = cy.mount(CodeEditor, {
        props: {
          value: '',
          'onUpdate:value': cy.spy().as('onCodeChange')
        }
      })
    })

    it('子 -> 父：子组件的操作结果反馈到父组件', function () {
      cy.get('.ace_content')
        .type('function add (a, b) {\nconsole.log(a + b)')
        .should('have.text', 'function add (a, b) {  console.log(a + b)}')
        .get('@onCodeChange')
        .should('be.called', 'function add (a, b) {  console.log(a + b)}')
    })

    it('父 -> 子：父组件props发生更新，子组件自动更新', function () {
      this['instance']
        .then(({ wrapper }: any) => wrapper.setProps({ value: "console.log('abcd')" }))
        .get('.ace_content')
        .should('have.text', "console.log('abcd')")
    })
  })

  it.skip('绑定对象', () => {
    const value = { a: 1, b: true }
    cy.mount(CodeEditor, {
      props: {
        lang: 'json',
        value,
        'onUpdate:value': cy.spy().as('onCodeChange')
      }
    })
    cy.get('.ace_content')
      .type('{backspace},c: "aaaa" }')
      .get('@onCodeChange')
      .should('be.called', JSON.stringify(Object.assign({ c: 'aaaa' }, value)))
  })
})
