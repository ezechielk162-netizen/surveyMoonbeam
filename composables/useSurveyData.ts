// composables/useSurveyData.ts
import { ref, onMounted } from 'vue'
import type { SurveySection } from '../types/survey'

// Récupère la structure du sondage via l'API (server/api/sondage/structure.get.ts).
// Appel volontairement fait dans onMounted (donc uniquement côté client,
// après le montage du composant) plutôt que via useFetch au setup.
export const useSurveyData = () => {
  const sections = ref<SurveySection[]>([])
  const pending = ref(true)
  const error = ref<Error | null>(null)

  const fetchSections = async () => {
    pending.value = true
    error.value = null
    try {
      sections.value = await $fetch<SurveySection[]>('/api/sondage/structure')
    } catch (e) {
      error.value = e as Error
    } finally {
      pending.value = false
    }
  }

  onMounted(fetchSections)

  return { data: sections, pending, error, refresh: fetchSections }
}