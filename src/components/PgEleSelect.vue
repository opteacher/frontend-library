<template>
  <div
    class="h-full w-full flex overflow-hidden"
    @mousemove="
      (e: MouseEvent) => Object.values(flxDivs).map(({ emitter }) => emitter.emit('mousemove', e))
    "
    @mouseup="() => Object.values(flxDivs).map(({ emitter }) => emitter.emit('mouseup'))"
  >
    <template v-if="url">
      <div class="flex-1 relative text-center">
        <div v-if="loading" class="absolute top-0 left-0 bottom-0 right-0 z-50 bg-[#ffffffe0]">
          <a-spin
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            tip="页面元素收集中..."
            :spinning="loading"
          />
        </div>
        <div class="h-full flex flex-col">
          <div v-if="addrBar" class="flex space-x-3 px-5">
            <a-input-group class="w-16" compact>
              <a-button
                class="w-1/2"
                :disabled="loading || (isDomReady && !webviewRef?.canGoBack())"
                @click="webviewRef?.goBack()"
              >
                <template #icon><LeftOutlined /></template>
              </a-button>
              <a-button
                class="w-1/2"
                :disabled="loading || (isDomReady && !webviewRef?.canGoForward())"
                @click="webviewRef?.goForward()"
              >
                <template #icon><RightOutlined /></template>
              </a-button>
            </a-input-group>
            <a-input-group class="flex-1 flex" compact>
              <a-input class="flex-1 text-left" :disabled="loading" :value="url">
                <template #prefix><SendOutlined /></template>
              </a-input>
              <a-button type="primary" :loading="loading">跳转</a-button>
            </a-input-group>
          </div>
          <webview
            class="overflow-auto flex-1"
            :src="url"
            ref="webviewRef"
            allowpopups
            disablewebsecurity
            nodeintegrationinsubframes
            webpreferences="allowRunningInsecureContent"
            @did-stop-loading="onPageLoaded"
            @console-message="onWvCslMsg"
            @dom-ready="onWvDomReady"
          />
          <a-space class="px-10 h-8" align="center">
            <AimOutlined />
            <p class="m-0 font-bold">选中元素</p>
            <a-select
              class="w-20"
              :options="[
                { label: 'XPath', value: 'xpath' },
                { label: 'ID或类', value: 'idCls' },
                { label: '标签', value: 'tagName' }
              ]"
              size="small"
              :disabled="!selKeys.length"
              :value="eleTree.elIdType"
              @change="onEleIdenChange"
            />
            ：
            <template v-if="selKeys.length && selKeys[0] in eleDict">
              <p class="mb-0 truncate">{{ getProp(eleDict[selKeys[0]], eleTree.elIdType) }}</p>
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
            @click="onSelEleStart"
          >
            <template #icon><SelectOutlined /></template>
          </a-float-button>
          <a-float-button tooltip="选择框颜色">
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
          <a-float-button tooltip="扫描页面元素" @click="onScanElesClick">
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
              :tip-formatter="(val?: number) => (val ? val << 1 : 100)"
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
            id="pageMask"
            class="absolute left-0 bottom-14 right-5"
            :class="{ 'top-8': addrBar, 'top-0': !addrBar }"
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
                v-if="hovEle.rectBox.width"
                class="cursor-pointer"
                :x="hovEle.rectBox.x - mskOffset.left"
                :y="hovEle.rectBox.y - mskOffset.top"
                :rx="4"
                :ry="4"
                :width="hovEle.rectBox.width"
                :height="hovEle.rectBox.height"
                :style="{
                  'fill-opacity': 0,
                  'stroke-width': 3,
                  stroke: toolbox.selColor
                }"
              />
              <rect
                v-else-if="selEle"
                class="cursor-pointer"
                :x="selEle.rectBox.x - mskOffset.left"
                :y="selEle.rectBox.y - mskOffset.top"
                :rx="4"
                :ry="4"
                :width="selEle.rectBox.width"
                :height="selEle.rectBox.height"
                :style="{
                  'fill-opacity': 0,
                  'stroke-width': 3,
                  stroke: toolbox.selColor
                }"
              />
              <rect
                v-if="!toolbox.selecting && !loading"
                v-for="xpath in Object.values(hlEles).filter(xpath => xpath in eleDict)"
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
              v-if="selEle"
              class="absolute"
              danger
              type="text"
              size="small"
              :style="{
                top: selEle.rectBox.y - mskOffset.top + 'px',
                left: selEle.rectBox.x + selEle.rectBox.width - mskOffset.left + 5 + 'px'
              }"
              @click="onPageEleClear"
            >
              <template #icon><CloseOutlined /></template>
            </a-button>
            <a-tag
              v-if="!toolbox.selecting && !loading"
              v-for="[index, xpath] of Object.entries(hlEles).filter(
                ([_i, xpath]) => xpath in eleDict
              )"
              :key="xpath"
              class="absolute cursor-pointer"
              :class="{ invisible: selKeys.includes(xpath) }"
              :style="{
                top: eleDict[xpath].rectBox.y - mskOffset.top + 'px',
                left:
                  eleDict[xpath].rectBox.x +
                  eleDict[xpath].rectBox.width -
                  mskOffset.left +
                  5 +
                  'px'
              }"
              :color="toolbox.stkColor"
              @click="() => onPageEleClick(xpath)"
            >
              {{ typeof index === 'number' ? index + 1 : index }}
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
        v-model:wid-hgt="flxDivs.sideTree.widHgt"
        :is-hide="!flxDivs.sideTree.visible"
        :emitter="flxDivs.sideTree.emitter"
        :hbtnPos="{ bottom: '10px' }"
        hbtnTxt="元素树"
        @hbtn-click="() => swchBoolProp(flxDivs, 'sideTree.visible')"
      />
      <div
        v-if="flxDivs.sideTree.visible"
        class="h-full flex flex-col"
        :style="{ width: flxDivs.sideTree.widHgt + 'px' }"
      >
        <slot name="sideTop" />
        <div class="relative" :style="{ height: flxDivs.sideBottom.widHgt + 'px' }">
          <div v-if="loading" class="absolute top-0 left-0 bottom-0 right-0 z-50 bg-[#ffffffe0]">
            <a-spin
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              tip="页面元素收集中..."
              :spinning="loading"
            />
          </div>
          <div class="overflow-auto absolute top-0 bottom-0 left-0 right-0">
            <a-tree
              :blockNode="false"
              :auto-expand-parent="true"
              :tree-data="eleTree.data"
              v-model:expandedKeys="expKeys"
              :selectedKeys="selKeys"
              @select="(keys: string[]) => onPageEleClick(keys[0])"
            >
              <template #title="{ dataRef }">
                {{ dataRef.element ? dataRef.element.tagName : dataRef.title }}&nbsp;
                <span v-if="dataRef.element">{{ dataRef.element.idCls }}</span>
              </template>
            </a-tree>
          </div>
        </div>
        <template v-if="$slots['sideBottom']">
          <FlexDivider
            orientation="horizontal"
            v-model:wid-hgt="flxDivs.sideBottom.widHgt"
            :emitter="flxDivs.sideBottom.emitter"
            :hide-btn="false"
            ctrl-side="leftTop"
          />
          <slot name="sideBottom" />
        </template>
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
import { computed, onMounted, reactive, ref, toRef, watch, type PropType } from 'vue'
import type { WebviewTag } from 'electron'
import type { TreeProps } from 'ant-design-vue'
import PageEle from '../types/pageEle'
import { rmvStartsOf, swchBoolProp, getProp, waitFor, until, getEleByJS } from '../utils'
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
  AimOutlined,
  LeftOutlined,
  RightOutlined,
  SendOutlined
} from '@ant-design/icons-vue'
import { TinyEmitter } from 'tiny-emitter'
import FlexDivider from './FlexDivider.vue'
import FlxDiv from '../types/flxDiv'
import type PgOper from '../types/pgOper'

const props = defineProps({
  url: { type: String, required: true },
  hlEles: {
    type: [Array, Object] as PropType<string[] | Record<string, string>>,
    default: []
  },
  emitter: { type: Object as PropType<TinyEmitter>, default: () => new TinyEmitter() },
  sbarWid: { type: Number, default: 200 },
  loading: { type: Boolean, default: false },
  selKeys: { type: Array as PropType<string[]>, default: [] },
  addrBar: { type: Boolean, default: true }
})
const emit = defineEmits([
  'update:sel-ele',
  'pageLoaded',
  'update:loading',
  'update:elIdType',
  'update:url'
])
const webviewRef = ref<WebviewTag>()
const mskOffset = reactive({ top: 0, left: 0 })
const eleTree = reactive({
  data: undefined as TreeProps['treeData'],
  elIdType: 'xpath'
})
const selKeys = toRef(props.selKeys)
const hovEle = reactive(new PageEle())
const selEle = computed<PageEle | undefined>(() =>
  selKeys.value.length ? eleDict.value[selKeys.value[0]] : undefined
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
defineExpose({ webviewRef, eleDict, selEle, selecting: toolbox.selecting })
const flxDivs = reactive<Record<'sideTree' | 'sideBottom' | 'sideTop', FlxDiv>>({
  sideTree: FlxDiv.copy({ widHgt: props.sbarWid }),
  sideTop: FlxDiv.copy({ orientation: 'horizontal', widHgt: 500 }),
  sideBottom: FlxDiv.copy({ orientation: 'horizontal', widHgt: 500 })
})
const rszObs = new ResizeObserver(() => onPageLoaded(false))
const loading = toRef(props.loading)
const url = toRef<string | undefined>(props.url)
const isDomReady = ref(false)

onMounted(async () => {
  const mask = await waitFor('pageMask')
  if (mask) {
    rszObs.observe(mask as HTMLElement)
  }
})
watch(
  () => props.url,
  (u: string) => {
    url.value = u
    doLoad(true)
  }
)
props.emitter.on('reload', (force?: boolean) => {
  loading.value = true
  emit('update:loading', true)
  force ? webviewRef.value?.reload() : onPageLoaded()
})
props.emitter.on('start-select', () => (toolbox.selecting = true))
props.emitter.on('iden-ele', (key: string) => (selKeys.value = [key]))
props.emitter.on('stop-select', onPageEleClear)
props.emitter.on('exec-opers', onExecOpersEmit)
props.emitter.on('goto-history', gotoHisIdx)

async function onPageLoaded(waitLoading = true) {
  if (waitLoading) {
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  toolbox.scale = (webviewRef.value?.getZoomFactor() || 1) * 50
  let elements: PageEle[] = []
  try {
    elements = await webviewRef.value?.executeJavaScript(`
      JSON.stringify(Array.from(document.getElementsByTagName('*')).map(function(el) {
        const tagName = el.tagName.toLowerCase()
        let idCls = ''
        if (el.id) {
          idCls = '#' + el.id
        } else if (el.className) {
          idCls = '.' + (typeof el.className === 'string' ? el.className : '').split(' ').filter(v => v).join('.')
        }
        const rectBox = el.getBoundingClientRect()
        const ret = { tagName, idCls, rectBox }
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
    .then(ret => ret === 'undefined' ? [] : JSON.parse(ret))
    .then(els => els.map((el: any) => PageEle.copy(el)))
  } catch (e) {
    console.error('获取页面元素失败：', e)
  }

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
  onPageEleSelected(selKeys.value.length ? eleDict.value[selKeys.value[0]] : undefined)
  doLoad(false)
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
  isDomReady.value = true
}
function onCtnrScroll(e: { top: number; left: number }) {
  mskOffset.top = e.top
  mskOffset.left = e.left
}
function onWvCslMsg(e: { message: string }) {
  switch (true) {
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
function onRgtMnuClick() {}
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
    PageEle.copy(el, hovEle, true)
  }
}
function onMskMouseUp(e: MouseEvent) {
  if (e.button === 2) {
    e.preventDefault()
    const el = poiOnEle(e.offsetX, e.offsetY)
    if (el) {
      PageEle.copy(el, hovEle, true)
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
    if (el.rectBox.width < minRect.width && el.rectBox.height < minRect.height) {
      minRect.el = el
    }
  }
  return minRect.el
}
function onSelEleStart() {
  swchBoolProp(toolbox, 'selecting')
  if (!toolbox.selecting) {
    selKeys.value = []
    onPageEleSelected()
  }
}
function onPageEleClick(elXpath = hovEle.xpath) {
  if (elXpath) {
    toolbox.selecting = false
    selKeys.value = [elXpath]
    onPageEleSelected(eleDict.value[elXpath])
    expTreeEle()
  }
}
function onPageEleClear() {
  toolbox.selecting = false
  hovEle.reset()
  selKeys.value = []
  onPageEleSelected()
}
function onPageEleSelected(ele?: PageEle) {
  emit('update:sel-ele', ele)
  props.emitter.emit('ele-selected', ele)
}
function onWvZoomChange(newVal: number) {
  webviewRef.value?.setZoomFactor((newVal << 1) / 100)
}
function onEleIdenChange(elIdType: 'xpath' | 'idCls' | 'tagName') {
  eleTree.elIdType = elIdType
  eleDict.value[selKeys.value[0]].idType = elIdType
  emit('update:elIdType', elIdType)
}
function expTreeEle(nodes = eleTree.data) {
  expKeys.value = []
  for (const node of nodes || []) {
    if (node.key === selKeys.value[0]) {
      return true
    } else if (expTreeEle(node.children)) {
      expKeys.value.push(node.key as string)
      return true
    }
  }
  return false
}
async function onExecOpersEmit(opers: PgOper[], callback = () => undefined, parent = undefined) {
  for (const oper of opers) {
    const ele = getEleByJS(oper.element, parent)
    await until(async () => {
      try {
        const res = await webviewRef.value?.executeJavaScript(ele + '.outerHTML')
        return res !== ''
      } catch(e) {
        return false
      }
    })
    switch (oper.otype) {
      case 'input':
        await webviewRef.value?.executeJavaScript(`${ele}.value = '${oper.value}'`)
        break
      case 'click':
        doLoad(true)
        await Promise.all([
          webviewRef.value?.executeJavaScript(`${ele}.click()`),
          until(async () => loading.value)
        ])
        url.value = webviewRef.value?.getURL()
        emit('update:url', url.value)
        break
    }
  }
  callback()
}
function doLoad(toLoad = true) {
  if (toLoad) {
    isDomReady.value = false
  }
  loading.value = toLoad
  emit('update:loading', toLoad)
}
function gotoHisIdx(index: number) {
  doLoad()
  webviewRef.value?.goToIndex(index)
}
async function onScanElesClick() {
  doLoad()
  await onPageLoaded(false)
}
</script>

<style>
.mbtn-cursor-move .ant-float-btn {
  cursor: move !important;
}
</style>
