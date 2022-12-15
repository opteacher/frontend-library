<template>
  <a-button v-if="!addMod" class="w-full" type="primary" ghost @click="onEdtLstShow">
    添加{{ label }}
  </a-button>
  <a-form v-else layout="inline" :model="addState" @finish="onEdtLstAdd">
    <template v-for="(value, key) in field.mapper">
      <slot name="formItem" v-bind="{ form: addState, skey: key, value }" />
    </template>
    <a-form-item>
      <a class="hover:text-primary" @click="onEdtLstAdd">确定</a>
      <a class="hover:text-secondary" @click="onEdtLstCcl">取消</a>
    </a-form-item>
  </a-form>
  <template v-if="list && list.length">
    <a-divider class="my-2.5 mx-0" />
    <a-list size="small" :data-source="list">
      <template #renderItem="{ item, index }">
        <a-list-item class="p-0">
          <template #actions>
            <a class="hover:text-error" @click="onEdtLstDel(index)">删除</a>
          </template>
          {{ field.lblProp ? item[field.lblProp] : item }}
        </a-list-item>
      </template>
    </a-list>
  </template>
</template>

<script lang="ts">
import { EdtLstMapper } from '@/types/mapper'
import list from 'ant-design-vue/lib/list'
import { defineComponent, reactive, ref } from 'vue'

export default defineComponent({
  name: 'EditList',
  emits: ['update:value'],
  props: {
    label: { type: String, default: '项' },
    value: { type: Array, required: true },
    field: { type: EdtLstMapper, required: true }
  },
  setup(props, { emit }) {
    const addMod = ref(false)
    const addState = reactive(props.field.copy({}))
    const list = reactive(props.value)

    function onEdtLstAdd() {
      list.push(props.field.copy(addState))
      addMod.value = false
      emit('update:value', list)
    }
    function onEdtLstCcl() {
      if (addState.reset) {
        addState.reset()
      } else {
        props.field.copy({}, addState)
      }
      addMod.value = false
    }
    function onEdtLstShow() {
      if (addState.reset) {
        addState.reset()
      } else {
        props.field.copy({}, addState)
      }
      addMod.value = true
    }
    function onEdtLstDel(index: number) {
      list.splice(index, 1)
      emit('update:value', list)
    }
    return {
      addMod,
      addState,
      list,

      onEdtLstShow,
      onEdtLstAdd,
      onEdtLstCcl,
      onEdtLstDel
    }
  }
})
</script>
