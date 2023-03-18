<template>
  <template v-for="item in value" :key="item">
    <a-tag closable @close="onRmvTagClick(item)">
      <LabelItem :value="item as any" :prop="mapper.lblProp" :mapper="mapper.lblMapper" />
    </a-tag>
  </template>
  <a-button type="dashed" size="small" @click="onNewTagClick">
    <template #icon><plus-outlined /></template>
    添加
  </a-button>
  <slot name="FormDialog" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import LabelItem from './LabelItem.vue'

export default defineComponent({
  name: 'TagList',
  components: {
    PlusOutlined,
    LabelItem
  },
  emits: ['update:value'],
  props: {
    mapper: { type: Object, required: true },
    value: { type: Array, required: true }
  },
  setup(props, { emit }) {
    props.mapper.emitter.on('update:value', (array: any) => {
      emit('update:value', array)
    })

    function onNewTagClick() {
      props.mapper.emitter.emit('update:show', true)
      props.mapper.emitter.emit('update:data', props.value)
    }
    async function onRmvTagClick(key: any) {
      props.value.splice(props.value.indexOf(key), 1)
      props.mapper.emitter.emit('update:value', props.value)
    }
    return {
      onNewTagClick,
      onRmvTagClick
    }
  }
})
</script>
