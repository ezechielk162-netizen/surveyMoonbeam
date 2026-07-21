<template>
  <div class="survey-card">
    <div class="section-tag">Section {{ index + 1 }} / {{ total }}</div>
    <h2 class="section-title">{{ section.title }}</h2>

    <component
      :is="componentFor(question.type)"
      v-for="question in section.questions"
      :key="question.id"
      :question="question"
      :model-value="answers[question.id]"
      :error="!!errors[question.id]"
      @update:model-value="(val) => updateAnswer(question.id, val)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Question, QuestionType, SectionAnswers, SurveySection as SurveySectionType } from "~/types/survey";
import QuestionRadio from "~/components/Questions/QuestionRadio.vue";
import QuestionCheckbox from "~/components/Questions/QuestionCheckbox.vue";
import QuestionTextarea from "~/components/Questions/QuestionTextarea.vue";
import QuestionSatisfactionTable from "~/components/Questions/QuestionSatisfactionTable.vue";

const props = defineProps<{
  section: SurveySectionType;
  answers: SectionAnswers;
  errors: Record<string, boolean>;
  index: number;
  total: number;
}>();

const emit = defineEmits<{
  (e: "update:answers", value: SectionAnswers): void;
}>();

const componentMap: Record<QuestionType, unknown> = {
  radio: QuestionRadio,
  checkbox: QuestionCheckbox,
  textarea: QuestionTextarea,
  "satisfaction-table": QuestionSatisfactionTable,
};

const componentFor = (type: QuestionType) => componentMap[type];

const updateAnswer = (questionId: string, value: unknown) => {
  emit("update:answers", { ...props.answers, [questionId]: value });
};
</script>

<style scoped>
.survey-card {
  background: #ffffff;
  border: 1px solid #e6e3f2;
  border-radius: 16px;
  padding: 32px 34px;
}

.section-tag {
  font-size: 12.5px;
  font-weight: 700;
  color: #6b4aa1;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
}

.section-title {
  font-size: 1.35rem;
  margin: 0 0 24px;
  color: #26213a;
}

@media (max-width: 560px) {
  .survey-card {
    padding: 24px 20px;
  }
}
</style>
