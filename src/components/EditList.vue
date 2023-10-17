<template>
  <a-button v-if="!addMod" class="w-full" type="primary" ghost @click="onEdtLstShow">
    添加{{ label }}
  </a-button>
  <a-form
    v-else
    class="flex"
    :layout="mapper.inline ? 'inline' : 'horizontal'"
    :model="addState"
    @finish="onEdtLstAdd"
  >
    <template v-for="(value, key) in mapper.mapper">
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
        <a-list-item class="py-1.5">
          <template #actions>
            <a-button danger size="small" @click="onEdtLstDel(index)">删除</a-button>
          </template>
          <LabelItem :value="item" :mapper="mapper.lblMapper" :prop="mapper.lblProp" />
        </a-list-item>
      </template>
    </a-list>
  </template>
</template>

<script lang="ts" setup name="EditList">
import { cloneDeep } from 'lodash'
import { onMounted, reactive, ref, watch } from 'vue'

import LabelItem from './LabelItem.vue'

const emit = defineEmits(['update:value'])
const props = defineProps({
  label: { type: String, default: '项' },
  value: { type: Array, default: () => [] },
  mapper: { type: Object, required: true }
})
const addMod = ref(false)
const addState = ref(props.mapper.newFun())
const list = reactive([] as any[])

onMounted(refresh)
watch(() => [...props.value], refresh)

function refresh() {
  list.splice(0, list.length, ...props.value)
}
function onEdtLstAdd() {
  let newItm = cloneDeep(addState.value)
  if (props.mapper.flatItem) {
    newItm = Object.values(newItm)
    if (newItm.length === 1) {
      newItm = newItm[0]
    }
  }
  list.push(newItm)
  addMod.value = false
  emit('update:value', list)
}
function onEdtLstCcl() {
  resetState()
  addMod.value = false
}
async function onEdtLstShow() {
  if (props.mapper.onAdded) {
    await props.mapper.onAdded(props.mapper)
  }
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
    addState.value = props.mapper.newFun()
  }
}
</script>
