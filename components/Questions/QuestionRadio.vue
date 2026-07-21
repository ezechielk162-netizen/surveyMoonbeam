<template>
  <div class="q-block" :class="{ 'q-error': error }">
    <span class="q-label">
      {{ question.label }}
      <span v-if="question.required" class="required-mark">*</span>
      <span v-if="question.hint" class="q-hint">{{ question.hint }}</span>
    </span>

    <a-radio-group
      :value="modelValue"
      class="options-grid"
      @update:value="(val) => emit('update:modelValue', val)"
    >
      <a-radio
        v-for="opt in question.options"
        :key="opt.value"
        :value="opt.value"
        class="option"
      >
        {{ opt.label }}
      </a-radio>
    </a-radio-group>

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

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
}

@media (max-width: 560px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}

.option {
  display: flex !important;
  align-items: center;
  padding: 11px 14px;
  border: 1px solid #e6e3f2;
  border-radius: 10px;
  margin: 0 !important;
  font-size: 14px;
  transition: 0.15s;
}

.option:hover {
  border-color: #b6a8de;
  background: #faf9ff;
}

.q-error .option {
  border-color: #f0997b;
}

.error-msg {
  color: #d85a30;
  font-size: 12.5px;
  margin-top: 8px;
  margin-bottom: 0;
}
</style>
