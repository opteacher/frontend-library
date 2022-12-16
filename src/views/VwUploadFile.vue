<script setup lang="ts">
import { reactive } from 'vue'
import { getProp } from '@/utils'
import { UploadChangeParam } from 'ant-design-vue'
import { createByFields } from '@/types/mapper'
import Field from '@/types/field'
const mapper = createByFields([
  Field.copy({
    refer: 'file',
    ftype: 'Upload',
    extra: {
      path: '/server-package/api/v1/temp/file',
      headers: {},
      onBeforeUpload,
      onChange
    }
  })
])
const form = reactive({
  file: []
})
function onBeforeUpload(file: any, fileList: any[]) {
  console.log(file, fileList)
}
function onChange(_form: any, upldInfo: UploadChangeParam) {
  console.log(upldInfo)
}
</script>

<template>
  <UploadFile :field="mapper['file']" :form="form" :value="getProp(form, 'file')" />
</template>
