<template>
  <div class="border border-solid border-gray-300 rounded">
    <v-ace-editor
      v-model:value="editing"
      :lang="lang"
      theme="chrome"
      class="h-full"
      :readonly="disabled"
      :options="{ tabSize: 2 }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-min-noconflict/theme-chrome'
import 'ace-builds/src-min-noconflict/mode-javascript'
import 'ace-builds/src-min-noconflict/mode-json'
import 'ace-builds/src-min-noconflict/ext-language_tools'

export default defineComponent({
  name: 'CodeEditor',
  components: {
    VAceEditor
  },
  emits: ['update:value'],
  props: {
    value: { type: [String, Object, Function], required: true },
    lang: { type: String, default: 'javascript' },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { emit }) {
    const editing = ref<string>('')

    updFmVal()
    watch(() => editing.value, updToVal)
    watch(() => props.value, updFmVal)

    function vtype() {
      if (typeof props.value === 'string') {
        return String
      } else if (props.value instanceof Function) {
        return Function
      } else {
        return Object
      }
    }
    function updFmVal() {
      try {
        switch (vtype()) {
          case Object:
            editing.value = JSON.stringify(props.value)
            break
          case Function:
            editing.value = props.value.toString()
            break
          case String:
          default:
            editing.value = props.value as string
        }
      } catch (e) {
        console.error(e)
      }
    }
    function updToVal() {
      try {
        switch (vtype()) {
          case Object:
            emit('update:value', JSON.parse(editing.value))
            break
          case Function:
            emit('update:value', eval(`function () {${editing.value}}`))
            break
          case String:
          default:
            emit('update:value', editing.value)
        }
      } catch (e) {
        console.error(e)
      }
    }
    return {
      editing
    }
  }
})
</script>
