<script lang="ts">
import { validConds } from '@/utils'
import FormItem from './FormItem.vue'
import Mapper from '@/types/mapper'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'FormGroup',
  components: {
    FormItem,

    PlusOutlined,
    MinusOutlined
  },
  props: {
    column: { type: Array, default: () => [4, 20] }, // [0]标题宽度 [1]表单项宽度
    copy: { type: Function, required: true },
    object: { type: Object, default: null },
    mapper: { type: Mapper, required: true },
    form: { type: Object, required: true },
    rules: { type: Object, required: true },
    editable: { type: Boolean, default: true },
    viewOnly: { type: Boolean, default: false }
  },
  setup() {
    const refer = ref()
    return {
      refer,
      validConds
    }
  }
})
</script>

<template>
  <a-form
    ref="refer"
    :model="form"
    :rules="rules"
    :label-col="{ span: column[0] }"
    :wrapper-col="{ span: column[1] }"
  >
    <template v-for="(value, key) in mapper" :key="key">
      <template v-if="value.type === 'Group' && validConds(form, value.display)">
        <div v-if="value.fold" class="border pt-7 px-2.5 my-7 relative border-r-4">
          <a-button
            type="link"
            size="small"
            class="absolute bg-white"
            :style="{ left: '5px', top: '-11px' }"
            @click="value.fold = !value.fold"
            :disabled="validConds(form, value.disabled)"
          >
            {{ value.label }}
          </a-button>
          <a-button
            type="link"
            size="small"
            class="absolute bg-white"
            :style="{ right: '-12px', top: '-12px' }"
            @click="value.fold = !value.fold"
            :disabled="validConds(form, value.disabled)"
          >
            <template #icon><minus-outlined /></template>
          </a-button>
          <FormItem
            v-for="(v, k) in value.items"
            :key="k"
            :form="form"
            :skey="k.toString()"
            :value="(v as Object)"
            :editable="editable"
            :viewOnly="viewOnly"
          >
            <template #FormDialog>
              <FormDialog
                v-model:show="v.show"
                :mapper="v.mapper"
                :copy="v.copy"
                :emitter="v.emitter"
                :object="v.editing"
                @submit="(form: any) => v.onSaved(form, form[k])"
              />
            </template>
            <template v-if="$slots[k]" #[k]="{ form }">
              <slot :name="k" v-bind="{ form }" />
            </template>
          </FormItem>
        </div>
        <div v-else class="border-b my-7 relative">
          <a-button
            type="link"
            size="small"
            class="absolute bg-white"
            :style="{ left: '5px', top: '-11px' }"
            @click="value.fold = !value.fold"
          >
            {{ value.label }}
          </a-button>
          <a-button
            type="link"
            size="small"
            class="absolute bg-white"
            :style="{ right: '-12px', top: '-12px' }"
            @click="value.fold = !value.fold"
          >
            <template #icon><plus-outlined /></template>
          </a-button>
        </div>
      </template>
      <FormItem
        v-else
        :form="form"
        :skey="(key as string)"
        :value="value"
        :editable="editable"
        :viewOnly="viewOnly"
      >
        <template #FormDialog>
          <FormDialog
            v-model:show="value.show"
            :mapper="value.mapper"
            :copy="value.copy"
            :emitter="value.emitter"
            :object="value.editing"
            @submit="(form: any) => value.onSaved(form, form[key])"
          />
        </template>
        <template v-if="$slots[key]" #[key]="{ form }">
          <slot :name="key" v-bind="{ form }" />
        </template>
      </FormItem>
    </template>
  </a-form>
</template>
