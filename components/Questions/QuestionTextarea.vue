<template>
  <div class="q-block" :class="{ 'q-error': error }">
    <span class="q-label">
      {{ question.label }}
      <span v-if="question.required" class="required-mark">*</span>
      <span v-if="question.hint" class="q-hint">{{ question.hint }}</span>
    </span>

    <a-textarea
      :value="modelValue"
      :placeholder="question.placeholder || 'Votre réponse'"
      :rows="4"
      :status="error ? 'error' : undefined"
      @update:value="(val) => emit('update:modelValue', val)"
    />

    <p v-if="error" class="error-msg">Cette question est obligatoire.</p>
  </div>
</template>

<script setup lang="ts">
import type { Question } from "~/types/survey";

defineProps<{
  question: Question;
  modelValue: string | undefined;
  error?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<style scoped>
.q-block {
  margin-bottom: 26px;
}

.q-label {
  font-weight: 600;
  font-size: 14.5px;
  margin-bottom: 12px;
  display: block;
  color: #26213a;
}

.required-mark {
  color: #d85a30;
  margin-left: 2px;
}

.q-hint {
  font-weight: 400;
  color: #6d6a80;
  font-size: 12.5px;
  display: block;
  margin-top: 2px;
}

.error-msg {
  color: #d85a30;
  font-size: 12.5px;
  margin-top: 8px;
  margin-bottom: 0;
}
</style>
