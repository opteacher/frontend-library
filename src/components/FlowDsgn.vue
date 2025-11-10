<template>
  <div ref="dsgnPanel" class="overflow-auto">
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
        @intf-click="(intf: NdIntf) => emit('node-intf-click', node, intf)"
      />
    </template>
    <svg class="z-[-1]" :width="pnlSclWH.width" :height="pnlSclWH.height">
      <NodeLine
        v-for="node in nodes"
        :direction="direction"
        :node="node"
        :ndDict="ndDict"
        :gutter="gutter"
      />
    </svg>
    <FormDialog
      title="编辑节点"
      v-model:visible="visible"
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
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  createVNode,
  onMounted,
  reactive,
  ref,
  toRef,
  useSlots,
  nextTick,
  type PropType
} from 'vue'
import Node, { NdIntf } from '../types/node'
import { getProp, newOne, setProp, waitFor, rmvStartsOf, until } from '../utils'
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
const emit = defineEmits(['update:nodes', 'node-add', 'node-edt', 'node-del', 'node-click', 'node-intf-click'])
const dsgnPanel = ref<HTMLElement>()
const direction = toRef(props.direction)
const nodes = toRef(props.nodes)
const visible = ref(false)
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
  vertical: { space: 'width', position: 'x' },
  horizontal: { space: 'height', position: 'y' }
}
const pnlRect = ref<DOMRect>()
const pnlSclWH = reactive({ width: '', height: '' })
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
  await until(async () => typeof dsgnPanel.value !== 'undefined')
  const panel = dsgnPanel.value as HTMLElement
  if (force) {
    rsxObs.observe(panel)
  }
  pnlRect.value = panel?.getBoundingClientRect() as DOMRect
  if (!nodes.value.length) {
    return
  }
  const root = nodes.value[0]
  for (let queue = [root.key], level = 0; queue.length; ++level) {
    const qlen = queue.length
    for (let i = 0; i < qlen; ++i) {
      const node = ndDict.value[queue.shift() as string]
      if (!node) {
        continue
      }
      const ele = await waitFor(node.key) as HTMLElement
      setProp(ele, 'style.display', 'block')
      await until(async () => ele.style.display === 'block')
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
      if (!node.display) {
        const ele = await waitFor(node.key)
        setProp(ele, 'style.display', 'none')
      }
      queue.push(...node.nexts)
    }
  }
  nextTick(() => {
    pnlSclWH.width = dsgnPanel.value?.scrollWidth + 'px'
    pnlSclWH.height = dsgnPanel.value?.scrollHeight + 'px'
  })
}
function getNodeCenPos(node: Node) {
  const pos = getProp(dirDict, direction.value + '.position')
  if ((node.previous || []).some(pvsKey => ndDict.value[pvsKey].nexts.length > 1)) {
    // 有兄弟节点，则位置由兄弟节点算出
    // 兄弟节点的中心点 + 一个可用空间
    const pvsNode = ndDict.value[
      (node.previous || []).find(pvsKey => ndDict.value[pvsKey].nexts.length > 1) as string
    ]
    node.rect.s = pvsNode.rect.s / pvsNode.nexts.length
    const ndIdx = pvsNode.nexts.indexOf(node.key)
    if (ndIdx === 0) {
      // 这是第一个多子节点的第一个节点，位置由父节点和自身空间算出
      return getProp(pvsNode.rect, `c${pos}`) - (pvsNode.rect.s >> 1) + (node.rect.s >> 1)
    }
    const sblNode = ndDict.value[pvsNode.nexts[ndIdx - 1]]
    return getProp(sblNode.rect, `c${pos}`) + sblNode.rect.s
  } else if (node.previous.length) {
    // 如没有兄弟节点，则位置由父节点们算出
    // 所有父节点的中心点求平均值
    node.rect.s = node.previous.map(pvsKey => ndDict.value[pvsKey].rect.s).reduce((sum, s) => sum + s, 0)
    return node.previous
      .map(key => getProp(ndDict.value, `${key}.rect.c${pos}`))
      .reduce((sum, cs) => sum + cs, 0) / node.previous.length
  } else {
    node.rect.s = getProp(pnlRect.value, getProp(dirDict, `${direction.value}.space`))
    return node.rect.s >> 1
  }
}
function onNodeClick(oper: 'node' | 'add', node?: Node) {
  const object = oper === 'node' ? node : props.copy({
    previous: node ? [node.key] : [],
    nexts: node ? node.nexts : [] // 预设为insert模式
  })
  props.emitter.emit('update:visible', { show: true, object } )
  emit('node-click', object)
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
    emit('node-edt', edtNode)
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
    await new Promise(resolve => emit('node-add', edtNode, resolve))
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
  if (visible.value) {
    props.emitter.emit('update:visible', false)
  }
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
  await new Promise(resolve => emit('node-del', node, resolve))
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