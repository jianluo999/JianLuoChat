import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const currentLanguage = ref(localStorage.getItem('language') || 'zh')

export function useLanguage() {
  const { locale, t } = useI18n()

  const language = computed({
    get: () => currentLanguage.value,
    set: (value: string) => {
      currentLanguage.value = value
      locale.value = value
      localStorage.setItem('language', value)
    }
  })

  const toggleLanguage = () => {
    language.value = language.value === 'zh' ? 'en' : 'zh'
  }

  const isZh = computed(() => language.value === 'zh')
  const isEn = computed(() => language.value === 'en')

  return {
    language,
    toggleLanguage,
    isZh,
    isEn,
    t
  }
}
