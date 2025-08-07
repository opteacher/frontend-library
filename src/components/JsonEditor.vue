<template>
  <div ref="editor" :style="{ height }" />
</template>

<script setup lang="ts" name="JsonEditor">
import { setProp } from '../utils'
import { type JsonEditor, createJSONEditor, Mode } from 'vanilla-jsoneditor'
import { onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  value: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
  mode: {
    type: String,
    default: 'text',
    validator: (val: string) => ['text', 'tree', 'table'].includes(val)
  },
  mainMenuBar: { type: Boolean, default: true },
  navigationBar: { type: Boolean, default: true },
  statusBar: { type: Boolean, default: true },
  height: { type: String, default: '200px' }
})
const emit = defineEmits(['update:value'])
const content = reactive<{ json: any }>({
  json: props.value
})
const editor = ref()
const jsonEditor = ref<JsonEditor | undefined>()

onMounted(refresh)
watch(() => props.value, refresh)

function refresh() {
  content.json = props.value
  if (!jsonEditor.value) {
    jsonEditor.value = createJSONEditor({
      target: editor.value as Element,
      props: {
        content,
        mode: props.mode as Mode,
        readOnly: props.disabled,
        statusBar: props.statusBar,
        mainMenuBar: props.mainMenuBar,
        navigationBar: props.navigationBar,
        onChange: (ctt: any) => setProp(content, 'json', ctt.text),
        onBlur: () =>
          emit(
            'update:value',
            typeof content.json === 'string' ? JSON.parse(content.json as string) : content.json
          )
      }
    })
  } else {
    jsonEditor.value.set(content)
  }
}
</script>
