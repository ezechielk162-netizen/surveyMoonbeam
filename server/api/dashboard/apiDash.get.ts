// server/api/sondage/dashboard.get.ts
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl as string, config.supabaseServiceKey as string)

  const [
    { data: responses, error: e1 },
    { data: priorites, error: e2 },
    { data: logementsManquants, error: e3 },
    { data: servicesMunicipaux, error: e4 },
    { data: servicesAines, error: e5 },
    { data: servicesFamilles, error: e6 },
    { data: commercesSouhaites, error: e7 },
  ] = await Promise.all([
    supabase.from('survey_responses').select('*').order('created_at', { ascending: false }),
    supabase.from('response_priorites').select('response_id, valeur'),
    supabase.from('response_logements_manquants').select('response_id, valeur'),
    supabase.from('response_services_municipaux').select('response_id, service, satisfaction'),
    supabase.from('response_services_aines').select('response_id, valeur'),
    supabase.from('response_services_familles').select('response_id, valeur'),
    supabase.from('response_commerces_souhaites').select('response_id, valeur'),
  ])

  const err = e1 || e2 || e3 || e4 || e5 || e6 || e7
  if (err) throw createError({ statusCode: 500, statusMessage: err.message })

  // Regroupe chaque table enfant (choix multiples / grille) par response_id
  // pour reconstruire un objet "plat" par répondant.
  const groupBy = <T extends { response_id: number }>(rows: T[]) =>
    rows.reduce((acc: Record<number, T[]>, row) => {
      ;(acc[row.response_id] ||= []).push(row)
      return acc
    }, {})

  const prioritesByResponse = groupBy(priorites ?? [])
  const logementsByResponse = groupBy(logementsManquants ?? [])
  const servicesByResponse = groupBy(servicesMunicipaux ?? [])
  const servicesAinesByResponse = groupBy(servicesAines ?? [])
  const servicesFamillesByResponse = groupBy(servicesFamilles ?? [])
  const commercesByResponse = groupBy(commercesSouhaites ?? [])

  const data = (responses ?? []).map((r) => ({
    id: r.id,
    timestamp: r.created_at,

    // Profil du répondant
    age: r.age_group,
    duree: r.duree_residence,
    menage: r.type_menage,

    // Logement
    logementSituation: r.situation_logement,
    logementSatisfaction: r.satisfaction_logement,
    trouveFacilementLogement: r.trouve_facilement_logement,
    coutsLogement: r.couts_logement,
    logementsManquants: (logementsByResponse[r.id] ?? []).map((x: any) => x.valeur),
    quitterMoonbeam: r.envisage_quitter_logement,
    connaitPersonneCherchantLogement: r.connait_personne_cherchant_logement,
    nouveauxLogementsAttireraient: r.nouveaux_logements_attireraient,

    // Aînés
    aines: r.services_aines_suffisants,
    residenceAinesRepondBesoin: r.residence_aines_repond_besoin,
    favorableResidenceAines: r.favorable_residence_aines,
    servicesAines: (servicesAinesByResponse[r.id] ?? []).map((x: any) => x.valeur),

    // Familles
    famillesTrouventServices: r.familles_trouvent_services,
    encourageraitJeunesFamilles: r.encouragerait_jeunes_familles,
    servicesFamilles: (servicesFamillesByResponse[r.id] ?? []).map((x: any) => x.valeur),

    // Économie / commerces
    defiEco: r.defi_economique,
    forceMoonbeam: r.force_moonbeam,
    defiMoonbeam: r.defi_moonbeam,
    projetAmelioreMoonbeam: r.projet_ameliore_moonbeam,
    commercesSouhaites: (commercesByResponse[r.id] ?? []).map((x: any) => x.valeur),

    // Priorités citoyennes & services municipaux
    priorites: (prioritesByResponse[r.id] ?? []).map((x: any) => x.valeur),
    servicesSatisfaction: (servicesByResponse[r.id] ?? []).reduce(
      (acc: Record<string, string>, x: any) => {
        acc[x.service] = x.satisfaction
        return acc
      },
      {}
    ),

    // Commentaire libre
    commentaire: r.commentaires_suggestions,

    // Métadonnées
    completionSeconds: r.completion_seconds,
    locale: r.locale,
    isComplete: r.is_complete,
  }))

  return data
})