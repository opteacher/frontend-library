<script setup lang="ts">
import { reactive } from 'vue'

const components = reactive([] as any[])
</script>

<template>
  <a-list item-layout="horizontal" :data-source="components">
    <template #renderItem="{ item }">
      <a-list-item>
        <a-list-item-meta
          description="Ant Design, a design language for background applications, is refined by Ant UED Team"
        >
          <template #title>
            <a href="https://www.antdv.com/">{{ item.title }}</a>
          </template>
          <template #avatar>
            <a-avatar />
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>
</template>
