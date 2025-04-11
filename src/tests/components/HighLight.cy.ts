/// <reference path="../../../cypress/support/component.ts" />
import HighLight from '../../components/HighLight.vue'

const IdMark = 'div[data-v-app] mark'

describe('<HighLight />', () => {
  it('显示正常', () => {
    const ret = cy.mount(HighLight, {
      props: {
        text: `近未来，科学家们发现太阳急速衰老膨胀，短时间内包括地球在内的整个太阳系都将被太阳所吞没。
        为了自救，人类提出一个名为“流浪地球”的大胆计划，即倾全球之力在地球表面建造上万座发动机和转向发动机，
        推动地球离开太阳系，用2500年的时间奔往另外一个栖息之地。中国航天员刘培强（吴京 饰）在儿子刘启四岁
        那年前往国际空间站，和国际同侪肩负起领航者的重任。转眼刘启（屈楚萧 饰）长大，他带着妹妹朵朵（赵今麦 饰）
        偷偷跑到地表，偷开外公韩子昂（吴孟达 饰）的运输车，结果不仅遭到逮捕，还遭遇了全球发动机停摆的事件。
        为了修好发动机，阻止地球坠入木星，全球开始展开饱和式营救，连刘启他们的车也被强征加入。
        在与时间赛跑的过程中，无数的人前仆后继，奋不顾身，只为延续百代子孙生存的希望……`,
        search: '地球'
      }
    })

    cy.get(IdMark)
      .should('have.length.above', 0)
      .each($el =>
        cy
          .wrap($el)
          .should('have.css', 'background-color', 'rgb(255, 192, 105)')
          .should('have.text', '地球')
      )

    ret
      .then(({ wrapper }) => wrapper.setProps({ search: '太阳' }))
      .get(IdMark)
      .each($el => cy.wrap($el).should('not.have.text', '地球'))
  })
})
