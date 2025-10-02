<template>
  <div id="dsgnPanel" class="flex-1 relative overflow-auto mx-5">
    <a-button
      v-if="!nodes.length"
      class="absolute"
      type="primary"
      shape="circle"
      :style="emptyAddBtn"
      @click="() => onNodeClick('add')"
    >
      <template #icon><PlusOutlined /></template>
    </a-button>
    <template v-for="node in nodes">
      <NodeCard
        :direction="direction"
        :node="node"
        :gutter="gutter"
        :size="size"
        @card-click="() => onNodeClick('node', node)"
        @add-click="() => onNodeClick('add', node)"
      />
    </template>
    <svg class="absolute top-0 left-0 bottom-0 right-0 z-[-1]" width="100%" height="100%">
      <NodeLine
        v-for="node in nodes"
        :direction="direction"
        :node="node"
        :ndDict="ndDict"
        :gutter="gutter"
      />
    </svg>
  </div>
  <FormDialog
    title="编辑节点"
    :mapper="mapper"
    :emitter="emitter"
    :newFun="() => newOne(Node)"
    @submit="onEdtNdSubmit"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef, type PropType, nextTick } from 'vue'
import Node from '../types/node'
import { getProp, newOne, waitFor } from '../utils'
import NodeCard from './NodeCard.vue'
import NodeLine from './NodeLine.vue'
import FormDialog from './FormDialog.vue'
import Mapper from '../types/mapper'
import { TinyEmitter } from 'tiny-emitter'
import { PlusOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
  size: { type: String  as PropType<'default' | 'small'>, default: 'default' },
  nodes: { type: Array as PropType<Node[]>, required: true },
  mapper: {
    type: Mapper,
    default: () => new Mapper({
      title: {
        type: 'Input',
        label: '标题'
      },
      color: {
        type: 'ColorSelect',
        label: '颜色'
      }
    })
  }
})
const emit = defineEmits(['update:nodes'])
const ndDict = computed<Record<string, Node>>(() =>
  Object.fromEntries(props.nodes.map(node => [node.key, node]))
)
const gutter = ref(100)
const nodes = toRef(props.nodes)
const rsxObs = new ResizeObserver(() => refresh())
const dirDict = { vertical: 'width', horizontal: 'height' } as Record<'vertical' | 'horizontal', 'width' | 'height'>
const emitter = new TinyEmitter()
const pnlRect = ref<DOMRect>()
const emptyAddBtn = computed(() => {
  if (props.direction === 'vertical') {
    return {
      top: '0px',
      left: pnlRect.value ? (pnlRect.value?.width >> 1) + 'px' : '0px'
    }
  } else if (props.direction === 'horizontal') {
    return {
      top: pnlRect.value ? (pnlRect.value?.height >> 1) + 'px' : '0px',
      left: '0px'
    }
  } else {
    return {
      top: '0px',
      left: '0px'
    }
  }
})

onMounted(() => refresh(true))

async function refresh(force = false) {
  const panel = await waitFor('dsgnPanel')
  if (force) {
    rsxObs.observe(panel as HTMLElement)
  }
  pnlRect.value = panel?.getBoundingClientRect() as DOMRect
  if (!props.nodes.length) {
    return
  }
  const root = props.nodes[0]
  root.rect.sxy = 0
  root.rect.swh = getProp(pnlRect.value, dirDict[props.direction])
  for (let queue = [root.key], level = 0; queue.length; ++level) {
    const qlen = queue.length
    for (let i = 0; i < qlen; ++i) {
      const node = ndDict.value[queue.shift() as string]
      const ele = await waitFor(node.key) as HTMLElement
      node.rect.w = ele.clientWidth
      node.rect.h = ele.clientHeight
      if (props.direction === 'vertical') {
        node.rect.cx = getNodeCenPos(node)
        node.rect.x = node.rect.cx - (ele.clientWidth >> 1)
        node.rect.y = (gutter.value + ele.clientHeight) * level
        node.rect.cy = node.rect.y + (gutter.value >> 1)
      } else if (props.direction === 'horizontal') {
        node.rect.cy = getNodeCenPos(node)
        node.rect.y = node.rect.cy - (ele.clientHeight >> 1)
        node.rect.x = (gutter.value + ele.clientWidth) * level
        node.rect.cx = node.rect.x + (gutter.value >> 1)
      }
      node.rect.r = node.rect.x + node.rect.w
      node.rect.b = node.rect.y + node.rect.h
      queue.push(...node.nexts)
    }
  }
}
function getNodeCenPos(node: Node) {
  if (node.previous.length) {
    // 遍历所有父节点，并得出每个父节点给予该节点的空间数据，利用空间数据计算出节点的中心，最后对所有中心求平均值
    return node.previous
      .map(key => {
        const preNode = ndDict.value[key]
        node.rect.swh = preNode.rect.swh / preNode.nexts.length
        node.rect.sxy = preNode.rect.sxy + node.rect.swh * preNode.nexts.indexOf(node.key)
        return node.rect.sxy + (node.rect.swh >> 1)
      })
      .reduce((sum, cs) => sum + cs, 0) / node.previous.length
  } else {
    return node.rect.swh >> 1
  }
}
function onNodeClick(oper: 'node' | 'add', node?: Node) {
  emitter.emit('update:visible', oper === 'node' ? { show: true, object: node } : true)
}
async function onEdtNdSubmit(node: Node, next: Function) {
  if (node.key) {
    nodes.value.splice(nodes.value.findIndex(nd => nd.key === node.key), 1, Node.copy(node))
  } else {
    nodes.value.push(Node.copy(node))
  }
  emit('update:nodes', nodes.value)
  next()
  await refresh()
}
</script>