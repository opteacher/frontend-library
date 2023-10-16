<template>
  <template v-for="item in value" :key="item">
    <a-tag closable @close="onRmvTagClick(item)">
      <LabelItem
        :value="item as any"
        :prop="mapper.lblProp"
        :mapper="mapper.lblMapper"
        :tooltip="mapper.subProp"
      />
    </a-tag>
  </template>
  <a-button type="dashed" size="small" @click="onNewTagClick">
    <template #icon><plus-outlined /></template>
    添加
  </a-button>
  <a-form v-if="addFlag" class="mt-2" :model="addState" @finish="onAddTagSubmit">
    <template v-for="(value, key) in mapper.mapper">
      <slot name="formItem" v-bind="{ form: addState, elKey: key.toString(), value }" />
    </template>
    <a-form-item class="mb-0">
      <div class="space-x-2 text-right">
        <a-button @click="onCclClick">取消</a-button>
        <a-button type="primary" html-type="submit">确定</a-button>
      </div>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup name="TagList">
import { PlusOutlined } from '@ant-design/icons-vue'
import { defineEmits, defineProps, ref } from 'vue'

import LabelItem from './LabelItem.vue'

const emit = defineEmits(['update:value'])
const props = defineProps({
  mapper: { type: Object, required: true },
  value: { type: Array, required: true }
})
const addFlag = ref(false)
const addState = ref(props.mapper.newFun())

props.mapper.emitter.on('update:value', (array: any) => {
  emit('update:value', array)
})

function onNewTagClick() {
  if (props.mapper.onAdded) {
    props.mapper.onAdded(addState.value)
  }
  addFlag.value = true
}
async function onRmvTagClick(key: any) {
  const index = props.value.indexOf(key)
  props.mapper.emitter.emit(
    'update:value',
    props.value.slice(0, index).concat(props.value.slice(index))
  )
}
function onAddTagSubmit(form: any) {
  console.log(form)
}
function onCclClick() {
  addFlag.value = false
}
</script>
