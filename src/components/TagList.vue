<template>
  <template v-for="item in value" :key="item">
    <a-tag closable @close="onRmvTagClick(item)">
      <LabelItem :value="item as any" :prop="lblProp" :dict="lblDict" />
    </a-tag>
  </template>
  <a-button
    :type="addFlag ? 'primary' : 'dashed'"
    size="small"
    :disabled="disabled"
    @click="onNewTagClick"
  >
    <template #icon><plus-outlined /></template>
    添加
  </a-button>
  <a-form v-if="addFlag" class="mt-2" :model="addState" @finish="onAddTagSubmit">
    <template v-for="(value, key) in mapper">
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
import { cloneDeep } from 'lodash'
import { ref, type PropType } from 'vue'

import LabelItem from './LabelItem.vue'

const emit = defineEmits(['saved', 'added', 'update:value'])
const props = defineProps({
  flatItem: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  lblProp: { type: String, default: '' },
  lblDict: { type: Object as PropType<Record<any, string>>, default: {} },
  mapper: { type: Object, required: true },
  newFun: { type: Function, default: () => ({}) },
  value: { type: Array, required: true }
})
const addFlag = ref(false)
const addState = ref(props.newFun())

function onNewTagClick() {
  if (!addFlag.value) {
    emit('added', addState.value, props.value)
  }
  addFlag.value = !addFlag.value
}
async function onRmvTagClick(key: any) {
  const index = props.value.indexOf(key)
  emit('update:value', props.value.slice(0, index).concat(props.value.slice(index + 1)))
}
function onAddTagSubmit(form: any) {
  // 根据需要打平新增项
  if (props.flatItem) {
    form = Object.values(form)[0]
  }
  emit('saved', form, props.value)
  emit('update:value', props.value.concat(cloneDeep(form)))
  addFlag.value = false
  addState.value = props.newFun()
}
function onCclClick() {
  addFlag.value = false
}
</script>
