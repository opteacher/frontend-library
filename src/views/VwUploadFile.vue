<script setup lang="ts">
import ComUploadFile from '@/components/UploadFile.vue'
import { reactive } from 'vue'
import { getProp } from '@/utils'
import { UploadChangeParam, UploadFile } from 'ant-design-vue'
const form = reactive({
  file: []
})
function onBeforeUpload(file: UploadFile, fileList: UploadFile[]) {
  console.log(file, fileList)
}
function onChange(_form: any, upldInfo: UploadChangeParam) {
  console.log(upldInfo)
}
</script>

<template>
  <ComUploadFile
    :field="{
      path: '',
      headers: {},
      onBeforeUpload,
      onChange
    }"
    :form="form"
    :value="getProp(form, 'file')"
  />
</template>
