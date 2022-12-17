<template>
  <a-button v-if="!addMod" class="w-full" type="primary" ghost @click="onEdtLstShow">
    添加{{ label }}
  </a-button>
  <a-form
    v-else
    :layout="field.inline ? 'inline' : 'horizontal'"
    :model="addState"
    @finish="onEdtLstAdd"
  >
    <template v-for="(value, key) in field.mapper">
      <slot name="formItem" v-bind="{ form: addState, skey: key, value }" />
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
        <a-list-item class="p-0">
          <template #actions>
            <a-button danger size="small" @click="onEdtLstDel(index)">删除</a-button>
          </template>
          {{ field.lblProp ? item[field.lblProp] : item }}
        </a-list-item>
      </template>
    </a-list>
  </template>
</template>

<script lang="ts">
import list from 'ant-design-vue/lib/list'
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'

export default defineComponent({
  name: 'EditList',
  emits: ['update:value'],
  props: {
    label: { type: String, default: '项' },
    value: { type: Array, required: true },
    field: { type: Object, required: true }
  },
  setup(props, { emit }) {
    const addMod = ref(false)
    const addState = reactive(props.field.copy({}))
    const list = reactive([] as any[])
    const fstKey = computed(() => Object.keys(props.field.mapper)[0])

    onMounted(refresh)
    watch(() => props.value, refresh)

    function refresh() {
      list.splice(0, list.length, ...props.value.map((item: any) => ({ [fstKey.value]: item })))
    }
    function onEdtLstAdd() {
      list.push(props.field.copy(addState))
      addMod.value = false
      emit(
        'update:value',
        list.map(item => item[fstKey.value])
      )
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
      emit(
        'update:value',
        list.map(item => item[fstKey.value])
      )
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
