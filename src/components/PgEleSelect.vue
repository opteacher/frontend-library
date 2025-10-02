<template>
  <div
    class="h-full w-full flex overflow-hidden"
    @mousemove="(e: MouseEvent) => flxDivEmitter.emit('mousemove', e)"
    @mouseup="() => flxDivEmitter.emit('mouseup')"
  >
    <template v-if="curURL">
      <div class="flex-1 relative text-center">
        <a-spin
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          tip="页面元素收集中..."
          :spinning="loading"
        />
        <div class="h-full flex flex-col">
          <webview
            class="overflow-auto flex-1"
            :src="curURL"
            ref="webviewRef"
            disablewebsecurity
            nodeintegrationinsubframes
            webpreferences="allowRunningInsecureContent"
            @did-stop-loading="onPageLoaded"
            @console-message="onWvCslMsg"
            @dom-ready="onWvDomReady"
          />
          <a-space class="px-10 h-8" align="center">
            <AimOutlined />
            <p class="m-0 font-bold">选中元素：</p>
            <template v-if="selKeys.length">
              <p class="mb-0 truncate">{{ selKeys[0] }}</p>
              <a-tooltip>
                <template #title>清空选择</template>
                <a-button type="text" danger @click="onPageEleClear">
                  <template #icon><CloseCircleOutlined /></template>
                </a-button>
              </a-tooltip>
            </template>
          </a-space>
        </div>
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
          @open-change="() => (toolbox.sclVsb = false)"
        >
          <template #icon><ToolOutlined /></template>
          <a-float-button
            tooltip="选择页面元素"
            :type="toolbox.selecting ? 'primary' : 'default'"
            @click="onSelEleClick"
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
          <a-float-button tooltip="缩放页面" @click="() => (toolbox.sclVsb = true)">
            <template #icon><ExpandAltOutlined /></template>
          </a-float-button>
          <a-float-button tooltip="扫描页面元素" @click="onPageLoaded">
            <template #icon><ScanOutlined /></template>
          </a-float-button>
        </a-float-button-group>
        <a-card
          v-if="toolbox.sclVsb"
          class="absolute z-50"
          :style="{
            width: '300px',
            right: toolbox.offset.right + 48 + 'px',
            bottom: toolbox.offset.bottom + 'px'
          }"
          size="small"
        >
          <div class="flex items-center">
            <a-slider
              class="flex-1"
              v-model:value="toolbox.scale"
              :marks="{ 0: '缩小', 50: '100%', 100: '放大' }"
              :tip-formatter="(val?: number) => val ? (val << 1) : 100"
              @change="onWvZoomChange"
            >
              <template #mark="{ point, label }: any">
                <a-tooltip v-if="point === 100">
                  <template #title>{{ label }}</template>
                  <ZoomInOutlined />
                </a-tooltip>
                <a-tooltip v-else-if="point === 0">
                  <template #title>{{ label }}</template>
                  <ZoomOutOutlined />
                </a-tooltip>
                <a-button
                  v-else-if="point === 50"
                  class="mt-1"
                  size="small"
                  type="text"
                  @click="() => (toolbox.scale = 50)"
                >
                  {{ label }}
                </a-button>
              </template>
            </a-slider>
            <a-button class="ms-3" type="link" danger @click="() => (toolbox.sclVsb = false)">
              <template #icon><CloseCircleOutlined /></template>
            </a-button>
          </div>
        </a-card>
        <a-dropdown :trigger="['contextmenu']">
          <div
            class="absolute top-0 left-0 bottom-14 right-5"
            :style="{ display: toolbox.maskVsb ? 'block' : 'none' }"
            @wheel="onMaskScroll"
          >
            <svg
              class="w-full h-full"
              @mousemove="onMskMouseMove"
              @mouseup="onMskMouseUp"
              @click="() => onPageEleClick()"
            >
              <rect
                v-if="hoverEl.rectBox.width"
                class="cursor-pointer"
                :x="hoverEl.rectBox.x - mskOffset.left"
                :y="hoverEl.rectBox.y - mskOffset.top"
                :rx="4"
                :ry="4"
                :width="hoverEl.rectBox.width"
                :height="hoverEl.rectBox.height"
                :style="{
                  'fill-opacity': 0,
                  'stroke-width': 3,
                  stroke: toolbox.selColor
                }"
              />
              <rect
                v-else-if="selRect.width"
                class="cursor-pointer"
                :x="selRect.x - mskOffset.left"
                :y="selRect.y - mskOffset.top"
                :rx="4"
                :ry="4"
                :width="selRect.width"
                :height="selRect.height"
                :style="{
                  'fill-opacity': 0,
                  'stroke-width': 3,
                  stroke: toolbox.selColor
                }"
              />
              <rect
                v-for="xpath in hlEles.filter(xpath => xpath in eleDict)"
                :key="xpath"
                class="cursor-pointer"
                :class="{ invisible: selKeys.includes(xpath) }"
                :x="eleDict[xpath].rectBox.x - mskOffset.left"
                :y="eleDict[xpath].rectBox.y - mskOffset.top"
                :rx="4"
                :ry="4"
                :width="eleDict[xpath].rectBox.width"
                :height="eleDict[xpath].rectBox.height"
                :style="{
                  'fill-opacity': 0,
                  'stroke-width': 3,
                  stroke: toolbox.stkColor
                }"
                @click="() => onPageEleClick(xpath)"
              />
            </svg>
            <a-button
              v-if="selRect.width"
              class="absolute"
              danger
              type="text"
              size="small"
              :style="{
                top: selRect.y - mskOffset.top + 'px',
                left: selRect.x - mskOffset.left + selRect.width + 5 + 'px'
              }"
              @click="onPageEleClear"
            >
              <template #icon><CloseOutlined /></template>
            </a-button>
            <a-tag
              v-for="(xpath, index) in hlEles.filter(xpath => xpath in eleDict)"
              :key="xpath"
              class="absolute cursor-pointer"
              :class="{ invisible: selKeys.includes(xpath) }"
              :style="{
                top: eleDict[xpath].rectBox.y - mskOffset.top + 'px',
                left:
                  eleDict[xpath].rectBox.x -
                  mskOffset.left +
                  eleDict[xpath].rectBox.width +
                  5 +
                  'px'
              }"
              :color="toolbox.stkColor"
              @click="() => onPageEleClick(xpath)"
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
      <FlexDivider
        orientation="vertical"
        v-model:wid-hgt="eleTree.width"
        :is-hide="!eleTree.visible"
        :emitter="flxDivEmitter"
        :hbtnPos="{ bottom: '10px' }"
        hbtnTxt="元素树"
        @hbtn-click="() => swchBoolProp(eleTree, 'visible')"
      />
      <div v-if="eleTree.visible" class="h-full flex flex-col" :style="{ width: eleTree.width + 'px' }">
        <slot name="sideTop" />
        <div class="flex-1 relative">
          <a-tree
            class="overflow-auto absolute top-0 bottom-0 left-0 right-0"
            :auto-expand-parent="true"
            :tree-data="eleTree.data"
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
        </div>
        <slot name="sideBottom" />
      </div>
    </template>
    <div v-else class="flex-1 relative">
      <a-typography-paragraph class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <slot name="empty" />
      </a-typography-paragraph>
    </div>
  </div>
</template>

<script setup lang="ts" name="pgEleSelect">
import { computed, reactive, ref, type PropType } from 'vue'
import type { WebviewTag } from 'electron'
import type { TreeProps } from 'ant-design-vue'
import PageEle from '../types/pageEle'
import { rmvStartsOf, swchBoolProp } from '../utils'
import {
  ToolOutlined,
  SelectOutlined,
  BorderOutlined,
  CloseOutlined,
  CloseSquareOutlined,
  CloseCircleOutlined,
  ExpandAltOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ScanOutlined,
  AimOutlined
} from '@ant-design/icons-vue'
import { TinyEmitter } from 'tiny-emitter'
import FlexDivider from './FlexDivider.vue'

const props = defineProps({
  curURL: { type: String, required: true },
  hlEles: { type: Array as PropType<string[]>, default: [] },
  emitter: { type: Object as PropType<TinyEmitter>, default: () => new TinyEmitter() },
  sbarWid: { type: Number, default: 200 },
  loading: { type: Boolean, default: false },
  selKeys: { type: Array as PropType<string[]>, required: true }
})
const emit = defineEmits(['update:selKeys', 'pageLoaded', 'update:loading'])
const webviewRef = ref<WebviewTag | null>(null)
const mskOffset = reactive({ top: 0, left: 0 })
const eleTree = reactive({
  data: undefined as TreeProps['treeData'],
  width: props.sbarWid,
  visible: true
})
const hoverEl = reactive(new PageEle())
const selRect = computed(() => 
  props.selKeys.length
    ? eleDict.value[props.selKeys[0]].rectBox
    : PageEle.newRect()
)
const expKeys = ref<string[]>([])
const eleDict = ref<Record<string, PageEle>>({})
const toolbox = reactive({
  offset: { bottom: 60, right: 40 },
  orgPos: { bottom: 60, right: 40 },
  mosPos: { x: -1, y: -1 },
  expand: false,
  selecting: false,
  maskVsb: true,
  selColor: 'red',
  stkColor: 'green',
  scale: 50,
  sclVsb: false
})
const flxDivEmitter = new TinyEmitter()
defineExpose({ webviewRef })

props.emitter.on('reload', (force?: boolean) => 
  force ? webviewRef.value?.reload() : onPageLoaded()
)

async function onPageLoaded() {
  await new Promise(resolve => setTimeout(resolve, 2000))
  toolbox.scale = (webviewRef.value?.getZoomFactor() || 1) * 50
  const elements: PageEle[] = JSON.parse(
    await webviewRef.value?.executeJavaScript(`
      JSON.stringify(Array.from(document.getElementsByTagName('*')).map(function(el) {
        const tagName = el.tagName.toLowerCase()
        const ret = {
          tagName,
          clazz: el.className,
          rectBox: el.getBoundingClientRect()
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
  ).map((el: any) => PageEle.copy(el))

  let treeData: TreeProps['treeData'] = []
  for (const element of elements) {
    const xpaths = element.xpath.split('/').filter(sec => sec)
    let subNodes = treeData
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
  eleTree.data = treeData
  emit('update:selKeys', [])
  emit('update:loading', false)
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
  const el = poiOnEle(e.offsetX + mskOffset.left, e.offsetY + mskOffset.top)
  if (el) {
    PageEle.copy(el, hoverEl, true)
  }
}
function onMskMouseUp(e: MouseEvent) {
  if (e.button === 2) {
    e.preventDefault()
    const el = poiOnEle(e.offsetX, e.offsetY)
    if (el) {
      PageEle.copy(el, hoverEl, true)
    }
  }
}
function poiOnEle(x: number, y: number): PageEle | null {
  const els = []
  for (const el of Object.values(eleDict.value)) {
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
function onSelEleClick() {
  swchBoolProp(toolbox, 'selecting')
  if (!toolbox.selecting) {
    emit('update:selKeys', [])
  }
}
function onPageEleClick(elXpath = hoverEl.xpath) {
  toolbox.selecting = false
  emit('update:selKeys', [elXpath])
}
function onPageEleClear() {
  hoverEl.reset()
  emit('update:selKeys', [])
}
function onWvZoomChange(newVal: number) {
  webviewRef.value?.setZoomFactor((newVal << 1) / 100)
}
</script>

<style>
.mbtn-cursor-move .ant-float-btn {
  cursor: move !important;
}
</style>