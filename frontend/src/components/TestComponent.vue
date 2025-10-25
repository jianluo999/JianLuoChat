<template>
  <div class="test-component">
    <h1>Test Component</h1>
    <p>This is a test to check Vue template compilation.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello World')
</script>

<style scoped>
.test-component {
  padding: 20px;
}
</style>