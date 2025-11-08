<template>
  <div v-if="!addMod" class="w-full flex space-x-3">
    <slot name="addPFX" />
    <a-button class="flex-1" type="primary" :disabled="disabled" ghost @click="onEdtLstShow">
      添加{{ label }}
    </a-button>
    <slot name="addSFX" />
  </div>
  <a-form v-else :layout="inline ? 'inline' : 'horizontal'" :model="addState" @finish="onEdtLstAdd">
    <template v-for="(value, key) in mapper">
      <slot name="formItem" v-bind="{ form: addState, elKey: key.toString(), value }" />
    </template>
    <div class="flex justify-end space-x-2">
      <a-button class="bg-primary" type="primary" html-type="submit">确定</a-button>
      <a-button @click="onEdtLstCcl">取消</a-button>
    </div>
  </a-form>
  <template v-if="list && list.length">
    <a-divider class="my-2 mx-0" />
    <a-list size="small" :data-source="list">
      <template #renderItem="{ item, index }">
        <a-list-item class="py-1.5 hover:bg-[#00000012] hover:cursor-pointer">
          <template v-if="!disRmvIdxs.includes(index)" #actions>
            <a-button danger size="small" @click="onEdtLstDel(index)">删除</a-button>
          </template>
          <slot v-if="slots['itemLabel']" name="itemLabel" v-bind="{ item, index }" />
          <LabelItem
            v-else
            :value="item"
            :dict="lblDict"
            :prop="lblProp"
            :sub-prp="subProp"
            :tip="JSON.stringify(item)"
          />
        </a-list-item>
      </template>
    </a-list>
  </template>
</template>

<script lang="ts" setup name="EditList">
import { cloneDeep } from 'lodash'
import { onMounted, reactive, ref, watch, type PropType } from 'vue'

import LabelItem from './LabelItem.vue'

const emit = defineEmits(['update:value', 'click:add', 'submit:add'])
const props = defineProps({
  label: { type: String, default: '项' },
  value: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  mapper: { type: Object, required: true },
  newFun: { type: Function, default: () => ({}) },
  flatItem: { type: Boolean, default: false },
  lblDict: { type: Object as PropType<Record<any, string>>, default: {} },
  lblProp: { type: String, default: '' },
  subProp: { type: String, default: '' },
  inline: { type: Boolean, default: true },
  disRmvIdxs: { type: Array, default: [] }
})
const slots = defineSlots()
const addMod = ref(false)
const addState = ref(props.newFun())
const list = reactive([] as any[])

onMounted(refresh)
watch(() => [...props.value], refresh)

function refresh() {
  list.splice(0, list.length, ...props.value)
}
function onEdtLstAdd() {
  let newItm = cloneDeep(addState.value)
  if (props.flatItem) {
    newItm = Object.values(newItm)
    if (newItm.length === 1) {
      newItm = newItm[0]
    }
  }
  emit('submit:add', newItm)
  list.push(newItm)
  addMod.value = false
  emit('update:value', list)
}
function onEdtLstCcl() {
  resetState()
  addMod.value = false
}
async function onEdtLstShow() {
  emit('click:add', props.mapper)
  resetState()
  addMod.value = true
}
function onEdtLstDel(index: number) {
  list.splice(index, 1)
  emit('update:value', list)
}
function resetState() {
  if (addState.value.reset) {
    addState.value.reset()
  } else {
    addState.value = props.newFun()
  }
}
</script>
