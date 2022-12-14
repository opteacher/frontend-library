<script setup lang="ts">
import { ControlOutlined } from '@ant-design/icons-vue'
import { computed, reactive, watch } from 'vue'
import Component from '../types/compo'
import apis from '../apis'
import { useRoute } from 'vue-router'
import { bsTpDefault } from '@/types'
import FormItem from '../components/FormItem.vue'
import Mapper from '@/types/mapper'

const route = useRoute()
const compo = reactive(new Component())
const attrs = reactive({} as Record<string, any>)
const mapper = computed(() => Mapper.createByFields(compo.props))

watch(() => route.query.name, refresh)

async function refresh() {
  const cmpName = route.query.name as string
  if (!cmpName) {
    return
  }
  const result = await apis.component.get(cmpName)
  if (!result) {
    return
  }
  Component.copy(result, compo)
  for (const prop of compo.props) {
    attrs[prop.refer] = prop.default || bsTpDefault(prop.vtype)
  }
}
</script>

<template>
  <a-layout class="h-full">
    <a-layout-content class="p-3">
      <keep-alive v-if="compo.name">
        <component :is="compo.name" v-bind="attrs">
          {{ compo.inner }}
        </component>
      </keep-alive>
    </a-layout-content>
    <a-layout-sider class="h-full p-3" theme="light" width="20vw">
      <a-space class="mb-3" align="center">
        <control-outlined class="text-xl" />
        <h1 class="text-xl font-bold">状态栏</h1>
      </a-space>
      <a-form :model="attrs" :label-col="{ span: 6 }">
        <FormItem
          v-for="prop in compo.props"
          :key="prop.key"
          class="mb-3"
          :form="attrs"
          :skey="prop.refer"
          :value="mapper[prop.refer]"
        />
      </a-form>
    </a-layout-sider>
  </a-layout>
</template>
