<script setup lang="ts">
import { ControlOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, reactive, ref, watch, createVNode } from 'vue'
import Component from '../types/compo'
import { useRoute } from 'vue-router'
import { typeDftVal } from '@/types'
import { createByFields } from '@/types/mapper'
import { setProp } from '@/utils'
import compos from '../compos.json'
import FormGroup from '@/components/FormGroup.vue'

const route = useRoute()
const rszLytX = ref(-1)
const attrWid = reactive([400, 400]) // 拖动前宽度；拖动后宽度
const compo = reactive(new Component())
const attrs = reactive({} as Record<string, any>)
const vmAttr = ref('')
const mapper = computed(() => createByFields(compo.props))
const rules = computed(() => Object.fromEntries(compo.props.map(prop => [prop.refer, prop.rules])))

onMounted(refresh)
watch(() => route.query.name, refresh)

async function refresh() {
  const cmpName = route.query.name as string
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
function onMouseMove(e: MouseEvent) {
  if (rszLytX.value !== -1) {
    attrWid[1] = attrWid[0] - (e.clientX - rszLytX.value)
  }
}
function onLytRszStart(e: MouseEvent) {
  rszLytX.value = e.clientX
  attrWid[0] = attrWid[1]
}
</script>

<template>
  <a-layout class="h-full" @mousemove="onMouseMove" @mouseup="() => (rszLytX = -1)">
    <a-layout-content class="p-3 overflow-auto">
      <keep-alive v-if="compo.name">
        <component :is="compo.name" v-bind="attrs" v-model:[vmAttr]="attrs[vmAttr]">
          <component
            v-if="compo.components.length"
            v-for="subCmp in compo.components"
            :key="subCmp.name"
            :is="subCmp.name"
          />
          <template v-else>{{ compo.inner }}</template>
        </component>
      </keep-alive>
    </a-layout-content>
    <a-button class="h-full px-0.5 hover:cursor-ew-resize" @mousedown="onLytRszStart" />
    <a-layout-sider class="h-full p-3 overflow-y-auto" theme="light" :width="attrWid[1]">
      <a-page-header
        title="状态栏"
        class="px-0 pt-0"
        :avatar="{ shape: 'square', icon: createVNode(ControlOutlined) }"
      />
      <FormGroup lbl-algn="left" :lbl-wid="5" :mapper="mapper" :form="attrs" :rules="rules" />
    </a-layout-sider>
  </a-layout>
</template>
