<template>
  <div id="dsgnPanel" class="flex-1 relative overflow-auto m-5">
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
        :width="width"
        @card-click="() => onNodeClick('node', node)"
        @add-click="() => onNodeClick('add', node)"
        @del-click="() => onDelNdClick(node)"
      >
        <template #moreMuItms="params">
          <slot name="nodeCard_moreMuItms" v-bind="params" />
        </template>
      </NodeCard>
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
  >
    <template v-for="key in edtNdSlots" #[key]="params">
      <slot :name="`editNode_${key}`" v-bind="params" />
    </template>
  </FormDialog>
  <a-float-button-group
    trigger="click"
    type="primary"
    :style="{ right: '24px' }"
    v-model:open="toolboxVsb"
  >
    <template #icon>
      <ToolOutlined />
    </template>
    <a-float-button :tooltip="direction === 'vertical' ? '纵向' : '横向'" @click="onDirSwchClick">
      <template #icon>
        <ApartmentOutlined v-if="direction === 'vertical'" />
        <PartitionOutlined v-else-if="direction === 'horizontal'" />
      </template>
    </a-float-button>
    <a-float-button :tooltip="size === 'small' ? '放大' : '缩小'" @click="onSzSwchClick">
      <template #icon>
        <ZoomInOutlined v-if="size === 'small'" />
        <ZoomOutOutlined v-else />
      </template>
    </a-float-button>
    <slot name="extToolBtns" />
  </a-float-button-group>
</template>

<script setup lang="ts">
import { computed, createVNode, onMounted, ref, toRef, useSlots, type PropType } from 'vue'
import Node from '../types/node'
import { getProp, newOne, setProp, waitFor, rmvStartsOf } from '../utils'
import NodeCard from './NodeCard.vue'
import NodeLine from './NodeLine.vue'
import FormDialog from './FormDialog.vue'
import Mapper from '../types/mapper'
import { TinyEmitter } from 'tiny-emitter'
import {
  PlusOutlined,
  ToolOutlined,
  ApartmentOutlined,
  PartitionOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { v4 as uuid } from 'uuid'
import { Cond } from '../types'
import { Modal } from 'ant-design-vue'

const props = defineProps({
  direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
  size: { type: String  as PropType<'default' | 'small'>, default: 'default' },
  nodes: { type: Array as PropType<Node[]>, required: true },
  mapper: {
    type: Mapper,
    default: () => new Mapper({
      title: {
        type: 'Input',
        label: '标题',
        rules: [{ required: true, message: '必须填入标题！' }]
      },
      desc: {
        type: 'Textarea',
        label: '描述'
      },
      color: {
        type: 'ColorSelect',
        label: '颜色'
      },
      icon: {
        type: 'IconField',
        label: '图标'
      },
      addMode: {
        type: 'Radio',
        label: '添加方式',
        display: [
          Cond.create('key', '==', ''),
          Cond.create('previous.length', '!=', 0),
          Cond.create('nexts.length', '!=', 0)
        ],
        style: 'button',
        options: [
          { label: '插入', subLabel: '在前后两节点中插入新节点', value: 'insert' },
          { label: '追加', subLabel: '添加后节点的兄弟新节点', value: 'append' }
        ]
      },
      previous: {
        type: 'EditList',
        label: '父节点',
        display: [
          Cond.create('key', '==', ''),
          Cond.create('previous.length', '!=', 0)
        ],
        lblDict: {},
        disRmvIdxs: [0],
        inline: true,
        flatItem: true,
        mapper: new Mapper({
          edtKey: {
            type: 'Select',
            placeholder: '选择父节点'
          }
        })
      }
    })
  },
  keygenFun: { type: Function as PropType<(newNode: any) => Promise<string>>, default: () => uuid() },
  emitter: { type: TinyEmitter, default: new TinyEmitter() },
  copy: { type: Function, default: Node.copy }
})
const emit = defineEmits(['update:nodes', 'add:node', 'edt:node', 'del:node', 'click:node'])
const direction = toRef(props.direction)
const nodes = toRef(props.nodes)
const mapper = toRef(props.mapper)
setProp(mapper.value, 'delBtn', {
  type: 'Button',
  inner: '删除',
  danger: true,
  offset: 4,
  fullWid: true,
  display: [
    Cond.create('key', '!=', ''),
    Cond.create('delable', '!=', false)
  ],
  onClick: onDelNdClick
})
const size = toRef(props.size)
const ndDict = computed<Record<string, Node>>(() =>
  Object.fromEntries(nodes.value.map(node => [node.key, node]))
)
const width = ref(300)
const gutter = ref(100)
const rsxObs = new ResizeObserver(() => refresh())
const dirDict = {
  vertical: 'width',
  horizontal: 'height'
} as Record<'vertical' | 'horizontal', 'width' | 'height'>
const pnlRect = ref<DOMRect>()
const emptyAddBtn = computed(() => {
  if (direction.value === 'vertical') {
    return {
      top: '0px',
      left: pnlRect.value ? (pnlRect.value?.width >> 1) + 'px' : '0px'
    }
  } else if (direction.value === 'horizontal') {
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
const toolboxVsb = ref(false)
const slots = useSlots()
const edtNdSlots = computed(() => 
  Object
    .keys(slots)
    .filter(k => k.startsWith('editNode_'))
    .map(k => rmvStartsOf(k, 'editNode_'))
)

onMounted(() => refresh(true))
props.emitter.on('refresh', () => refresh())
props.emitter.on('del:node', async (key: string, callback: Function) => {
  await onDelNdSubmit(ndDict.value[key], false)
  callback()
})
props.emitter.on('add:node', async (node: any, callback: Function) => {
  await onEdtNdSubmit(node, callback)
})

async function refresh(force = false) {
  const panel = await waitFor('dsgnPanel')
  if (force) {
    rsxObs.observe(panel as HTMLElement)
  }
  pnlRect.value = panel?.getBoundingClientRect() as DOMRect
  if (!nodes.value.length) {
    return
  }
  const root = nodes.value[0]
  root.rect.sxy = 0
  root.rect.swh = getProp(pnlRect.value, dirDict[direction.value])
  for (let queue = [root.key], level = 0; queue.length; ++level) {
    const qlen = queue.length
    for (let i = 0; i < qlen; ++i) {
      const node = ndDict.value[queue.shift() as string]
      if (!node) {
        continue
      }
      const ele = await waitFor(node.key) as HTMLElement
      node.rect.w = ele.clientWidth
      node.rect.h = ele.clientHeight
      if (direction.value === 'vertical') {
        node.rect.cx = getNodeCenPos(node)
        node.rect.x = node.rect.cx - (ele.clientWidth >> 1)
        node.rect.y = (gutter.value + ele.clientHeight) * level
        node.rect.cy = node.rect.y + (gutter.value >> 1)
      } else if (direction.value === 'horizontal') {
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
  const object = oper === 'node' ? node : props.copy({
    previous: node ? [node.key] : [],
    nexts: node ? node.nexts : [] // 预设为insert模式
  })
  props.emitter.emit('update:visible', { show: true, object } )
  emit('click:node', object)
  if ('previous' in mapper.value) {
    setProp(mapper.value, 'previous.lblDict', Object.fromEntries(nodes.value.map(nd => [nd.key, nd.title])))
    setProp(
      mapper.value,
      'previous.mapper.edtKey.options',
      nodes.value
        .filter(nd => !nd.nexts.length && (node && nd.key !== node.key))
        .map(nd => ({ value: nd.key, label: nd.title }))
    )
  }
}
async function onEdtNdSubmit(node: Node, next: Function) {
  const edtNode = props.copy(node)
  if (edtNode.key) {
    nodes.value.splice(nodes.value.findIndex(nd => nd.key === edtNode.key), 1, edtNode)
    emit('edt:node', edtNode)
  } else {
    nodes.value.push(setProp(edtNode, 'key', await props.keygenFun(edtNode)))
    // 关联父节点
    for (const pvsKey of edtNode.previous) {
      const pvsNode = ndDict.value[pvsKey]
      // 斩断连接
      if (edtNode.addMode === 'insert') {
        pvsNode.nexts = pvsNode.nexts.filter((key: string) => !edtNode.nexts.includes(key))
      }
      // 填入新子节点
      pvsNode.nexts.push(edtNode.key)
    }
    // 关联子节点
    for (const nxtKey of edtNode.nexts) {
      const nxtNode = ndDict.value[nxtKey]
      if (edtNode.addMode === 'insert') {
        nxtNode.previous = nxtNode.previous.filter((key: string) => !edtNode.previous.includes(key))
      }
      nxtNode.previous.push(edtNode.key)
    }
    await new Promise(resolve => emit('add:node', edtNode, resolve))
  }
  emit('update:nodes', nodes.value, async () => {
    await refresh()
    next(edtNode)
  })
}
function onDelNdClick(node: Node) {
  const delNode = props.copy(node) as Node
  Modal.confirm({
    title: `确定删除该节点【${delNode.title}】吗？`,
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode('div', { style: 'color: #ff4d4f' }, '该节点的所有子节点将归于其第一个父节点！'),
    onOk: () => onDelNdSubmit(delNode)
  })
  props.emitter.emit('update:visible', false)
}
async function onDelNdSubmit(node: Node, doRfsh = true) {
  if (node.previous.length) {
    const preNxts = ndDict.value[node.previous[0]].nexts
    preNxts.splice(preNxts.indexOf(node.key), 1)
    node.nexts.map(key => {
      const nxtPres = ndDict.value[key].previous
      if (nxtPres.length > 1 && nxtPres.some(key => preNxts.includes(key))) {
        // 被删除的节点有个兄弟节点同样拥有该子节点，则该子节点与被删除节点的父节点（祖父节点）不做关联
        // 因为兄弟节点会代替被删除的节点关联其父子关系
        nxtPres.splice(nxtPres.indexOf(node.key), 1)
      } else {
        nxtPres.splice(nxtPres.indexOf(node.key), 1, node.previous[0])
        preNxts.push(key)
      }
    })
  }
  await new Promise(resolve => emit('del:node', node, resolve))
  nodes.value.splice(nodes.value.findIndex(nd => nd.key === node.key), 1)
  emit('update:nodes', nodes.value)
  if (doRfsh) {
    await refresh()
  }
}
async function onDirSwchClick() {
  direction.value = direction.value === 'vertical' ? 'horizontal' : 'vertical'
  toolboxVsb.value = false
  await refresh()
}
async function onSzSwchClick() {
  size.value = size.value === 'small' ? 'default' : 'small'
  gutter.value = size.value === 'small' ? 80 : 100
  width.value = size.value === 'small' ? 200 : 300
  toolboxVsb.value = false
  await refresh()
}
</script>