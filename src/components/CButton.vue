<template>
  <a-button
    :type="customType"
    :class="customClass"
    :size="customSize"
    :disabled="disabled"
    :ghost="ghost"
  >
    <template v-if="iconType" #icon>
      <component :is="iconType" />
    </template>
    <slot />
  </a-button>
</template>

<script lang="ts" setup name="CButton">
import { ref, watch } from 'vue'

const props = defineProps({
  type: { type: String, default: '' },
  size: { type: String, default: '' },
  icon: { type: String, default: '' },
  ghost: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  permission: { type: [String, Boolean], default: true }
})
const customClass = ref('c-button-primary')
const customType = ref('')
const customSize = ref('default')
const iconType = ref('')

watch(
  () => props.type,
  v => {
    switch (v) {
      case 'warning':
        customClass.value = 'c-button-warning'
        customType.value = 'default'
        break
      case 'error':
        customClass.value = 'c-button-error'
        customType.value = 'default'
        break
      case 'success':
        customClass.value = 'c-button-success'
        customType.value = 'default'
        break
      case 'primary':
        customClass.value = 'c-button-primary'
        customType.value = 'primary'
        break
      case 'cyan':
        customClass.value = 'c-button-cyan'
        customType.value = 'default'
        break
      case 'black':
        customClass.value = 'c-button-black'
        customType.value = 'default'
        break
      case 'grey':
        customClass.value = 'c-button-grey'
        customType.value = 'default'
        break
      case 'purple':
        customClass.value = 'c-button-purple'
        customType.value = 'default'
        break
      case 'pink':
        customClass.value = 'c-button-pink'
        customType.value = 'default'
        break
      case 'red':
        customClass.value = 'c-button-red'
        customType.value = 'default'
        break
      case 'orange':
        customClass.value = 'c-button-orange'
        customType.value = 'default'
        break
      case 'green':
        customClass.value = 'c-button-green'
        customType.value = 'default'
        break
      case 'blue':
        customClass.value = 'c-button-blue'
        customType.value = 'default'
        break
      case 'text':
        customClass.value = ''
        customType.value = 'text'
        break
      case 'link':
        customClass.value = ''
        customType.value = 'link'
        break
      default:
        customClass.value = ''
        customType.value = 'default'
        break
    }
  },
  { immediate: true }
)
watch(
  () => props.size,
  v => {
    customSize.value = !v ? 'default' : v
  },
  { immediate: true }
)
watch(
  () => props.icon,
  v => {
    iconType.value = v
  },
  { immediate: true }
)
watch(
  () => props,
  () => {},
  { immediate: true }
)
</script>

<style scoped>
.c-button-primary {
  color: #fff;
  background-color: #1677ff;
  border-color: #1677ff;
}
.c-button-primary:hover {
  color: #fff;
  background-color: #2db7f5;
  border-color: #1677ff;
}
.c-button-primary[disabled],
.c-button-primary[disabled]:hover,
.c-button-primary[disabled]:focus,
.c-button-primary[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-warning {
  color: #fff;
  background-color: #ff9900;
  border-color: #ff9900;
}
.c-button-warning:hover {
  color: #fff;
  background-color: #fcac35;
  border-color: #ff9900;
}
.c-button-warning[disabled],
.c-button-warning[disabled]:hover,
.c-button-warning[disabled]:focus,
.c-button-warning[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-error {
  color: #fff;
  background-color: #ff3300;
  border-color: #ff3300;
}
.c-button-error:hover {
  color: #fff;
  background-color: #fc653f;
  border-color: #ff3300;
}
.c-button-error[disabled],
.c-button-error[disabled]:hover,
.c-button-error[disabled]:focus,
.c-button-error[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-success {
  color: #fff;
  background-color: #00cc66;
  border-color: #00cc66;
}
.c-button-success:hover {
  color: #fff;
  background-color: #03e071;
  border-color: #00cc66;
}
.c-button-success[disabled],
.c-button-success[disabled]:hover,
.c-button-success[disabled]:focus,
.c-button-success[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-cyan {
  color: #fff;
  background-color: #04c1e1;
  border-color: #04c1e1;
}
.c-button-cyan:hover {
  color: #fff;
  background-color: #0ad5f8;
  border-color: #04c1e1;
}
.c-button-cyan[disabled],
.c-button-cyan[disabled]:hover,
.c-button-cyan[disabled]:focus,
.c-button-cyan[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-black {
  color: #fff;
  background-color: #131313;
  border-color: #131313;
}
.c-button-black:hover {
  color: #fff;
  background-color: #313131;
  border-color: #131313;
}
.c-button-black[disabled],
.c-button-black[disabled]:hover,
.c-button-black[disabled]:focus,
.c-button-black[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-grey {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.45);
  border-color: rgba(0, 0, 0, 0.45);
}
.c-button-grey:hover {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.32);
  border-color: rgba(0, 0, 0, 0.45);
}
.c-button-grey[disabled],
.c-button-grey[disabled]:hover,
.c-button-grey[disabled]:focus,
.c-button-grey[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-purple {
  color: #fff;
  background-color: #b500fe;
  border-color: #b500fe;
}
.c-button-purple:hover {
  color: #fff;
  background-color: #c951fa;
  border-color: #b500fe;
}
.c-button-purple[disabled],
.c-button-purple[disabled]:hover,
.c-button-purple[disabled]:focus,
.c-button-purple[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-pink {
  color: #fff;
  background-color: #c41d7f;
  border-color: #c41d7f;
}
.c-button-pink:hover {
  color: #fff;
  background-color: #d1529c;
  border-color: #d1529c;
}
.c-button-pink[disabled],
.c-button-pink[disabled]:hover,
.c-button-pink[disabled]:focus,
.c-button-pink[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-red {
  color: #fff;
  background-color: #cf1322;
  border-color: #cf1322;
}
.c-button-red:hover {
  color: #fff;
  background-color: #cf5660;
  border-color: #cf5660;
}
.c-button-red[disabled],
.c-button-red[disabled]:hover,
.c-button-red[disabled]:focus,
.c-button-red[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-orange {
  color: #fff;
  background-color: #d46b08;
  border-color: #d46b08;
}
.c-button-orange:hover {
  color: #fff;
  background-color: #d6863b;
  border-color: #d6863b;
}
.c-button-orange[disabled],
.c-button-orange[disabled]:hover,
.c-button-orange[disabled]:focus,
.c-button-orange[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-green {
  color: #fff;
  background-color: #389e0d;
  border-color: #389e0d;
}
.c-button-green:hover {
  color: #fff;
  background-color: #61cc34;
  border-color: #61cc34;
}
.c-button-green[disabled],
.c-button-green[disabled]:hover,
.c-button-green[disabled]:focus,
.c-button-green[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}

.c-button-blue {
  color: #fff;
  background-color: #0958d9;
  border-color: #0958d9;
}
.c-button-blue:hover {
  color: #fff;
  background-color: #4079d4;
  border-color: #4079d4;
}
.c-button-blue[disabled],
.c-button-blue[disabled]:hover,
.c-button-blue[disabled]:focus,
.c-button-blue[disabled]:active {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  border-color: #d9d9d9;
  text-shadow: none;
  box-shadow: none;
}
</style>
