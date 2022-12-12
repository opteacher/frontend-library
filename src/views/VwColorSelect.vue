<script setup lang="ts">
import { ref } from 'vue'
const color = ref('')
</script>

<template>
  <ColorSelect v-model:color="color" />
</template>
