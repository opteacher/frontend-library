<script setup lang="ts">
import { type PropType } from 'vue'

const props = defineProps({
  value: { type: Array as PropType<string[]>, required: true },
  placeholders: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  splitLetter: { type: String, default: '~' },
  disabled: { type: Boolean, default: false }
})
console.log(props)
const emit = defineEmits(['update:value'])

function onValUpdate(newTxt: string, index: number) {
  const cloneValue = [...props.value]
  cloneValue.splice(index, 1, newTxt)
  emit('update:value', cloneValue)
}
</script>

<template>
  <a-form-item-rest>
    <a-input-group class="flex" compact>
      <template v-for="(item, index) in value">
        <a-input
          class="flex-1 focus:shadow-none"
          :class="{
            'border-s-0': index !== 0,
            'border-e-0': index !== value.length - 1
          }"
          :disabled="disabled"
          :placeholder="placeholders[index]"
          :value="item"
          @update:value="(newTxt: string) => onValUpdate(newTxt, index)"
        />
        <a-input
          v-if="index !== value.length - 1"
          class="w-5 p-0 text-center border-x-0"
          :class="{ 'bg-white': !disabled }"
          disabled
          :placeholder="splitLetter"
        />
      </template>
    </a-input-group>
  </a-form-item-rest>
</template>
