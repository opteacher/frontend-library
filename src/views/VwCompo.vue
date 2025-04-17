<script setup lang="ts">
import { ControlOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, reactive, ref, watch, createVNode } from 'vue'
import Component from '../types/compo'
import { useRoute } from 'vue-router'
import { typeDftVal } from '@/types'
import { createByFields } from '@/types/mapper'
import { gnlCpy, setProp } from '@/utils'
import compos from '../compos.json'
import FormGroup from '@/components/FormGroup.vue'
import { fieldsDftVals } from '@/types/field'
import FlexDivider from '@/components/FlexDivider.vue'
import { TinyEmitter } from 'tiny-emitter'
import _ from 'lodash'

const route = useRoute()
const attrWid = ref(400) // 拖动前宽度；拖动后宽度
const emitter = new TinyEmitter()
const compo = reactive(new Component())
const attrs = reactive({} as Record<string, any>)
const vmAttr = ref('')
const mapper = computed(() => createByFields(compo.props))
const rules = computed(() => Object.fromEntries(compo.props.map(prop => [prop.refer, prop.rules])))

onMounted(refresh)
watch(() => route.params.name, refresh)

async function refresh() {
  const cmpName = route.params.name as string
  if (!cmpName) {
    return
  }
  const result = compos[cmpName as keyof typeof compos]
  if (!result) {
    return
  }
  Component.copy({ name: cmpName, ...result }, compo, true)
  for (const key in attrs) {
    delete attrs[key.substring(key.indexOf('.') !== -1 ? key.indexOf('.') : 0)]
  }
  for (const prop of compo.props) {
    if (prop.vModel) {
      vmAttr.value = prop.refer
    }
    setProp(attrs, prop.refer, prop.default || typeDftVal(prop.vtype))
  }
}
function onAttrsSave() {
  console.log(attrs)
}
function onFormUpdate(values: Record<string, any>) {
  gnlCpy(() => fieldsDftVals(compo.props), values, attrs)
}
</script>

<template>
  <a-layout
    class="h-full"
    @mousemove="(e: MouseEvent) => emitter.emit('mousemove', e)"
    @mouseup="() => emitter.emit('mouseup')"
  >
    <a-layout-content class="p-3 overflow-auto">
      <keep-alive v-if="compo.name">
        <component :is="compo.name" v-bind="attrs" v-model:[vmAttr]="attrs[vmAttr]">
          <template v-if="!compo.components.length">{{ compo.inner }}</template>
          <template v-for="cmp in compo.components" :key="cmp.name" #[cmp.slot]="params">
            <component
              :is="cmp.name"
              v-bind="Object.fromEntries(cmp.props.map(p => [p.refer, params[p.default]]))"
              v-on="Object.fromEntries(cmp.props.filter(p => p.vOn).map(p => [p.refer, p.default]))"
            />
          </template>
        </component>
      </keep-alive>
    </a-layout-content>
    <FlexDivider orientation="vertical" v-model:widHgt="attrWid" :emitter="emitter" />
    <a-layout-sider class="h-full p-3 overflow-y-auto" theme="light" :width="attrWid">
      <a-page-header
        title="状态栏"
        class="px-0 pt-0"
        :avatar="{ shape: 'square', icon: createVNode(ControlOutlined) }"
      >
        <template #extra>
          <a-button type="primary" @click="onAttrsSave">保存</a-button>
        </template>
      </a-page-header>
      <FormGroup
        lbl-algn="left"
        :lbl-wid="5"
        :mapper="mapper"
        :form="attrs"
        :rules="rules"
        @update:fprop="onFormUpdate"
      />
    </a-layout-sider>
  </a-layout>
</template>
