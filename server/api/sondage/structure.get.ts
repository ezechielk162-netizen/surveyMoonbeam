// server/api/sondage/structure.get.ts
import { createClient } from '@supabase/supabase-js'
import type { SurveySection, Question } from '../../../types/survey'

export default defineEventHandler(async (): Promise<SurveySection[]> => {
    const config = useRuntimeConfig()

    // clé service_role : jamais exposée au client, utilisée seulement ici
    const supabase = createClient(config.public.supabaseUrl as string, config.supabaseServiceKey as string)


    const [{ data: sections, error: sectionsErr }, { data: questions, error: questionsErr }, { data: options, error: optionsErr }, { data: rows, error: rowsErr }, { data: cols, error: colsErr }] =
        await Promise.all([
            supabase.from('survey_sections').select('*').order('position'),
            supabase.from('survey_questions').select('*').order('position'),
            supabase.from('survey_options').select('*').order('position'),
            supabase.from('survey_matrix_rows').select('*').order('position'),
            supabase.from('survey_matrix_columns').select('*').order('position'),
        ])

    const err = sectionsErr || questionsErr || optionsErr || rowsErr || colsErr
    if (err) {
        throw createError({ statusCode: 500, statusMessage: err.message })
    }

    const buildQuestion = (q: any): Question => {
        const base = {
            id: q.code,
            type: q.type,
            label: q.label,
            required: q.required,
            hint: q.hint ?? undefined,
            placeholder: q.placeholder ?? undefined,
            maxChoices: q.max_choices ?? undefined,
        }

        if (q.type === 'satisfaction-table') {
            return {
                ...base,
                rows: rows!.filter((r) => r.question_id === q.id).map((r) => ({ label: r.label, value: r.value })),
                columns: cols!.filter((c) => c.question_id === q.id).map((c) => ({ label: c.label, value: c.value })),
            } as Question
        }

        if (q.type === 'radio' || q.type === 'checkbox' || q.type === 'ranking') {
            return {
              ...base,
              options: options!.filter((o) => o.question_id === q.id).map((o) => ({ label: o.label, value: o.value })),
            } as Question
          }

        // textarea
        return base as Question
    }

    return (sections ?? []).map((s) => ({
        id: s.code,
        title: s.title,
        questions: (questions ?? [])
            .filter((q) => q.section_id === s.id)
            .map(buildQuestion),
    }))
})