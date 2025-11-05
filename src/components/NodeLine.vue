<template>
  <template v-if="node.previous.length">
    <line
      stroke-width="2"
      stroke="#f0f0f0"
      :x1="lineData.thx1"
      :y1="lineData.thy1"
      :x2="lineData.thx2"
      :y2="lineData.thy2"
    />
    <line
      stroke-width="2"
      stroke="#f0f0f0"
      :x1="lineData.tx1"
      :y1="lineData.ty1"
      :x2="lineData.tx2"
      :y2="lineData.ty2"
    />
  </template>
  <line
    v-if="!node.display"
    stroke-width="2"
    stroke="#f0f0f0"
    :x1="node.rect.cx"
    :y1="node.rect.y"
    :x2="node.rect.cx"
    :y2="node.rect.b"
  />
  <line
    stroke-width="2"
    stroke="#f0f0f0"
    :x1="lineData.bx1"
    :y1="lineData.by1"
    :x2="lineData.bx2"
    :y2="lineData.by2"
  />
  <line
    v-if="node.nexts.length"
    stroke-width="2"
    stroke="#f0f0f0"
    :x1="lineData.bhx1"
    :y1="lineData.bhy1"
    :x2="lineData.bhx2"
    :y2="lineData.bhy2"
  />
  <template v-for="key in untchNodes">
    <line
      v-if="direction === 'vertical'"
      stroke-width="2"
      stroke="#f0f0f0"
      :x1="ndDict[key].rect.cx"
      :y1="ndDict[key].rect.b + hlfGutter"
      :x2="ndDict[key].rect.cx"
      :y2="node.rect.y - hlfGutter"
    />
    <line
      v-if="direction === 'horizontal'"
      stroke-width="2"
      stroke="#f0f0f0"
      :x1="ndDict[key].rect.r + hlfGutter"
      :y1="ndDict[key].rect.cy"
      :x2="node.rect.x - hlfGutter"
      :y2="ndDict[key].rect.cy"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import Node from '../types/node'

const props = defineProps({
  direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'horizontal' },
  node: { type: Node, required: true },
  gutter: { type: Number, default: 100 },
  ndDict: { type: Object as PropType<Record<string, Node>>, required: true }
})
const hlfGutter = computed(() => props.gutter >> 1)
const lineData = computed(() => {
  const ncxs = props.node.nexts.map(key => key in props.ndDict ? props.ndDict[key].rect.cx : -1)
  const ncys = props.node.nexts.map(key => key in props.ndDict ? props.ndDict[key].rect.cy : -1)
  const pcxs = props.node.previous.map(key => key in props.ndDict ? props.ndDict[key].rect.cx : -1)
  const pcys = props.node.previous.map(key => key in props.ndDict ? props.ndDict[key].rect.cy : -1)
  if (props.direction === 'vertical') {
    return {
      tx1: props.node.rect.cx,
      tx2: props.node.rect.cx,
      ty1: props.node.rect.y - hlfGutter.value,
      ty2: props.node.rect.y,
      bx1: props.node.rect.cx,
      bx2: props.node.rect.cx,
      by1: props.node.rect.b,
      by2: props.node.rect.b + hlfGutter.value,
      thx1: props.node.previous.length ? Math.min(...pcxs) : 0,
      thx2: props.node.previous.length ? Math.max(...pcxs) : 0,
      thy1: props.node.rect.y - hlfGutter.value,
      thy2: props.node.rect.y - hlfGutter.value,
      bhx1: props.node.nexts.length ? Math.min(...ncxs) : 0,
      bhx2: props.node.nexts.length ? Math.max(...ncxs) : 0,
      bhy1: props.node.rect.b + hlfGutter.value,
      bhy2: props.node.rect.b + hlfGutter.value
    }
  } else if (props.direction === 'horizontal') {
    return {
      tx1: props.node.rect.x - hlfGutter.value,
      tx2: props.node.rect.x,
      ty1: props.node.rect.cy,
      ty2: props.node.rect.cy,
      bx1: props.node.rect.r,
      bx2: props.node.rect.r + hlfGutter.value,
      by1: props.node.rect.cy,
      by2: props.node.rect.cy,
      thx1: props.node.rect.x - hlfGutter.value,
      thx2: props.node.rect.x - hlfGutter.value,
      thy1: props.node.previous.length ? Math.min(...pcys) : 0,
      thy2: props.node.previous.length ? Math.max(...pcys) : 0,
      bhx1: props.node.rect.r + hlfGutter.value,
      bhx2: props.node.rect.r + hlfGutter.value,
      bhy1: props.node.nexts.length ? Math.min(...ncys) : 0,
      bhy2: props.node.nexts.length ? Math.max(...ncys) : 0
    }
  } else {
    return {
      tx1: 0, tx2: 0, ty1: 0, ty2: 0,
      bx1: 0, bx2: 0, by1: 0, by2: 0,
      thx1: 0, thx2: 0, thy1: 0, thy2: 0,
      bhx1: 0, bhx2: 0, bhy1: 0, bhy2: 0
    }
  }
})
const untchNodes = computed(() => {
  switch (props.direction) {
    case 'vertical':
      return props.node.previous.filter(key => 
        key in props.ndDict ? (props.node.rect.y - props.ndDict[key].rect.b > (props.gutter << 1)) : false
      )
    case 'horizontal':
      return props.node.previous.filter(key => 
        key in props.ndDict ? (props.node.rect.x - props.ndDict[key].rect.r > (props.gutter << 1)) : false
      )
  }
})
</script>