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
  GithubOutlined,
  GroupOutlined
} from '@ant-design/icons-vue'
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const selKeys = computed<string[]>(() => [
  route.query.name ? (route.query.name as string) : (route.path.split('/').pop() as string)
])

function onSdMuItmClick({ key }: { key: string }) {
  router.push('/component?name=' + key)
}
</script>

<template>
  <a-layout class="h-full">
    <a-layout-header class="p-0 flex items-center justify-between">
      <RouterLink class="w-50 px-5 py-4 flex space-x-2" to="/">
        <img class="w-10" src="@/assets/logo.svg" />
        <div class="text-xl inline-block align-middle">
          <p class="text-white mb-0 font-mono inline-block align-middle">前端组件库</p>
        </div>
      </RouterLink>
      <a
        class="mr-5 text-white hover:text-gray-300 text-3xl"
        href="https://github.com/opteacher/frontend-library"
        target="_blank"
      >
        <github-outlined />
      </a>
    </a-layout-header>
    <a-layout>
      <a-layout-sider>
        <a-menu
          class="h-full border-r-0"
          theme="dark"
          :selectedKeys="selKeys"
          @click="onSdMuItmClick"
        >
          <a-menu-item key="ColorSelect" class="flex items-center mt-0">
            <template #icon>
              <bg-colors-outlined class="icon-lg" />
            </template>
            调色盘
          </a-menu-item>
          <a-menu-item key="IconField" class="flex items-center">
            <template #icon>
              <smile-outlined class="icon-lg" />
            </template>
            图标库
          </a-menu-item>
          <a-menu-item key="UploadFile" class="flex items-center">
            <template #icon>
              <upload-outlined class="icon-lg" />
            </template>
            上传文件/夹
          </a-menu-item>
          <a-menu-item key="CodeEditor" class="flex items-center">
            <template #icon>
              <code-sandbox-outlined class="icon-lg" />
            </template>
            代码编辑器
          </a-menu-item>
          <a-menu-item key="TagList" class="flex items-center">
            <template #icon>
              <tags-outlined class="icon-lg" />
            </template>
            标签列表
          </a-menu-item>
          <a-menu-item key="EditList" class="flex items-center">
            <template #icon>
              <unordered-list-outlined class="icon-lg" />
            </template>
            可编辑列表
          </a-menu-item>
          <a-menu-item key="EditableTable" class="flex items-center">
            <template #icon>
              <table-outlined class="icon-lg" />
            </template>
            可编辑表
          </a-menu-item>
          <a-menu-item key="BatchImport" class="flex items-center">
            <template #icon>
              <import-outlined class="icon-lg" />
            </template>
            批量导入
          </a-menu-item>
          <a-menu-item key="BatchExport" class="flex items-center">
            <template #icon>
              <export-outlined class="icon-lg" />
            </template>
            批量导出
          </a-menu-item>
          <a-menu-item key="FormItem" class="flex items-center">
            <template #icon>
              <form-outlined class="icon-lg" />
            </template>
            表单项
          </a-menu-item>
          <a-menu-item key="FormGroup" class="flex items-center">
            <template #icon>
              <group-outlined class="icon-lg" />
            </template>
            表单组
          </a-menu-item>
          <a-menu-item key="FormDialog" class="flex items-center">
            <template #icon>
              <profile-outlined class="icon-lg" />
            </template>
            表单对话框
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content class="h-full overflow-hidden"><RouterView /></a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style>
.icon-lg {
  font-size: 1.125rem !important;
}
</style>
