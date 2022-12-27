<script setup lang="ts">
import { ControlOutlined } from '@ant-design/icons-vue'
import Mapper from '@lib/types/mapper'
import { TinyEmitter as Emitter } from 'tiny-emitter'
import { reactive } from 'vue'

const mapper = reactive(new Mapper({
  test: {
    label: '测试测试',
    type: 'Input',
    placeholder: '输入测试'
  }
}))
const emitter = new Emitter()

function testCopy(src: any, tgt?: { test: string }) {
  tgt = tgt || { test: '' }
  tgt.test = src.test || tgt.test
  return tgt
}
function onSubmit(formSbt: any, next: () => void) {
  console.log(formSbt)
  next()
}
</script>

<template>
  <a-layout class="h-full">
    <a-layout-content class="p-3">
      <a-button class="w-full" @click="emitter.emit('update:show', { show: true })">打开对话框</a-button>
      <FormDialog :copy="testCopy" :mapper="mapper" :emitter="emitter" @submit="onSubmit" />
    </a-layout-content>
    <a-layout-sider class="h-full p-3 overflow-y-auto" theme="light" width="30vw">
      <a-space class="mb-3" align="center">
        <control-outlined class="text-xl" />
        <h1 class="text-xl font-bold">状态栏</h1>
      </a-space>
    </a-layout-sider>
  </a-layout>
</template>
