<template>
  <a-upload
    class="upload-compo"
    name="file"
    :multiple="!directory"
    :directory="directory"
    v-model:file-list="valState"
    :data="params"
    :action="path"
    :headers="headers"
    :progress="progress"
    :beforeUpload="onBeforeUpload"
    @change="onUploadChange"
  >
    <a-button class="w-full">
      <template #icon><UploadOutlined /></template>
      选择上传的{{ directory ? '文件夹' : '文件' }}
    </a-button>
  </a-upload>
</template>

<script lang="ts" setup name="UploadFile">
import { UploadOutlined } from '@ant-design/icons-vue'
import type { UploadChangeParam, UploadFile, UploadProps } from 'ant-design-vue'
import { v4 } from 'uuid'
import { onMounted, ref, watch } from 'vue'

const emit = defineEmits(['update:value'])
const props = defineProps({
  form: { type: Object, required: true },
  path: { type: String, default: '' },
  params: { type: Object, default: () => ({}) },
  directory: { type: Boolean, default: false },
  headers: { type: Object, default: undefined },
  value: { type: Array, required: true },
  onBeforeUpload: { type: Function, default: () => () => true },
  onChange: { type: Function, default: () => () => undefined },
  disabled: { type: Boolean, default: false }
})

const valState = ref<UploadFile[]>([])
const progress: UploadProps['progress'] = {
  strokeColor: {
    '0%': '#108ee9',
    '100%': '#87d068'
  },
  strokeWidth: 3,
  format: percent => `${parseFloat((percent || 0).toFixed(2))}%`,
  class: 'test'
}

onMounted(refresh)
watch(() => [...props.value], refresh)

function refresh() {
  valState.value = (props.value as string[]).map((name: string) => ({ uid: v4(), name }))
}
function onUploadChange(info: UploadChangeParam) {
  props.onChange(props.form, info)
  if (
    info.fileList.reduce((prev: boolean, file: UploadFile) => prev && file.status === 'done', true)
  ) {
    emit(
      'update:value',
      valState.value.map((item: any) => item.response.result)
    )
  }
}
</script>

<style>
.upload-compo .ant-upload {
  @apply w-full;
}
</style>
