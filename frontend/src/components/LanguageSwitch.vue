<template>
  <div class="language-switch">
    <button 
      class="lang-btn"
      :class="{ active: isZh }"
      @click="setLanguage('zh')"
    >
      中文
    </button>
    <span class="separator">|</span>
    <button 
      class="lang-btn"
      :class="{ active: isEn }"
      @click="setLanguage('en')"
    >
      EN
    </button>
  </div>
</template>

<script setup lang="ts">
import { useLanguage } from '@/composables/useLanguage'

const { language, isZh, isEn } = useLanguage()

const setLanguage = (lang: string) => {
  language.value = lang
}
</script>

<style scoped>
.language-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Courier New', monospace;
}

.lang-btn {
  background: none;
  border: none;
  color: #00ff00;
  cursor: pointer;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  padding: 4px 8px;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px #00ff00;
}

.lang-btn:hover {
  color: #ffffff;
  text-shadow: 0 0 10px #00ff00;
}

.lang-btn.active {
  color: #ffffff;
  text-shadow: 0 0 15px #00ff00;
  background: rgba(0, 255, 0, 0.1);
  border-radius: 4px;
}

.separator {
  color: #00ff00;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 5px #00ff00;
}
</style>
