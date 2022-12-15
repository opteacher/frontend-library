<template>
  <div class="b-1 br-4">
    <v-ace-editor
      v-model:value="editing"
      :lang="lang"
      theme="chrome"
      style="height: 300px"
      :options="{ tabSize: 2, readOnly: disabled }"
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
  name: 'VueAceEditor',
  components: {
    VAceEditor
  },
  emits: ['update:value'],
  props: {
    value: { type: Object, required: true },
    lang: { type: String, default: 'javascript' },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { emit }) {
    const editing = ref('')

    updFmVal()
    watch(() => editing.value, updToVal)
    watch(() => props.value, updFmVal)

    function updFmVal() {
      try {
        editing.value = props.value instanceof Object ? JSON.stringify(props.value) : props.value
      } catch (e) {}
    }
    function updToVal() {
      try {
        emit(
          'update:value',
          props.value instanceof Object ? JSON.parse(editing.value) : editing.value
        )
      } catch (e) {}
    }
    return {
      editing
    }
  }
})
</script>
