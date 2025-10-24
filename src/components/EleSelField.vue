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
    <a-dropdown class="flex-1 truncate" :trigger="['click']">
      <template #overlay>
        <a-menu @click="onElIdChange">
          <a-menu-item key="xpath">xpath</a-menu-item>
          <a-menu-item key="idCls">ID或类</a-menu-item>
          <a-menu-item key="tagName">标签</a-menu-item>
        </a-menu>
      </template>
      <a-button type="primary" ghost>
        {{ getProp(form, `${prop}.${idType}`) }}
        <DownOutlined />
      </a-button>
    </a-dropdown>
    <a-popconfirm title="确定解绑该元素吗？" @confirm="onSelEleClear">
      <a-button type="primary" ghost danger>
        <template #icon><CloseOutlined /></template>
      </a-button>
    </a-popconfirm>
  </a-input-group>
</template>

<script setup lang="ts" name="EleSelField">
import { getProp, setProp } from '../utils'
import { CloseOutlined, DownOutlined } from '@ant-design/icons-vue'
import { computed, type PropType, ref, toRef } from 'vue'
import PageEle from '../types/pageEle'
import { TinyEmitter } from 'tiny-emitter'

const props = defineProps({
  form: { type: Object, required: true },
  prop: { type: String, required: true },
  emitter: { type: TinyEmitter, required: true },
  selEle: { type: Object as PropType<PageEle>, default: null },
  seledStop: { type: Boolean, default: true }
})
const emit = defineEmits(['selEleClear', 'selEleStart', 'eleIdenChange', 'eleSelected'])
const form = toRef(props.form)
const idType = computed(() => getProp(form.value, `${props.prop}.idType`))
const selecting = ref(false)

props.emitter.on('ele-selected', (ele?: PageEle) => {
  if (selecting.value && ele) {
    setProp(form.value, props.prop, PageEle.copy(ele))
    emit('eleSelected', props.prop, form.value)
    if (props.seledStop) {
      props.emitter.emit('stop-select')
    }
    selecting.value = false
  }
})

function onSelEleStart() {
  if (props.selEle) {
    setProp(form.value, props.prop, PageEle.copy(props.selEle))
  } else if (selecting.value) {
    selecting.value = false
    props.emitter.emit('stop-select')
  } else {
    selecting.value = true
    props.emitter.emit('start-select')
    emit('selEleStart', props.prop)
  }
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
</script>
