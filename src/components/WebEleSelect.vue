<script setup lang="ts">
import { reactive, ref, type PropType } from 'vue'
import type { WebviewTag } from 'electron'
import type { TreeProps } from 'ant-design-vue'
import PageEle from '../types/pageEle'
import { rmvStartsOf, swchBoolProp } from '../utils'
import {
  ToolOutlined,
  SelectOutlined,
  BorderOutlined,
  CloseOutlined,
  CloseSquareOutlined
} from '@ant-design/icons-vue'

defineProps({
  curURL: { type: String, required: true },
  hlEles: { type: Array as PropType<PageEle[]>, default: [] }
})
const emit = defineEmits(['update:selKeys', 'pageLoaded'])
const webviewRef = ref<WebviewTag | null>(null)
const mskOffset = reactive({ top: 0, left: 0 })
const loading = ref(false)
const treeData = ref<TreeProps['treeData']>()
const selected = reactive({
  keys: [] as string[],
  rect: { x: 0, y: 0, w: 0, h: 0 }
})
const expKeys = ref<string[]>([])
const eleDict = ref<Record<string, PageEle>>({})
const toolbox = reactive({
  offset: { bottom: 40, right: 40 },
  orgPos: { bottom: 40, right: 40 },
  mosPos: { x: -1, y: -1 },
  expand: false,
  selecting: false,
  maskVsb: true,
  selColor: 'red',
  stkColor: 'green'
})

async function onPageLoaded() {
  const elements: PageEle[] = JSON.parse(
    await webviewRef.value?.executeJavaScript(`
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
  ).then((els: any[]) => els.map(el => PageEle.copy(el)))

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
  selected.keys = []
  loading.value = false
}
function onWvDomReady() {
  webviewRef.value?.executeJavaScript(`
    document.addEventListener('scroll', (e) => {
      console.log('[scroll]:', JSON.stringify({
        top: window.scrollY,
        left: window.scrollX
      }))
    })
  `)
}
function onCtnrScroll(e: { top: number; left: number }) {
  mskOffset.top = e.top
  mskOffset.left = e.left
}
function onWvCslMsg(e: { message: string }) {
  switch(true) {
    case e.message.startsWith('[scroll]:'):
      onCtnrScroll(JSON.parse(rmvStartsOf(e.message, '[scroll]:').trim()))
  }
}
function onTboxMouseDown(e: MouseEvent) {
  toolbox.mosPos.x = e.clientX
  toolbox.mosPos.y = e.clientY
  toolbox.orgPos.right = toolbox.offset.right
  toolbox.orgPos.bottom = toolbox.offset.bottom
}
function onTboxMouseMove(e: MouseEvent) {
  if (toolbox.mosPos.x !== -1) {
    toolbox.offset.right = toolbox.orgPos.right + toolbox.mosPos.x - e.clientX
    toolbox.offset.bottom = toolbox.orgPos.bottom + toolbox.mosPos.y - e.clientY
  }
}
function onTboxMouseUp() {
  toolbox.mosPos = { x: -1, y: -1 }
  toolbox.expand = false
}
function onRgtMnuClick() {

}
async function onMaskScroll(e: WheelEvent) {
  await webviewRef.value?.executeJavaScript(`
    window.scroll({
      top: window.scrollY + ${e.deltaY},
      left: window.scrollX + ${e.deltaX},
      behavior: 'smooth'
    })
  `)
}
function onMskMouseMove(e: MouseEvent) {
  e.preventDefault()
  if (!toolbox.selecting) {
    return
  }
  const el = poiOnEle(e.offsetX, e.offsetY)
  selected.keys = el ? [el.xpath] : []
}
function onMskMouseUp(e: MouseEvent) {
  if (e.button === 2) {
    e.preventDefault()
    const el = poiOnEle(e.offsetX, e.offsetY)
    selected.keys = el ? [el.xpath] : []
  }
}
function poiOnEle(x: number, y: number): PageEle | null {
  const els = []
  for (const el of Object.values(eleDict.value)) {
    console.log(el)
    if (el.inRect(x, y)) {
      els.push(el)
    }
  }
  const minRect = {
    width: Number.MAX_VALUE,
    height: Number.MAX_VALUE,
    el: null as PageEle | null
  }
  for (const el of els) {
    if (el.rectBox.width < minRect.width
    && el.rectBox.height < minRect.height) {
      minRect.el = el
    }
  }
  return minRect.el
}
</script>

<template>
  <div class="h-full w-full flex overflow-hidden">
    <template v-if="curURL">
      <div class="flex-1 relative">
        <div
          v-if="loading"
          class="h-full text-center relative z-50 bg-black opacity-10"
        >
          <a-spin
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            tip="页面元素收集中..."
          />
        </div>
        <webview
          v-else
          class="overflow-auto w-full h-full"
          :src="curURL"
          ref="webviewRef"
          disablewebsecurity
          nodeintegrationinsubframes
          webpreferences="allowRunningInsecureContent"
          @did-stop-loading="onPageLoaded"
          @console-message="onWvCslMsg"
          @dom-ready="onWvDomReady"
        />
        <a-float-button-group
          v-if="!loading"
          class="absolute"
          :class="{
            'mbtn-cursor-move': toolbox.mosPos.x !== -1
          }"
          trigger="click"
          type="primary"
          :style="{
            right: toolbox.offset.right + 'px',
            bottom: toolbox.offset.bottom + 'px'
          }"
          v-model:open="toolbox.expand"
          @mousedown="onTboxMouseDown"
          @mousemove="onTboxMouseMove"
          @mouseup="onTboxMouseUp"
        >
          <template #icon><ToolOutlined /></template>
          <a-float-button
            tooltip="选择页面元素"
            :type="toolbox.selecting ? 'primary' : 'default'"
            @click="() => swchBoolProp(toolbox, 'selecting')"
          >
            <template #icon><SelectOutlined /></template>
          </a-float-button>
          <a-float-button tooltip="选择框颜色" >
            <template #icon>
              <BorderOutlined :style="{ color: toolbox.selColor }" />
            </template>
          </a-float-button>
          <a-float-button
            tooltip="关闭页面遮罩" 
            :type="toolbox.maskVsb ? 'primary' : 'default'"
            @click="() => swchBoolProp(toolbox, 'maskVsb')"
          >
            <template #icon><CloseSquareOutlined /></template>
          </a-float-button>
        </a-float-button-group>
        <a-dropdown :trigger="['contextmenu']">
          <div
            class="absolute top-0 left-0 bottom-4 right-4"
            :style="{ display: toolbox.maskVsb ? 'block' : 'none' }"
            @wheel="onMaskScroll"
          >
            <svg
              class="w-full h-full"
              @mousemove="onMskMouseMove"
              @mouseup="onMskMouseUp"
            >
              <rect
                v-if="selected.rect.w"
                :x="mskOffset.left + selected.rect.x"
                :y="mskOffset.top + selected.rect.y"
                :rx="4"
                :ry="4"
                :width="selected.rect.w"
                :height="selected.rect.h"
                :style="{
                  'fill-opacity': 0,
                  'stroke-width': 3,
                  stroke: toolbox.selColor
                }"
              />
              <rect
                v-for="el in hlEles.filter(el => el.xpath in eleDict)"
                :key="el.xpath"
                class="cursor-pointer"
                :class="{ invisible: selected.keys.includes(el.xpath) }"
                :x="mskOffset.left + eleDict[el.xpath].rectBox.x"
                :y="mskOffset.top + eleDict[el.xpath].rectBox.y"
                :rx="4"
                :ry="4"
                :width="eleDict[el.xpath].rectBox.width"
                :height="eleDict[el.xpath].rectBox.height"
                :style="{
                  'fill-opacity': 0,
                  'stroke-width': 3,
                  stroke: toolbox.stkColor
                }"
                @click="() => emit('update:selKeys', [el.xpath])"
              />
            </svg>
            <a-button
              v-if="selected.rect.w"
              class="absolute"
              danger
              type="text"
              size="small"
              :style="{
                top: mskOffset.top + selected.rect.y + 'px',
                left: mskOffset.left + selected.rect.x + selected.rect.w + 5 + 'px'
              }"
              @click="() => emit('update:selKeys', [])"
            >
              <template #icon><CloseOutlined /></template>
            </a-button>
            <a-tag
              v-for="(el, index) in hlEles.filter(el => el.xpath in eleDict)"
              :key="el.xpath"
              class="absolute cursor-pointer"
              :class="{ invisible: selected.keys.includes(el.xpath) }"
              :style="{
                top: mskOffset.top + eleDict[el.xpath].rectBox.y + 'px',
                left:
                  mskOffset.left +
                  eleDict[el.xpath].rectBox.x +
                  eleDict[el.xpath].rectBox.width +
                  5 +
                  'px'
              }"
              :color="toolbox.stkColor"
              @click="() => emit('update:selKeys', [el.xpath])"
            >
              {{ index + 1 }}
            </a-tag>
          </div>
          <template #overlay>
            <a-menu @click="onRgtMnuClick">
              <a-menu-item key="select">检查</a-menu-item>
              <a-menu-item key="clear">清空选择</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
      <a-spin wrapperClassName="w-[20vw]" tip="页面元素收集中..." :spinning="loading">
        <a-tree
          class="overflow-auto absolute top-0 bottom-0 left-0 right-0"
          :auto-expand-parent="true"
          :tree-data="treeData"
          v-model:expendedKeys="expKeys"
          :selectedKeys="selected.keys"
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

<style>
.mbtn-cursor-move .ant-float-btn {
  cursor: move !important;
}
</style>