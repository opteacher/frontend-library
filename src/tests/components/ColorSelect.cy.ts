/// <reference path="../../../cypress/support/component.ts" />
import ColorSelect from '@/components/ColorSelect.vue'

const props: Record<string, any> = { color: '#FF00FF' }

function mount() {
  // see: https://test-utils.vuejs.org/guide/
  props['onUpdate:color'] = cy.spy().as('onColorChange')
  return cy.mount(ColorSelect, { props })
}

function rgb(r: number, g: number, b: number) {
  return (
    '#' +
    Math.floor(r).toString(16).toUpperCase().padStart(2, '0') +
    Math.floor(g).toString(16).toUpperCase().padStart(2, '0') +
    Math.floor(b).toString(16).toUpperCase().padStart(2, '0')
  )
}

function rgba(r: number, g: number, b: number, a: number) {
  const alpha = Math.floor(a * 256)
  if (alpha === 1) {
    return rgb(r, g, b)
  } else {
    return rgb(r, g, b) + alpha.toString(16).toUpperCase().padStart(2, '0')
  }
}

describe('<ColorSelect />', () => {
  beforeEach(mount)

  it('显示正常', () => {
    cy.get('.preset li').should('have.length.above', 0)
  })

  it('参数能否正常传入', () => {
    cy.get('.color-value .hex input')
      .should('have.value', '#FF00FF')
      .get('.color-value .rgba-r input')
      .should('have.value', '255')
      .get('.color-value .rgba-g input')
      .should('have.value', '0')
      .get('.color-value .rgba-b input')
      .should('have.value', '255')
  })

  it('颜色变化正常反馈', () => {
    cy.get('.saturation-value')
      .click(Math.random() * 200, Math.random() * 200)
      .get('@onColorChange')
      .should('have.been.called', cy.$$('.color-value .hex input').val())
  })

  describe('直接修改props不能影响子组件！', () => {
    it('修改props影响子组件（16进制字符串）', () => {
      mount().then(({ wrapper }) => wrapper.setProps({ color: '#FF0000' }))
      cy.get('.color-value .hex input').should('have.value', '#FF0000')
    })

    it('修改props影响子组件（三原色对象）', () => {
      const color = {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
        a: parseFloat(Math.random().toFixed(2))
      }
      mount().then(({ wrapper }) => wrapper.setProps({ color }))
      cy.get('.color-value .hex input').should(
        'have.value',
        rgba(color.r, color.g, color.b, color.a)
      )
    })
  })

  describe('saturation-value', () => {
    beforeEach(mount)

    it.skip('点击颜色发生变化', () => {})

    it('拖动无异常', () => {
      const width = cy.$$('.saturation-value').width() || 0
      const height = cy.$$('.saturation-value').height() || 0
      cy.get('.saturation-value')
        .trigger('mousedown', Math.random() * width, Math.random() * height)
        .trigger('mousemove', Math.random() * width, Math.random() * height)
        .trigger('mouseup')
    })
  })

  describe('color-select-middle', () => {
    beforeEach(mount)

    it('hue-slider调色无异常', () => {
      const orgHex = cy.$$('.color-value .hex input').val()
      const orgAlpha = cy.$$('.color-value .rgba-a input').val()

      const width = cy.$$('.color-select-middle .hue-slider').width() || 0
      const height = cy.$$('.color-select-middle .hue-slider').height() || 0

      cy.get('.color-select-middle .hue-slider')
        .click(Math.random() * width, height >> 1)
        .get('.color-value .hex input')
        .should('not.have.value', orgHex)
        .get('.color-value .rgba-a input')
        .should('have.value', orgAlpha)
    })

    it('alpha-slider调透明无异常', () => {
      const orgRed = cy.$$('.color-value .rgba-r input').val()
      const orgGreen = cy.$$('.color-value .rgba-g input').val()
      const orgBlue = cy.$$('.color-value .rgba-b input').val()
      const orgAlpha = cy.$$('.color-value .rgba-a input').val()

      const width = cy.$$('.color-select-middle .alpha-slider').width() || 0
      const height = cy.$$('.color-select-middle .alpha-slider').height() || 0

      cy.get('.color-select-middle .alpha-slider')
        .click(Math.random() * width, height >> 1)
        .get('.color-value .rgba-r input')
        .should('have.value', orgRed)
        .get('.color-value .rgba-g input')
        .should('have.value', orgGreen)
        .get('.color-value .rgba-b input')
        .should('have.value', orgBlue)
        .get('.color-value .rgba-a input')
        .should('not.have.value', orgAlpha)
    })

    it('color-diamond显示正常', () => {
      const orgBkgd = cy.$$('.color-diamond div:first').css('background-color')
      const satWid = cy.$$('.saturation-value').width() || 0
      const satHgt = cy.$$('.saturation-value').height() || 0
      const midWid = cy.$$('.color-select-middle .hue-slider').width() || 0
      const midHgt = cy.$$('.color-select-middle .hue-slider').height() || 0
      cy.get('.saturation-value')
        .click(Math.floor(satWid * Math.random()), Math.floor(satHgt * Math.random()))
        .get('.color-diamond div:first')
        .should('not.have.css', 'background-color', orgBkgd)
        .get('.color-value .hex input')
        .clear()
        .type(eval(orgBkgd))
        .get('.color-select-middle .hue-slider')
        .click(Math.random() * midWid, midHgt >> 1)
        .should('not.have.css', 'background-color', orgBkgd)
        .get('.color-value .hex input')
        .clear()
        .type(eval(orgBkgd))
        .get('.color-select-middle .alpha-slider')
        .click(Math.random() * midWid, midHgt >> 1)
        .should('not.have.css', 'background-color', orgBkgd)
        .get('.color-value .hex input')
        .clear()
        .type(eval(orgBkgd))
    })
  })

  describe('color-value', () => {
    beforeEach(mount)

    it('修改hex，props.color和color-diamond背景颜色一致', () => {
      cy.get('.color-value .hex input')
        .clear()
        .type(rgb(Math.random() * 256, Math.random() * 256, Math.random() * 256))
        .get('@onColorChange')
        .should('have.been.called', eval(cy.$$('.color-diamond div:first').css('background-color')))
    })

    it('修改red，props.color和color-diamond背景颜色一致', () => {
      cy.get('.color-value .rgba-r input')
        .clear()
        .type(Math.floor(Math.random() * 256).toString())
        .get('@onColorChange')
        .should('have.been.called', eval(cy.$$('.color-diamond div:first').css('background-color')))
    })

    it('green.color和color-diamond背景颜色一致', () => {
      cy.get('.color-value .rgba-g input')
        .clear()
        .type(Math.floor(Math.random() * 256).toString())
        .get('@onColorChange')
        .should('have.been.called', eval(cy.$$('.color-diamond div:first').css('background-color')))
    })

    it('修改blue，props.color和color-diamond背景颜色一致', () => {
      cy.get('.color-value .rgba-b input')
        .clear()
        .type(Math.floor(Math.random() * 256).toString())
        .get('@onColorChange')
        .should('have.been.called', eval(cy.$$('.color-diamond div:first').css('background-color')))
    })

    it('修改alpha，props.color和color-diamond背景颜色一致', () => {
      cy.get('.color-value .rgba-a input')
        .clear()
        .type(Math.random().toFixed(2).toString())
        .get('@onColorChange')
        .should('have.been.called', eval(cy.$$('.color-diamond div:first').css('background-color')))
    })
  })

  describe('preset', () => {
    describe('修改preset，同步变化', () => {
      it('随机生成三个颜色', () => {
        const gen256 = () => Math.floor(Math.random() * 256)
        const preset = Array.from({ length: 3 }, () => `rgb(${gen256()}, ${gen256()}, ${gen256()})`)
        mount().then(({ wrapper }) => wrapper.setProps({ preset: preset.map(color => eval(color)) }))
        cy.get('.preset li').should('have.length', 3)
        cy.get('.preset li').each(($el, idx) => {
          cy.wrap($el).should('have.css', 'background-color', preset[idx])
        })
      })
    })

    it('选择预设颜色', () => {
      mount()
      const pstNum = cy.$$('.preset li').length
      const selIdx = Math.floor(pstNum * Math.random())
      cy.get('.preset li')
        .eq(selIdx)
        .click()
        .get('.color-value .hex input')
        .should('have.value', eval(cy.$$('.preset li').eq(selIdx).css('background-color')))
    })
  })
})
