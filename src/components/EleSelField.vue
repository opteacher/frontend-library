<template>
  <a-button
    v-if="!getProp(form, prop) || !getProp(form, `${prop}.xpath`)"
    class="w-full"
    :type="selecting ? 'primary' : 'default'"
    @click="onSelEleStart"
  >
    选择元素
  </a-button>
  <a-input-group v-else compact class="flex">
    <a-tooltip>
      <template #title>{{ label }}</template>
      <a-dropdown class="flex-1 truncate" :trigger="['click']">
        <template #overlay>
          <a-menu @click="onElIdChange">
            <a-menu-item key="xpath">xpath</a-menu-item>
            <a-menu-item key="idCls">ID或类</a-menu-item>
            <a-menu-item key="tagName">标签</a-menu-item>
          </a-menu>
        </template>
        <a-button>{{ label }}<DownOutlined /></a-button>
      </a-dropdown>
    </a-tooltip>
    <a-popover title="更多选项" :trigger="['click']">
      <template #content>
        <FormGroup :mapper="moreMapper" :form="element" @update:fprop="onUpdateFprop">
          <template #indexSFX="{ formState }">
            <a-form-item-rest>
              或&nbsp;<a-checkbox v-model:checked="formState.idAll">所有元素</a-checkbox>
            </a-form-item-rest>
          </template>
        </FormGroup>
      </template>
      <a-button>
        <template #icon><MoreOutlined /></template>
      </a-button>
    </a-popover>
  </a-input-group>
</template>

<script setup lang="ts" name="EleSelField">
import { getProp, setProp } from '../utils'
import { DownOutlined, MoreOutlined } from '@ant-design/icons-vue'
import { computed, ref, toRef } from 'vue'
import PageEle, { type IdType } from '../types/pageEle'
import { TinyEmitter } from 'tiny-emitter'
import Mapper from '../types/mapper'
import { Cond } from '../types'
import FormGroup from './FormGroup.vue'

const props = defineProps({
  form: { type: Object, required: true },
  prop: { type: String, required: true },
  idAll: { type: Boolean, default: false },
  emitter: { type: TinyEmitter, required: true },
  seledStop: { type: Boolean, default: true }
})
const emit = defineEmits(['selEleClear', 'selEleStart', 'eleIdenChange', 'eleSelected'])
const form = toRef(props.form)
const element = computed<PageEle>(() => getProp(form.value, props.prop))
const idType = computed<IdType>(() => getProp(element.value, 'idType'))
const idxLbl = computed<number>(() => getProp(element.value, 'index'))
const label = computed<string>(() =>
  getProp(element.value, idType.value)
  + (!element.value.idAll && idxLbl.value !== -1 && idType.value !== 'xpath' ? `[${idxLbl.value}]` : '')
)
const selecting = ref(false)
const selEle = ref<PageEle>()
const moreMapper = new Mapper({
  index: {
    type: 'Number',
    label: '指定第',
    desc: '小于等于0都会指向第一个元素',
    disabled: [Cond.create('idAll', '==', true)],
    suffix: '个元素',
    onChange: (_form: any, to: number) => setProp(form.value, 'element.index', to)
  },
  unbind: {
    type: 'Button',
    danger: true,
    inner: '解绑',
    offset: 4,
    onClick: onSelEleClear
  }
})

props.emitter.on('ele-selected', (ele?: PageEle) => {
  selEle.value = ele
  if (selecting.value && ele) {
    onEleSelected()
    if (props.seledStop) {
      props.emitter.emit('stop-select')
    }
    selecting.value = false
  }
})

function onSelEleStart() {
  if (selEle.value) {
    onEleSelected()
  } else if (selecting.value) {
    selecting.value = false
    props.emitter.emit('stop-select')
  } else {
    selecting.value = true
    props.emitter.emit('start-select')
    emit('selEleStart', props.prop)
  }
}
function onEleSelected() {
  const cpEle = PageEle.copy(selEle.value)
  cpEle.idAll = props.idAll
  setProp(form.value, props.prop, cpEle)
  emit('eleSelected', props.prop, form.value)
}
function onElIdChange({ key }: any) {
  setProp(form.value, props.prop + '.idType', key)
  emit('eleIdenChange', props.prop, key)
}
function onSelEleClear() {
  selecting.value = false
  setProp(form.value, props.prop, undefined)
  emit('selEleClear', props.prop)
}
function onUpdateFprop(values: any) {
  Object.entries(values).map(([k, v]) => setProp(form.value, `${props.prop}.${k}`, v))
}
</script>
