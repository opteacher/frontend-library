<template>
  <a-card
    :id="node.key"
    class="absolute"
    :headStyle="{
      backgroundColor: node.color
    }"
    :size="size"
    hoverable
    :style="{
      width: width + 'px',
      top: node.rect.y + 'px',
      left: node.rect.x + 'px'
    }"
    @click="() => emit('card-click', node)"
  >
    <template #title>
      <a-typography-title class="text-white mb-0" :level="5">
        <KeepAlive>
          <component :is="getProp(antdIcon, node.icon)" />
        </KeepAlive>
        {{ node.title }}
      </a-typography-title>
    </template>
    <template #extra>
      <a-dropdown>
        <a class="ant-dropdown-link text-white text-xl rounded border hover:border-solid border-white" @click.prevent>
          <antdIcon.MoreOutlined />
        </a>
        <template #overlay>
          <a-menu @click="({ key }: any) => key === 'delete' ? emit('del-click', node) : undefined">
            <a-menu-item key="delete" class="text-[#ff4d4f]">
              <template #icon><antdIcon.DeleteOutlined /></template>
              删除
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
    <pre v-if="node.desc">{{ node.desc }}</pre>
    <a-typography-text v-else type="secondary">输入描述</a-typography-text>
  </a-card>
  <a-button
    class="absolute"
    type="primary"
    shape="circle"
    :style="{
      top: addBtnDict[direction].t - 16 + 'px',
      left: addBtnDict[direction].l - 16 + 'px'
    }"
    @click="() => emit('add-click', node)"
  >
    <template #icon><antdIcon.PlusOutlined /></template>
  </a-button>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import Node from '../types/node'
import * as antdIcon from '@ant-design/icons-vue'
import { getProp } from '../utils'

const emit = defineEmits(['card-click', 'add-click', 'del-click'])
const props = defineProps({
  direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'horizontal' },
  size: { type: String  as PropType<'default' | 'small'>, default: 'default' },
  node: { type: Node, required: true },
  width: { type: Number, default: 300 },
  gutter: { type: Number, default: 100 }
})
const addBtnDict = computed(() => ({
  vertical: {
    t: props.node.rect.b + (props.gutter >> 1),
    l: props.node.rect.cx
  },
  horizontal: {
    t: props.node.rect.cy,
    l: props.node.rect.r + (props.gutter >> 1)
  }
}))
</script>