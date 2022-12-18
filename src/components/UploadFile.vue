<template>
  <a-dropdown class="w-full" :disabled="disabled">
    <a-button>
      <template #icon><UploadOutlined /></template>
      选择上传的文件或文件夹
    </a-button>
    <template #overlay>
      <a-upload
        name="file"
        :multiple="false"
        :directory="uploadDir"
        :showUploadList="false"
        v-model:file-list="valState"
        :action="path"
        :headers="headers"
        :progress="progress"
        :beforeUpload="onBeforeUpload"
        @change="onUploadChange"
      >
        <a-menu @click="onUploadClicked">
          <a-menu-item key="file">
            <FileAddOutlined />
            &nbsp;上传文件
          </a-menu-item>
          <a-menu-item key="folder">
            <FolderAddOutlined />
            &nbsp;上传文件夹
          </a-menu-item>
        </a-menu>
      </a-upload>
    </template>
  </a-dropdown>
  <a-list v-show="valState.length" style="margin-top: 5px" size="small" :data-source="valState">
    <template #renderItem="{ item: file }">
      <a-list-item>
        {{ file.originFileObj.webkitRelativePath || file.name }}
      </a-list-item>
    </template>
  </a-list>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { UploadOutlined, FileAddOutlined, FolderAddOutlined } from '@ant-design/icons-vue'
import type { UploadChangeParam, UploadProps, UploadFile } from 'ant-design-vue'
import { validConds } from '@/utils'

export default defineComponent({
  name: 'UploadFile',
  components: {
    UploadOutlined,
    FileAddOutlined,
    FolderAddOutlined
  },
  emits: ['update:value'],
  props: {
    form: { type: Object, required: true },
    path: { type: String, default: '' },
    headers: { type: Object, default: undefined},
    value: { type: Array, required: true },
    onBeforeUpload: { type: Function, default: () => () => true },
    onChange: { type: Function, default: () => () => undefined },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { emit }) {
    const uploadDir = ref(false)
    const valState = ref(props.value)
    const progress: UploadProps['progress'] = {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068'
      },
      strokeWidth: 3,
      format: percent => `${parseFloat((percent || 0).toFixed(2))}%`,
      class: 'test'
    }

    watch(
      () => props.value,
      () => {
        valState.value = props.value
      }
    )

    function onUploadClicked(item: { key: string }) {
      uploadDir.value = item.key === 'folder'
    }
    function onUploadChange(info: UploadChangeParam) {
      props.onChange(props.form, info)
      if (
        info.fileList.reduce(
          (prev: boolean, file: UploadFile) => prev && file.status === 'done',
          true
        )
      ) {
        emit('update:value', valState.value)
      }
    }
    return {
      uploadDir,
      valState,
      progress,

      validConds,
      onUploadClicked,
      onUploadChange
    }
  }
})
</script>
