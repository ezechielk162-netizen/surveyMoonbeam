<template>
  <div class="q-block" :class="{ 'q-error': error }">
    <span class="q-label">
      {{ question.label }}
      <span v-if="question.required" class="required-mark">*</span>
    </span>

    <div class="table-scroll">
      <table class="sat-table">
        <thead>
          <tr>
            <th></th>
            <th v-for="col in question.columns" :key="col.value">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in question.rows" :key="row.value">
            <td class="row-label">{{ row.label }}</td>
            <td v-for="col in question.columns" :key="col.value">
              <input
                type="radio"
                :name="`${question.id}-${row.value}`"
                :checked="modelValue?.[row.value] === col.value"
                @change="handleChange(row.value, col.value)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="error" class="error-msg">
      Répondez pour chaque ligne du tableau.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Question } from "~/types/survey";

const props = defineProps<{
  question: Question;
  modelValue: Record<string, string> | undefined;
  error?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, string>): void;
}>();

const handleChange = (rowValue: string, colValue: string) => {
  const updated = { ...(props.modelValue || {}), [rowValue]: colValue };
  emit("update:modelValue", updated);
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

.table-scroll {
  overflow-x: auto;
}

.sat-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  min-width: 480px;
}

.sat-table th {
  font-weight: 600;
  text-align: center;
  padding: 8px 6px;
  color: #6d6a80;
  font-size: 12px;
}

.sat-table td {
  text-align: center;
  padding: 10px 6px;
  border-top: 1px solid #e6e3f2;
}

.row-label {
  text-align: left !important;
  font-weight: 500;
  color: #26213a;
}

.sat-table input {
  accent-color: #6b4aa1;
  width: 16px;
  height: 16px;
}

.q-error .sat-table {
  outline: 1px solid #f0997b;
  outline-offset: 4px;
}

.error-msg {
  color: #d85a30;
  font-size: 12.5px;
  margin-top: 8px;
  margin-bottom: 0;
}
</style>
