<script setup lang="ts">
import {
  BgColorsOutlined,
  UploadOutlined,
  CodeSandboxOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  TableOutlined,
  ImportOutlined,
  ExportOutlined
} from '@ant-design/icons-vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <a-layout class="h-full">
    <a-layout-header class="p-0 flex items-center">
      <RouterLink class="w-50 px-5 py-4 flex space-x-2" to="/">
        <img class="w-10" src="@/assets/logo.svg" />
        <h1 class="text-white text-xl mb-0 font-mono">前端组件库</h1>
      </RouterLink>
    </a-layout-header>
    <a-layout>
      <a-layout-sider>
        <a-menu class="h-full border-r-0" theme="dark">
          <a-menu-item key="1" class="flex items-baseline mt-0">
            <template #icon>
              <bg-colors-outlined class="text-lg" />
            </template>
            <RouterLink to="/color-select">调色盘</RouterLink>
          </a-menu-item>
          <a-menu-item key="2" class="flex items-baseline">
            <template #icon>
              <upload-outlined class="text-lg" />
            </template>
            <RouterLink to="/upload-file">上传文件/夹</RouterLink>
          </a-menu-item>
          <a-menu-item key="3" class="flex items-baseline">
            <template #icon>
              <code-sandbox-outlined class="text-lg" />
            </template>
            <RouterLink to="/ace-editor">代码编辑器</RouterLink>
          </a-menu-item>
          <a-menu-item key="4" class="flex items-baseline">
            <template #icon>
              <tags-outlined class="text-lg" />
            </template>
            <RouterLink to="/tag-list">标签列表</RouterLink>
          </a-menu-item>
          <a-menu-item key="5" class="flex items-baseline">
            <template #icon>
              <unordered-list-outlined class="text-lg" />
            </template>
            <RouterLink to="/edit-list">可编辑列表</RouterLink>
          </a-menu-item>
          <a-menu-item key="6" class="flex items-baseline">
            <template #icon>
              <table-outlined class="text-lg" />
            </template>
            <RouterLink to="/editable-table">可编辑表</RouterLink>
          </a-menu-item>
          <a-menu-item key="7" class="flex items-baseline">
            <template #icon>
              <import-outlined class="text-lg" />
            </template>
            <RouterLink to="/batch-import">批量导入</RouterLink>
          </a-menu-item>
          <a-menu-item key="8" class="flex items-baseline">
            <template #icon>
              <export-outlined class="text-lg" />
            </template>
            <RouterLink to="/batch-export">批量导出</RouterLink>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content><RouterView /></a-layout-content>
    </a-layout>
  </a-layout>
</template>
