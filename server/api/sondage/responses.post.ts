// server/api/sondage/reponses.post.ts
import { createClient } from '@supabase/supabase-js'

// Colonnes à réponse unique de la table survey_responses.
// Le code de question (ex: 'age_group') doit correspondre exactement
// au nom de colonne pour que le mapping automatique fonctionne.
const SINGLE_VALUE_FIELDS = [
  'age_group', 'duree_residence', 'type_menage',
  'situation_logement', 'satisfaction_logement', 'trouve_facilement_logement', 'couts_logement',
  'services_aines_suffisants', 'residence_aines_repond_besoin',
  'familles_trouvent_services', 'encouragerait_jeunes_familles',
  'defi_economique',
  'force_moonbeam', 'defi_moonbeam', 'projet_ameliore_moonbeam', 'commentaires_suggestions',
  'envisage_quitter_logement', 'connait_personne_cherchant_logement',
  'nouveaux_logements_attireraient', 'favorable_residence_aines',
]

// Questions à choix multiples -> table enfant correspondante
const MULTI_VALUE_TABLES: Record<string, string> = {
  logements_manquants: 'response_logements_manquants',
  services_aines: 'response_services_aines',
  services_familles: 'response_services_familles',
  commerces_souhaites: 'response_commerces_souhaites',
  priorites: 'response_priorites',
}

// Question matricielle -> table de satisfaction par service
const MATRIX_QUESTION_CODE = 'services_municipaux'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  // body.answers = { [sectionCode]: { [questionCode]: valeur } }
  const answersBySection = body?.answers ?? body // tolère les deux formes (avec ou sans clé "answers")

  if (!answersBySection || typeof answersBySection !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Corps de requête invalide.' })
  }

  // Aplati toutes les sections en un seul objet { questionCode: valeur }
  const flat: Record<string, any> = {}
  for (const sectionAnswers of Object.values(answersBySection)) {
    if (sectionAnswers && typeof sectionAnswers === 'object') {
      Object.assign(flat, sectionAnswers)
    }
  }

  const config = useRuntimeConfig()
  // Cette route tourne uniquement côté serveur : on utilise service_role
  // (pas la clé publique) pour éviter le piège RLS où le .select() après
  // l'insert déclenche une vérification de lecture qu'aucune policy anon
  // n'autorise, et qui remonte comme une fausse violation d'INSERT.
  const supabase = createClient(config.public.supabaseUrl as string, config.supabaseServiceKey as string)

  // 1. Construire la ligne principale
  const mainRow: Record<string, any> = {}
  for (const field of SINGLE_VALUE_FIELDS) {
    if (flat[field] !== undefined) mainRow[field] = flat[field]
  }

  const { data: response, error: insertError } = await supabase
    .from('survey_responses')
    .insert(mainRow)
    .select('id')
    .single()

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: insertError.message })
  }
  const responseId = response.id

  // 2. Tables enfants (choix multiples)
  const childInserts = Object.entries(MULTI_VALUE_TABLES).map(([questionCode, table]) => {
    const values: string[] = flat[questionCode] ?? []
    if (!Array.isArray(values) || values.length === 0) return Promise.resolve({ error: null })
    const rows = values.map((valeur) => ({ response_id: responseId, valeur }))
    return supabase.from(table).insert(rows)
  })

  // 3. Matrice de satisfaction des services municipaux
  const matrixAnswers: Record<string, string> = flat[MATRIX_QUESTION_CODE] ?? {}
  if (matrixAnswers && Object.keys(matrixAnswers).length > 0) {
    const rows = Object.entries(matrixAnswers).map(([service, satisfaction]) => ({
      response_id: responseId,
      service,
      satisfaction,
    }))
    childInserts.push(supabase.from('response_services_municipaux').insert(rows))
  }

  const results = await Promise.all(childInserts)
  const failed = results.find((r: any) => r?.error)
  if (failed) {
    throw createError({ statusCode: 500, statusMessage: (failed as any).error.message })
  }

  return { success: true, id: responseId }
})