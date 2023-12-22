<template>
  <a-input-group compact class="flex">
    <a-input
      class="flex-1 text-center border-r-0 focus:border-r-0 focus:shadow-none"
      ref="ipSecA"
      v-model:value="ipAddr[0]"
      placeholder="输入A段"
      :maxlength="3"
      :disabled="disabled"
      @focus="onFocus"
      @paste="onPaste"
      @keydown="(e: KeyboardEvent) => onKeyDown(e, 0)"
    />
    <a-form-item-rest>
      <a-input
        class="w-6 p-0 text-center border-l-0 border-r-0 pointer-events-none bg-white font-bold"
        placeholder="."
        disabled
      />
      <a-input
        class="flex-1 text-center border-l-0 focus:border-l-0 border-r-0 focus:border-r-0 focus:shadow-none"
        ref="ipSecB"
        v-model:value="ipAddr[1]"
        placeholder="输入B段"
        :maxlength="3"
        :disabled="disabled"
        @focus="onFocus"
        @keydown="(e: KeyboardEvent) => onKeyDown(e, 1)"
      />
      <a-input
        class="w-6 p-0 text-center border-l-0 border-r-0 pointer-events-none bg-white font-bold"
        placeholder="."
        disabled
      />
      <a-input
        class="flex-1 text-center border-l-0 focus:border-l-0 border-r-0 focus:border-r-0 focus:shadow-none"
        ref="ipSecC"
        v-model:value="ipAddr[2]"
        placeholder="输入C段"
        :maxlength="3"
        :disabled="disabled"
        @focus="onFocus"
        @keydown="(e: KeyboardEvent) => onKeyDown(e, 2)"
      />
      <a-input
        class="w-6 p-0 text-center border-l-0 border-r-0 pointer-events-none bg-white font-bold"
        placeholder="."
        disabled
      />
      <a-input
        class="flex-1 text-center border-l-0 focus:border-l-0 focus:shadow-none"
        ref="ipSecD"
        v-model:value="ipAddr[3]"
        placeholder="输入D段"
        :maxlength="3"
        :disabled="disabled"
        @focus="onFocus"
        @keydown="(e: KeyboardEvent) => onKeyDown(e, 3)"
        @pressEnter="() => $emit('press:enter')"
      />
    </a-form-item-rest>
  </a-input-group>
</template>

<script lang="ts" setup name="IpAddrInput">
import { onMounted, reactive, ref, watch } from 'vue'

const emit = defineEmits(['update:ip', 'press:enter'])
const props = defineProps({
  ip: { type: String, required: true },
  disabled: { type: Boolean, default: false }
})
type IpType = [number, number, number, number]
const ipAddr = reactive<IpType>([0, 0, 0, 0])
const ipSecA = ref<HTMLInputElement>()
const ipSecB = ref<HTMLInputElement>()
const ipSecC = ref<HTMLInputElement>()
const ipSecD = ref<HTMLInputElement>()

onMounted(refresh)
watch(() => props.ip, refresh)
watch(() => [...ipAddr], cmbIpStr)

function refresh(strIp = '') {
  const ips = (strIp || props.ip).split('.')
  ipAddr.splice(0, 4, ...(ips.length === 4 ? (ips.map(i => parseInt(i)) as IpType) : [0, 0, 0, 0]))
}
function cmbIpStr() {
  for (let i = 0; i < 4; ++i) {
    switch (ipAddr[i] as any) {
      case '.':
      case '':
        ipAddr[i] = 0
        break
    }
  }
  emit('update:ip', ipAddr.join('.'))
}
function onFocus(e: FocusEvent) {
  ;(e.target as HTMLInputElement).select()
}
function onKeyDown(e: KeyboardEvent, index: number) {
  if (e.key === '.') {
    e.preventDefault()
    // e.target?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    switch (index) {
      case 0:
        ipSecA.value?.blur()
        ipSecB.value?.focus()
        ipSecB.value?.select()
        break
      case 1:
        ipSecB.value?.blur()
        ipSecC.value?.focus()
        ipSecC.value?.select()
        break
      case 2:
        ipSecC.value?.blur()
        ipSecD.value?.focus()
        ipSecD.value?.select()
        break
      case 3:
        break
    }
  } else if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '0') {
    e.preventDefault()
    switch (index) {
      case 0:
        break
      case 1:
        ipSecB.value?.blur()
        ipSecA.value?.focus()
        ipSecA.value?.select()
        break
      case 2:
        ipSecC.value?.blur()
        ipSecB.value?.focus()
        ipSecB.value?.select()
        break
      case 3:
        ipSecD.value?.blur()
        ipSecC.value?.focus()
        ipSecC.value?.select()
        break
    }
  }
}
async function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  refresh(await navigator.clipboard.readText())
}
</script>
