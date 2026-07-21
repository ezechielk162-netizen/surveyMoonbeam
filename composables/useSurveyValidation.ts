import type { Question, SurveySection, SectionAnswers } from "../types/survey";

const isAnswered = (question: Question, value: unknown): boolean => {
  if (!question.required) return true;

  switch (question.type) {
    case "radio":
      return typeof value === "string" && value.length > 0;

    case "checkbox":
      return Array.isArray(value) && value.length > 0;

    case "textarea":
      return typeof value === "string" && value.trim().length > 0;

    case "ranking":
      return Array.isArray(value) && value.filter(Boolean).length === 3;

    case "satisfaction-table": {
      if (!value || typeof value !== "object") return false;
      const answered = Object.keys(value as Record<string, string>);
      return (question.rows || []).every((row) =>
        answered.includes(row.value)
      );
    }

    default:
      return true;
  }
};

export const useSurveyValidation = () => {
  // Retourne un dictionnaire { questionId: true } pour chaque question en erreur
  const validateSection = (
    section: SurveySection,
    answers: SectionAnswers
  ) => {
    const errors: Record<string, boolean> = {};

    section.questions.forEach((question) => {
      const value = answers[question.id];
      if (!isAnswered(question, value)) {
        errors[question.id] = true;
      }
    });

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  };

  return { validateSection, isAnswered };
};
