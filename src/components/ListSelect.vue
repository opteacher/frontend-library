<template>
  <a-form-item-rest>
    <a-list
      item-layout="horizontal"
      :data-source="options"
      size="small"
      bordered
      class="overflow-y-auto"
      :style="{
        'max-height': `${height}px`
      }"
    >
      <template #renderItem="{ item: option }">
        <a-list-item>
          <a-list-item-meta :description="option.subTitle">
            <template #title>
              <a v-if="option.href" :href="option.href">{{ option.title }}</a>
              <p class="mb-0" v-else>{{ option.title }}</p>
            </template>
            <template #avatar>
              <a-avatar :src="option.avatar">
                <template v-if="!option.avatar" #icon>
                  <AppstoreOutlined />
                </template>
              </a-avatar>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-checkbox
              :disabled="disabled"
              :checked="value.includes(option.key)"
              @change="(e: any) => onItemChecked(e.target.checked, option.key)"
            />
          </template>
        </a-list-item>
      </template>
    </a-list>
  </a-form-item-rest>
</template>

<script setup lang="ts" name="ListSelect">
import { AppstoreOutlined } from '@ant-design/icons-vue'
import { ref, watch } from 'vue'

const props = defineProps({
  value: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  height: { type: Number, default: 200 },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:value'])
const valState = ref(props.value)

watch(
  () => [...props.value],
  () => {
    valState.value = props.value
  }
)

function onItemChecked(chk: boolean, opnKey: string) {
  const selKeys = valState.value.map((itm: any) => itm.key || itm)
  if (chk) {
    if (!selKeys.includes(opnKey)) {
      valState.value.push(opnKey)
    }
  } else {
    valState.value.splice(selKeys.indexOf(opnKey), 1)
  }
  emit('update:value', valState.value)
}
</script>
