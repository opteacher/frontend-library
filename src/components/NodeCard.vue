<template>
  <a-card
    :id="node.key"
    class="absolute w-80"
    :size="size"
    hoverable
    :style="{
      top: node.rect.y + 'px',
      left: node.rect.x + 'px'
    }"
    @click="() => emit('card-click', node)"
  >
    <template #title>
      <a-typography-title :level="5">{{ node.title }}</a-typography-title>
    </template>
    <template #extra><a href="#">more</a></template>
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
    <template #icon><PlusOutlined /></template>
  </a-button>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import Node from '../types/node'
import { PlusOutlined } from '@ant-design/icons-vue'

const emit = defineEmits(['card-click', 'add-click'])
const props = defineProps({
  direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'horizontal' },
  size: { type: String  as PropType<'default' | 'small'>, default: 'default' },
  node: { type: Node, required: true },
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