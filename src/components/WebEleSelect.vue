<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { WebviewTag } from 'electron'
import type { TreeProps } from 'ant-design-vue'
import type WebEle from '../types/webEle'

defineProps({
  curURL: { type: String, required: true }
})
const emit = defineEmits(['update:selKeys', 'pageLoaded'])
const webviewIns = ref<WebviewTag | null>(null)
const webviewCtnr = ref<HTMLElement | null>(null)
const mskOffset = reactive({ top: 0, left: 0 })
const loading = ref(false)
const treeData = ref<TreeProps['treeData']>()
const selKeys = ref<string[]>([])
const expKeys = ref<string[]>([])
const eleDict = ref<Record<string, WebEle>>({})

function onCtnrScroll(e: any) {
  console.log(e)
  mskOffset.top = (e.target as HTMLElement).scrollTop
  mskOffset.left = (e.target as HTMLElement).scrollLeft
}
async function onPageLoaded() {
  const elements = JSON.parse(
    await webviewIns.value?.executeJavaScript(`
      JSON.stringify(Array.from(document.getElementsByTagName('*')).map(function(el) {
        const tagName = el.tagName.toLowerCase()
        const ret = {
          tagName,
          clazz: el.className,
          rectBox: el.getBoundingClientRect().toJSON()
        }
        if (['style', 'script', 'link', 'meta', 'head', 'header', 'title'].includes(tagName)) {
          return
        }
        if (el === document.body) {
          return { xpath: '/html/body', ...ret }
        }
        if (el.id !== '') {
          return { xpath: '//*[@id="' + el.id + '"]', id: el.id, ...ret }
        }
        let index = 1
        const siblings = el.parentElement && el.parentElement.children
          ? el.parentElement.children : []
        for (const sibling of siblings) {
          if (sibling === el) {
            const prtEl = arguments.callee(el.parentElement)
            return prtEl
              ? {
                  xpath: prtEl.xpath + '/' + tagName + '[' + index + ']',
                  ...ret
                }
              : undefined
          }
          if (sibling.nodeType === 1 && sibling.tagName === el.tagName) {
            index++
          }
        }
      }).filter(el => el))
    `)
  ) as WebEle[]

  let tdata: TreeProps['treeData'] = []
  for (const element of elements) {
    const xpaths = element.xpath.split('/').filter(sec => sec)
    let subNodes = tdata
    let lastNode = null

    for (const [idx, xp] of xpaths.entries()) {
      lastNode = subNodes.find(nd => nd.title === xp)
      if (lastNode) {
        subNodes = lastNode.children || []
      } else {
        const prefix = xpaths[0].startsWith('*') ? '//' : '/'
        lastNode = {
          key: prefix + xpaths.slice(0, idx + 1).join('/'),
          title: xp,
          children: []
        }
        subNodes.push(lastNode)
        subNodes = lastNode.children
      }
    }

    if (lastNode) {
      lastNode.element = element
    }
  }
  eleDict.value = Object.fromEntries(elements.map((el: any) => [el.xpath, el]))
  treeData.value = tdata
  selKeys.value = []
  loading.value = false
}
</script>

<template>
  <div class="h-full w-full flex overflow-hidden">
    <template v-if="curURL">
      <div class="flex-1 relative left-0 right-0 overflow-hidden">
        <div v-if="loading" class="h-full text-center relative z-50 bg-black opacity-10">
          <a-spin
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            tip="页面元素收集中..."
          />
        </div>
        <div
          ref="webviewCtnr"
          class="overflow-auto absolute left-0 top-0 bottom-0 right-0"
          @scroll="onCtnrScroll"
        >
          <webview
            class="w-full h-full border-none overflow-hidden"
            :src="curURL"
            ref="webviewIns"
            disablewebsecurity
            nodeintegrationinsubframes
            webpreferences="allowRunningInsecureContent"
            @did-stop-loading="onPageLoaded"
            @console-message="(e: any) => console.log(e.message)"
          />
        </div>
      </div>
      <a-spin wrapperClassName="w-[20vw]" tip="页面元素收集中..." :spinning="loading">
        <a-tree
          class="overflow-auto absolute top-0 bottom-0 left-0 right-0"
          :auto-expand-parent="true"
          :tree-data="treeData"
          v-model:expendedKeys="expKeys"
          :selectedKeys="selKeys"
          @select="(selKeys: string[]) => emit('update:selKeys', selKeys)"
        >
          <template #title="{ dataRef }">
            {{ dataRef.element ? dataRef.element.tagName : dataRef.title }}&nbsp;
            <template v-if="dataRef.element">
              <span v-if="dataRef.element.id">#{{ dataRef.element.id }}</span>
              <span v-else-if="dataRef.element.clazz">.{{ dataRef.element.clazz }}</span>
            </template>
          </template>
        </a-tree>
      </a-spin>
    </template>
    <div v-else class="flex-1 relative">
      <a-typography-paragraph class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <ol>
          <li>
            <a-typography-text type="secondary">登录类型选择【网页登录】</a-typography-text>
          </li>
          <li>
            <a-typography-text type="secondary">在【地址栏】输入网址</a-typography-text>
          </li>
          <li>
            <a-typography-text type="secondary">
              点击【跳转】加载网页并收集网页元素
            </a-typography-text>
          </li>
          <li>
            <a-typography-text type="secondary">给登录表单的元素绑定账户信息</a-typography-text>
          </li>
          <li>
            <a-typography-text type="secondary">
              点击【保存】绑定网页元素与账户信息
            </a-typography-text>
          </li>
        </ol>
      </a-typography-paragraph>
    </div>
  </div>
</template>