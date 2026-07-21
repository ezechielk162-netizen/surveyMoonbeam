<template>
  <div class="q-block" :class="{ 'q-error': error }">
    <span class="q-label">
      {{ question.label }}
      <span v-if="question.required" class="required-mark">*</span>
      <span v-if="question.hint" class="q-hint">{{ question.hint }}</span>
    </span>

    <a-checkbox-group
      :value="modelValue"
      class="options-grid"
      @update:value="handleChange"
    >
      <a-checkbox
        v-for="opt in question.options"
        :key="opt.value"
        :value="opt.value"
        class="option"
        :disabled="isMaxReached(opt.value)"
      >
        {{ opt.label }}
      </a-checkbox>
    </a-checkbox-group>

    <input
      v-if="question.placeholder"
      class="other-input"
      :placeholder="question.placeholder"
    />

    <p v-if="question.maxChoices" class="q-hint" style="margin-top: 8px">
      {{ (modelValue || []).length }} / {{ question.maxChoices }} sélectionnés
    </p>

    <p v-if="error" class="error-msg">Sélectionnez au moins une réponse.</p>
  </div>
</template>

<script setup lang="ts">
import type { Question } from "~/types/survey";

const props = defineProps<{
  question: Question;
  modelValue: string[] | undefined;
  error?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
}>();

const isMaxReached = (value: string) => {
  const current = props.modelValue || [];
  if (!props.question.maxChoices) return false;
  return (
    current.length >= props.question.maxChoices && !current.includes(value)
  );
};

const handleChange = (values: string[]) => {
  emit("update:modelValue", values);
};
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

.other-input {
  width: 100%;
  border: 1px solid #e6e3f2;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  margin-top: 8px;
}

.error-msg {
  color: #d85a30;
  font-size: 12.5px;
  margin-top: 8px;
  margin-bottom: 0;
}
</style>
