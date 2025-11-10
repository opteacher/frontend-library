<template>
  <div
    :id="node.key"
    class="absolute"
    :style="{
      width: width + 'px',
      top: node.rect.y + 'px',
      left: node.rect.x + 'px'
    }"
  >
    <div
      v-for="intf in node.intfs"
      class="absolute top-1/2 flex items-center hover:cursor-pointer"
      :class="{
        'left-full': intf.side === 'right',
        'right-full': intf.side === 'left'
      }"
      @mouseover="() => (hovIkey = intf.key)"
      @mouseout="() => (hovIkey = '')"
    >
      <div
        v-if="intf.side === 'left'"
        class="w-0 h-0"
        :style="{
          'border-top': '10px solid transparent',
          'border-bottom': '10px solid transparent',
          'border-right': `5px solid ${getIntfColor(intf)}`
        }"
      />
      <a-tag
        :class="{
          'rounded-s-none border-r-0 mr-[-1px]': intf.side === 'right',
          'rounded-e-none border-l-0 ml-[-1px]': intf.side === 'left'
        }"
        :bordered="false"
        :color="getIntfColor(intf)"
      >
        {{ intf.label }}
      </a-tag>
      <div
        v-if="intf.side === 'right'"
        class="w-0 h-0"
        :style="{
          'border-top': '10px solid transparent',
          'border-bottom': '10px solid transparent',
          'border-left': `5px solid ${getIntfColor(intf)}`
        }"
      />
    </div>
    <a-card
      :headStyle="{
        backgroundColor: node.color
      }"
      :size="size"
      hoverable
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
        <a-dropdown v-if="node.delable || node.extMnuItms.length">
          <a class="ant-dropdown-link text-white text-xl rounded border hover:border-solid border-white" @click.prevent>
            <antdIcon.MoreOutlined />
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item
                v-for="muItm in node.extMnuItms"
                :key="muItm.key"
                :icon="muItm.icon"
                @click="() => muItm.onClick(node)"
              >
                {{ muItm.title }}
              </a-menu-item>
              <a-menu-item
                v-if="node.delable"
                key="delete"
                class="text-[#ff4d4f]"
                @click="() => emit('del-click', node)"
              >
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
  </div>
  <a-button
    v-if="node.addable"
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
import { computed, ref, type PropType } from 'vue'
import Node, { NdIntf } from '../types/node'
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
const hovIkey = ref('')

function getIntfColor(intf: NdIntf) {
  console.log(hovIkey.value)
  return hovIkey.value === intf.key ? intf.hovClr : intf.color
}
</script>