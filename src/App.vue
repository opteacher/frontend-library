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
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

const selKey = ref([] as string[])
const route = useRoute()
const router = useRouter()

onMounted(() => {
  if (route.query.name) {
    selKey.value = [route.query.name as string]
  }
})

function onSdMuItmClick({ key }: { key: string }) {
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
          @click="onSdMuItmClick"
        >
          <a-menu-item key="ColorSelect" class="flex items-baseline mt-0">
            <template #icon>
              <bg-colors-outlined class="text-lg" />
            </template>
            调色盘
          </a-menu-item>
          <a-menu-item key="IconField" class="flex items-baseline">
            <template #icon>
              <smile-outlined class="text-lg" />
            </template>
            图标库
          </a-menu-item>
          <a-menu-item key="UploadFile" class="flex items-baseline">
            <template #icon>
              <upload-outlined class="text-lg" />
            </template>
            上传文件/夹
          </a-menu-item>
          <a-menu-item key="AceEditor" class="flex items-baseline">
            <template #icon>
              <code-sandbox-outlined class="text-lg" />
            </template>
            代码编辑器
          </a-menu-item>
          <a-menu-item key="TagList" class="flex items-baseline">
            <template #icon>
              <tags-outlined class="text-lg" />
            </template>
            标签列表
          </a-menu-item>
          <a-menu-item key="EditList" class="flex items-baseline">
            <template #icon>
              <unordered-list-outlined class="text-lg" />
            </template>
            可编辑列表
          </a-menu-item>
          <a-menu-item key="EditableTable" class="flex items-baseline">
            <template #icon>
              <table-outlined class="text-lg" />
            </template>
            可编辑表
          </a-menu-item>
          <a-menu-item key="BatchImport" class="flex items-baseline">
            <template #icon>
              <import-outlined class="text-lg" />
            </template>
            批量导入
          </a-menu-item>
          <a-menu-item key="BatchExport" class="flex items-baseline">
            <template #icon>
              <export-outlined class="text-lg" />
            </template>
            批量导出
          </a-menu-item>
          <a-menu-item key="FormItem" class="flex items-baseline">
            <template #icon>
              <form-outlined class="text-lg" />
            </template>
            表单项
          </a-menu-item>
          <a-menu-item key="FormDialog" class="flex items-baseline">
            <template #icon>
              <profile-outlined class="text-lg" />
            </template>
            表单对话框
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content class="h-full"><RouterView /></a-layout-content>
    </a-layout>
  </a-layout>
</template>
