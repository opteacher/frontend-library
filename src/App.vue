<script setup lang="ts">
import {
  BgColorsOutlined,
  UploadOutlined,
  CodeSandboxOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  TableOutlined,
  ImportOutlined,
  ExportOutlined,
  SmileOutlined,
  FormOutlined,
  ProfileOutlined,
  GithubOutlined
} from '@ant-design/icons-vue'
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

const selKey = ref('' as string | undefined)
const router = useRouter()

function onMuItmClick({ key }: { key: string }) {
  router.push('/component?name=' + key)
}
</script>

<template>
  <a-layout class="h-full">
    <a-layout-header class="p-0 flex items-center justify-between">
      <RouterLink class="w-50 px-5 py-4 flex space-x-2" to="/">
        <img class="w-10" src="@/assets/logo.svg" />
        <h1 class="text-white text-xl mb-0 font-mono">前端组件库</h1>
      </RouterLink>
      <a
        class="mr-5 text-white hover:text-gray-300"
        href="https://github.com/opteacher/frontend-library"
        target="_blank"
      >
        <github-outlined class="text-3xl" />
      </a>
    </a-layout-header>
    <a-layout>
      <a-layout-sider>
        <a-menu
          class="h-full border-r-0"
          theme="dark"
          v-model:selectedKeys="selKey"
          @click="onMuItmClick"
        >
          <a-menu-item key="color-select" class="flex items-baseline mt-0">
            <template #icon>
              <bg-colors-outlined class="text-lg" />
            </template>
            调色盘
          </a-menu-item>
          <a-menu-item key="icon-field" class="flex items-baseline">
            <template #icon>
              <smile-outlined class="text-lg" />
            </template>
            图标库
          </a-menu-item>
          <a-menu-item key="upload-file" class="flex items-baseline">
            <template #icon>
              <upload-outlined class="text-lg" />
            </template>
            上传文件/夹
          </a-menu-item>
          <a-menu-item key="ace-editor" class="flex items-baseline">
            <template #icon>
              <code-sandbox-outlined class="text-lg" />
            </template>
            代码编辑器
          </a-menu-item>
          <a-menu-item key="tag-list" class="flex items-baseline">
            <template #icon>
              <tags-outlined class="text-lg" />
            </template>
            标签列表
          </a-menu-item>
          <a-menu-item key="edit-list" class="flex items-baseline">
            <template #icon>
              <unordered-list-outlined class="text-lg" />
            </template>
            可编辑列表
          </a-menu-item>
          <a-menu-item key="editable-table" class="flex items-baseline">
            <template #icon>
              <table-outlined class="text-lg" />
            </template>
            可编辑表
          </a-menu-item>
          <a-menu-item key="batch-import" class="flex items-baseline">
            <template #icon>
              <import-outlined class="text-lg" />
            </template>
            批量导入
          </a-menu-item>
          <a-menu-item key="batch-export" class="flex items-baseline">
            <template #icon>
              <export-outlined class="text-lg" />
            </template>
            批量导出
          </a-menu-item>
          <a-menu-item key="form-item" class="flex items-baseline">
            <template #icon>
              <form-outlined class="text-lg" />
            </template>
            表单项
          </a-menu-item>
          <a-menu-item key="form-dialog" class="flex items-baseline">
            <template #icon>
              <profile-outlined class="text-lg" />
            </template>
            表单对话框
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content class="m-3"><RouterView /></a-layout-content>
      <a-layout-sider theme="light" width="20vw">
        <a-descriptions title="状态" bordered :column="1" size="small" class="p-3">
          <a-descriptions-item label="Product">Cloud Database</a-descriptions-item>
        </a-descriptions>
      </a-layout-sider>
    </a-layout>
  </a-layout>
</template>
