<template>
  <a-button class="w-full" :disabled="disabled" @click="visible = true">
    <template #icon>
      <keep-alive v-if="icon">
        <component :is="getIconCompo(icon)" />
      </keep-alive>
    </template>
    {{ icon || '请选择图标' }}
  </a-button>
  <a-modal v-model:open="visible" title="选择图标" width="60vw" @ok="onIconSelect">
    <a-form-item-rest>
      <a-input v-model:value="search" placeholder="筛选图标" />
    </a-form-item-rest>
    <a-tabs v-model:activeKey="selTab">
      <a-tab-pane key="ant-design" tab="ant图表库">
        <a-row v-for="group in icons.slice(begIdx, begIdx + 4)" :key="group[0]">
          <a-col
            :span="6"
            class="text-center hover:bg-gray-300 border-2 border-solid py-2 cursor-pointer"
            :class="selIcon === icon ? 'border-primary' : 'border-white'"
            v-for="icon of group"
            :key="icon"
            @click="selIcon = icon"
          >
            <keep-alive>
              <component :is="getIconCompo(icon)" v-bind="{ class: 'text-4xl' }" />
            </keep-alive>
            <p class="mb-0">{{ icon }}</p>
          </a-col>
        </a-row>
        <a-divider />
        <div class="flex justify-between items-center">
          <div>
            选中图标：
            <a>{{ selIcon }}</a>
          </div>
          <a-pagination
            v-if="pages.num"
            v-model:current="pages.cur"
            :total="pages.num"
            show-less-items
          />
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script lang="ts" setup name="IconField">
import { computed, onMounted, reactive, ref, watch, type Component } from 'vue'
import * as antdIcons from '@ant-design/icons-vue/lib/icons'

const iconsMapper = {
  'ant-design': antdIcons
}
const emit = defineEmits(['update:icon'])
defineProps({
  icon: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const visible = ref(false)
const search = ref('')
const selTab = ref('ant-design' as keyof typeof iconsMapper)
const icons = reactive([] as string[][])
const pages = reactive({
  num: 0,
  cur: 1
})
const selIcon = ref('')
const begIdx = computed(() => (pages.cur - 1) << 2)

onMounted(refresh)
watch(() => search.value, refresh)

function refresh() {
  let iconsLibs = Object.keys(iconsMapper[selTab.value])
  if (search.value) {
    iconsLibs = iconsLibs.filter((icnKey: string) => icnKey.toLowerCase().includes(search.value))
  }
  icons.splice(0, icons.length)
  for (let i = 0; i < iconsLibs.length; i += 4) {
    const group = [iconsLibs[i]]
    if (i + 1 < iconsLibs.length) {
      group.push(iconsLibs[i + 1])
    }
    if (i + 2 < iconsLibs.length) {
      group.push(iconsLibs[i + 2])
    }
    if (i + 3 < iconsLibs.length) {
      group.push(iconsLibs[i + 3])
    }
    icons.push(group)
  }
  if (icons.length > 4) {
    pages.num = icons.length
    pages.cur = 1
  } else {
    pages.num = 0
    pages.cur = 1
  }
}
function onIconSelect() {
  emit('update:icon', selIcon.value)
  visible.value = false
}
function getIconCompo(name: string): Component {
  return (iconsMapper[selTab.value] as Record<string, Component>)[name]
}
</script>

<style scoped>
:deep(.ant-pagination-options) {
  display: none !important;
}
</style>
