<script setup lang="ts">
import { ControlOutlined } from '@ant-design/icons-vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Component from '../types/compo'
import apis from '../apis'
import { useRoute } from 'vue-router'
import { bsTpDefault } from '@/types'
import FormItem from '../components/FormItem.vue'
import { createByFields } from '@/types/mapper'
import { setProp } from '@/utils'

const route = useRoute()
const compo = reactive(new Component())
const attrs = reactive({} as Record<string, any>)
const vmAttr = ref('')
const mapper = computed(() => createByFields(compo.props))

onMounted(refresh)
watch(() => route.query.name, refresh)

async function refresh() {
  const cmpName = route.query.name as string
  if (!cmpName) {
    return
  }
  // if (cmpName === 'FormDialog') {
  //   router.push('/' + cmpName)
  // }
  const result = await apis.component.get(cmpName)
  if (!result) {
    return
  }
  Component.copy(result, compo, true)
  for (const key in attrs) {
    delete attrs[key.substring(key.indexOf('.') !== -1 ? key.indexOf('.') : 0)]
  }
  for (const prop of compo.props) {
    if (prop.vModel) {
      vmAttr.value = prop.refer
    }
    setProp(attrs, prop.refer, prop.default || bsTpDefault(prop.vtype))
  }
}
</script>

<template>
  <a-layout class="h-full">
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
    <a-layout-sider class="h-full p-3 overflow-y-auto" theme="light" width="30vw">
      <a-space class="mb-3" align="center">
        <control-outlined class="text-xl" />
        <h1 class="text-xl font-bold">状态栏</h1>
      </a-space>
      <a-form :model="attrs" :label-col="{ span: 6 }">
        <template v-for="(value, key) in mapper" :key="key">
          <div v-if="value.type === 'FormGroup'" class="border pt-5 px-2.5 my-5 relative rounded">
            <p
              class="absolute bg-white text-gray-300 text-base left-1.5 -top-2.5"
            >
              {{ value.label }}
            </p>
            <FormItem
              v-for="(v, k) in (value.items as Record<string, any>)"
              :key="k"
              class="mb-3"
              :form="attrs"
              :skey="k"
              :mapper="(v as Object)"
            />
          </div>
          <FormItem v-else class="mb-3" :form="attrs" :skey="(key as string)" :mapper="value" />
        </template>
      </a-form>
    </a-layout-sider>
  </a-layout>
</template>
