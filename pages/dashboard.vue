<template>
  <div class="dash-page">
    <header class="top">
      <div class="top-inner">
        <div>
          <p class="eyebrow">Ville de Moonbeam · Consultation publique</p>
          <h1 class="title">Ensemble pour l'avenir de Moonbeam</h1>
          <p class="subtitle">
            Tableau de bord des réponses au sondage citoyen — logement, aînés, familles,
            économie et services municipaux.
          </p>
        </div>
        <div class="updated">
          <span class="dot"></span>Données mises à jour à l'instant ·
          <span class="mono">{{ lastSync }}</span>
        </div>
      </div>
    </header>

    <div v-if="pending" class="state-box">Chargement des données...</div>
    <div v-else-if="error" class="state-box error">
      Impossible de charger les données du dashboard.
    </div>

    <main v-else>
      <!-- FILTRES -->
      <div class="filters">
        <div class="field">
          <label>Groupe d'âge</label>
          <select v-model="filters.age">
            <option value="">Tous</option>
            <option v-for="o in optionValues('age')" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
        <div class="field">
          <label>Durée à Moonbeam</label>
          <select v-model="filters.duree">
            <option value="">Toutes</option>
            <option v-for="o in optionValues('duree')" :key="o" :value="o">
              {{ o }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Type de ménage</label>
          <select v-model="filters.menage">
            <option value="">Tous</option>
            <option v-for="o in optionValues('menage')" :key="o" :value="o">
              {{ o }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Situation logement</label>
          <select v-model="filters.logement">
            <option value="">Toutes</option>
            <option v-for="o in optionValues('logementSituation')" :key="o" :value="o">
              {{ o }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Depuis le</label>
          <input type="date" v-model="filters.from" />
        </div>
        <div class="field">
          <label>Jusqu'au</label>
          <input type="date" v-model="filters.to" />
        </div>
        <div class="field" style="min-width: 190px">
          <label>Recherche (commentaires)</label>
          <input type="search" v-model="filters.search" placeholder="mot-clé…" />
        </div>
        <div class="actions">
          <button class="btn" @click="resetFilters">Réinitialiser</button>
          <button class="btn primary" @click="exportCsv">Exporter en CSV</button>
        </div>
      </div>
      <div class="active-count">
        Filtres actifs → <b>{{ filteredResponses.length }}</b> réponse(s) sur
        <b>{{ allResponses.length }}</b>
      </div>

      <!-- KPI -->
      <div class="kpis">
        <div class="kpi">
          <div class="glow"></div>
          <div class="label">Total des réponses</div>
          <div class="value">{{ filteredResponses.length }}</div>
          <div class="delta up">sur {{ allResponses.length }} réponses au total</div>
        </div>
        <div class="kpi">
          <div class="glow"></div>
          <div class="label">Satisfaction logement</div>
          <div class="value">
            {{ kpis.satisfactionLogementPct }} <span class="unit">%</span>
          </div>
          <div class="delta">satisfait·e ou très satisfait·e</div>
        </div>
        <div class="kpi">
          <div class="glow"></div>
          <div class="label">Envisagent de quitter Moonbeam</div>
          <div class="value">{{ kpis.quitterPct }} <span class="unit">%</span></div>
          <div class="delta warn">en raison du logement / services</div>
        </div>
        <div class="kpi">
          <div class="glow"></div>
          <div class="label">Favorables à une résidence pour aînés</div>
          <div class="value">{{ kpis.favAinesPct }} <span class="unit">%</span></div>
          <div class="delta up"></div>
        </div>
      </div>

      <!-- CHARTS: profil / logement -->
      <div class="section-title">
        <span class="bar"></span>Profil des répondants &amp; logement
      </div>
      <div class="grid">
        <div class="card col-4">
          <h3>Répartition par groupe d'âge</h3>
          <p class="hint">Nombre de répondants par tranche d'âge</p>
          <div class="chart-wrap h-220">
            <canvas ref="chartAgeEl"></canvas>
          </div>
        </div>
        <div class="card col-4">
          <h3>Situation résidentielle</h3>
          <p class="hint">Propriétaire, locataire, autre</p>
          <div class="chart-wrap h-220">
            <canvas ref="chartLogementSituationEl"></canvas>
          </div>
        </div>
        <div class="card col-4">
          <h3>Satisfaction du logement</h3>
          <p class="hint">Niveau de satisfaction déclaré</p>
          <div class="chart-wrap h-220">
            <canvas ref="chartLogementSatisfactionEl"></canvas>
          </div>
        </div>
        <div class="card col-12">
          <h3>Types de logements manquants</h3>
          <p class="hint">Choix multiples — nombre de mentions</p>
          <div class="chart-wrap h-110">
            <canvas ref="chartLogementsManquantsEl"></canvas>
          </div>
        </div>
      </div>

      <!-- CHARTS: services / économie -->
      <div class="section-title">
        <span class="bar"></span>Services municipaux &amp; économie
      </div>
      <div class="grid">
        <div class="card col-7">
          <h3>Satisfaction des services municipaux</h3>
          <p class="hint">
            Routes, déneigement, internet, parcs, sports, activités communautaires
          </p>
          <div class="chart-wrap h-200">
            <canvas ref="chartServicesEl"></canvas>
          </div>
        </div>
        <div class="card col-5">
          <h3>Plus grand défi économique perçu</h3>
          <p class="hint">Réponse unique par répondant</p>
          <div class="chart-wrap h-200">
            <canvas ref="chartDefiEcoEl"></canvas>
          </div>
        </div>
      </div>

      <!-- CHARTS: priorités / aînés -->
      <div class="section-title"><span class="bar"></span>Priorités citoyennes</div>
      <div class="grid">
        <div class="card col-8">
          <h3>Trois principales priorités mentionnées</h3>
          <p class="hint">
            Classement par nombre de mentions (choix multiples, max 3 par personne)
          </p>
          <div class="chart-wrap h-230">
            <canvas ref="chartPrioritesEl"></canvas>
          </div>
        </div>
        <div class="card col-4">
          <h3>Services aînés jugés suffisants ?</h3>
          <p class="hint">Perception générale</p>
          <div class="chart-wrap h-230">
            <canvas ref="chartAinesEl"></canvas>
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="card table-card">
        <div class="table-head">
          <div>
            <h3 style="margin: 0">Réponses individuelles</h3>
            <p class="hint" style="margin: 2px 0 0">
              Cliquez sur une colonne pour trier · les filtres ci-dessus s'appliquent
              aussi ici
            </p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th @click="setSort('id')">ID</th>
                <th @click="setSort('timestamp')">Horodatage</th>
                <th @click="setSort('age')">Groupe d'âge</th>
                <th @click="setSort('duree')">Durée à Moonbeam</th>
                <th @click="setSort('logementSituation')">Logement</th>
                <th @click="setSort('logementSatisfaction')">Satisfaction logement</th>
                <th @click="setSort('defiEco')">Défi économique</th>
                <th @click="setSort('quitterMoonbeam')">Envisage de quitter</th>
                <th @click="setSort('favorableResidenceAines')">
                  Favorable résidence aînés
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in pageRows" :key="r.id">
                <td class="mono">#{{ String(r.id).padStart(4, "0") }}</td>
                <td class="ts mono">{{ fmtDate(r.timestamp) }}</td>
                <td>{{ r.age }}</td>
                <td>{{ r.duree }}</td>
                <td>{{ r.logementSituation }}</td>
                <td>{{ r.logementSatisfaction }}</td>
                <td>{{ r.defiEco }}</td>
                <td>
                  <span class="badge" :class="badgeClass(r.quitterMoonbeam)">{{
                    r.quitterMoonbeam
                  }}</span>
                </td>
                <td>
                  <span class="badge" :class="badgeClass(r.favorableResidenceAines)">{{
                    r.favorableResidenceAines
                  }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pager">
          <span
            >Page {{ currentPage }} / {{ totalPages }} —
            {{ sortedResponses.length }} réponse(s)</span
          >
          <button :disabled="currentPage <= 1" @click="currentPage--">← Précédent</button>
          <button :disabled="currentPage >= totalPages" @click="currentPage++">
            Suivant →
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import Chart from "chart.js/auto";

useHead({ title: "Dashboard — Sondage Moonbeam" });

definePageMeta({
  layout: "none",
});

const OPTIONS = {
  age: [
    "Moins de 18 ans",
    "18 à 24 ans",
    "25 à 34 ans",
    "35 à 44 ans",
    "45 à 54 ans",
    "55 à 64 ans",
    "65 à 74 ans",
    "75 ans et plus",
  ],
  duree: ["Moins de 2 ans", "2 à 5 ans", "6 à 10 ans", "Plus de 10 ans", "Toute ma vie"],
  menage: [
    "Une personne",
    "Un couple",
    "Famille avec enfants",
    "Personne âgée vivant seule",
    "Autre",
  ],
  logementSituation: [
    "Propriétaire",
    "Locataire",
    "Chez un membre de la famille",
    "Autre",
  ],
  logementSatisfaction: ["Très satisfait", "Satisfait", "Peu satisfait", "Pas satisfait"],
  logementsManquants: [
    "Appartements",
    "Logements abordables",
    "Maisons unifamiliales",
    "Logements pour personnes âgées",
    "Résidences avec services",
    "Logements adaptés (handicap)",
    "Logements temporaires",
  ],
  servicesMunicipaux: [
    "Routes",
    "Déneigement",
    "Internet",
    "Parcs",
    "Installations sportives",
    "Activités communautaires",
  ],
  niveauxSatisfaction: ["Très satisfait", "Satisfait", "Peu satisfait", "Pas satisfait"],
  defiEco: [
    "Manque d'emplois",
    "Manque de commerces",
    "Logement",
    "Vieillissement de la population",
    "Départ des jeunes",
    "Manque d'investissements",
  ],
  priorites: [
    "Plus de logements",
    "Développement économique",
    "Attirer de nouvelles entreprises",
    "Soutien aux aînés",
    "Services de santé",
    "Activités pour les jeunes",
    "Tourisme",
    "Sécurité alimentaire (épicerie)",
    "Infrastructures",
    "Internet haute vitesse",
    "Environnement",
    "Transport",
  ],
  aines: ["Oui", "Non", "Je ne sais pas"],
};
const PALETTE = [
  "#164E48",
  "#2C7A6E",
  "#E8B14D",
  "#C2594B",
  "#8B9A96",
  "#5C6D69",
  "#B9821E",
];

function optionValues(key) {
  return OPTIONS[key] ?? [];
}

/* ---------------- Données (fetch client, à chaque montage) ---------------- */
// Appel volontairement fait dans onMounted (donc uniquement côté client,
// après le montage du composant) plutôt que via useFetch au setup, pour
// garantir un appel API frais à chaque rechargement de la page.
const allResponses = ref([]);
const pending = ref(true);
const error = ref(null);
const lastSync = ref("");

const fetchResponses = async () => {
  pending.value = true;
  error.value = null;
  try {
    const rows = await $fetch("/api/dashboard/apiDash");
    allResponses.value = rows.map((r) => ({ ...r, timestamp: new Date(r.timestamp) }));
    lastSync.value = new Date().toLocaleTimeString("fr-CA");
  } catch (e) {
    error.value = e;
  } finally {
    pending.value = false;
  }
};

/* ---------------- Filtres ---------------- */
const filters = reactive({
  age: "",
  duree: "",
  menage: "",
  logement: "",
  from: "",
  to: "",
  search: "",
});

function resetFilters() {
  filters.age = filters.duree = filters.menage = filters.logement = filters.from = filters.to = filters.search =
    "";
}

const filteredResponses = computed(() => {
  return (allResponses.value || []).filter((r) => {
    if (filters.age && r.age !== filters.age) return false;
    if (filters.duree && r.duree !== filters.duree) return false;
    if (filters.menage && r.menage !== filters.menage) return false;
    if (filters.logement && r.logementSituation !== filters.logement) return false;
    if (filters.from && r.timestamp < new Date(filters.from)) return false;
    if (filters.to && r.timestamp > new Date(filters.to + "T23:59:59")) return false;
    if (
      filters.search &&
      !(r.commentaire || "").toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });
});

/* ---------------- KPI ---------------- */
const kpis = computed(() => {
  const data = filteredResponses.value;
  const total = data.length;
  const satisfaits = data.filter(
    (r) =>
      r.logementSatisfaction === "Très satisfait" ||
      r.logementSatisfaction === "Satisfait"
  ).length;
  const quittent = data.filter((r) => r.quitterMoonbeam === "Oui").length;
  const favAines = data.filter((r) => r.favorableResidenceAines === "Oui").length;
  return {
    satisfactionLogementPct: total ? Math.round((satisfaits / total) * 100) : 0,
    quitterPct: total ? Math.round((quittent / total) * 100) : 0,
    favAinesPct: total ? Math.round((favAines / total) * 100) : 0,
  };
});

function countBy(data, getter, allOptions) {
  const counts = Object.fromEntries(allOptions.map((o) => [o, 0]));
  data.forEach((r) => {
    const v = getter(r);
    if (Array.isArray(v))
      v.forEach((x) => {
        if (x in counts) counts[x]++;
      });
    else if (v in counts) counts[v]++;
  });
  return counts;
}

/* ---------------- Graphiques ---------------- */
const chartAgeEl = ref(null);
const chartLogementSituationEl = ref(null);
const chartLogementSatisfactionEl = ref(null);
const chartLogementsManquantsEl = ref(null);
const chartServicesEl = ref(null);
const chartDefiEcoEl = ref(null);
const chartPrioritesEl = ref(null);
const chartAinesEl = ref(null);
const chartInstances = {};

function upsertChart(el, key, config) {
  if (!el) return;
  chartInstances[key]?.destroy();
  chartInstances[key] = new Chart(el, config);
}

function baseBarOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10.5 }, color: "#5C6D69" } },
      y: {
        grid: { color: "#EEF1EE" },
        ticks: { font: { size: 10.5 }, color: "#5C6D69" },
      },
    },
    ...extra,
  };
}

function renderCharts() {
  const data = filteredResponses.value;

  const ageCounts = countBy(data, (r) => r.age, OPTIONS.age);
  upsertChart(chartAgeEl.value, "age", {
    type: "bar",
    data: {
      labels: OPTIONS.age,
      datasets: [
        {
          data: Object.values(ageCounts),
          backgroundColor: PALETTE[0],
          borderRadius: 6,
          maxBarThickness: 28,
        },
      ],
    },
    options: baseBarOptions(),
  });

  const situCounts = countBy(data, (r) => r.logementSituation, OPTIONS.logementSituation);
  upsertChart(chartLogementSituationEl.value, "situation", {
    type: "doughnut",
    data: {
      labels: OPTIONS.logementSituation,
      datasets: [
        {
          data: Object.values(situCounts),
          backgroundColor: PALETTE,
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10.5 } } },
      },
    },
  });

  const satCounts = countBy(
    data,
    (r) => r.logementSatisfaction,
    OPTIONS.logementSatisfaction
  );
  upsertChart(chartLogementSatisfactionEl.value, "satisfaction", {
    type: "doughnut",
    data: {
      labels: OPTIONS.logementSatisfaction,
      datasets: [
        {
          data: Object.values(satCounts),
          backgroundColor: [PALETTE[1], PALETTE[0], PALETTE[2], PALETTE[5]],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10.5 } } },
      },
    },
  });

  const manquantsCounts = countBy(
    data,
    (r) => r.logementsManquants,
    OPTIONS.logementsManquants
  );
  const sortedManquants = OPTIONS.logementsManquants
    .map((l) => ({ label: l, value: manquantsCounts[l] }))
    .sort((a, b) => b.value - a.value);
  upsertChart(chartLogementsManquantsEl.value, "manquants", {
    type: "bar",
    data: {
      labels: sortedManquants.map((d) => d.label),
      datasets: [
        {
          data: sortedManquants.map((d) => d.value),
          backgroundColor: PALETTE[2],
          borderRadius: 6,
          maxBarThickness: 36,
        },
      ],
    },
    options: baseBarOptions(),
  });

  const niveaux = OPTIONS.niveauxSatisfaction;
  const serviceDatasets = niveaux.map((niv, i) => ({
    label: niv,
    data: OPTIONS.servicesMunicipaux.map(
      (s) => data.filter((r) => r.servicesSatisfaction?.[s] === niv).length
    ),
    backgroundColor: [PALETTE[1], PALETTE[0], PALETTE[2], PALETTE[5]][i],
    borderRadius: 4,
  }));
  upsertChart(chartServicesEl.value, "services", {
    type: "bar",
    data: { labels: OPTIONS.servicesMunicipaux, datasets: serviceDatasets },
    options: baseBarOptions({
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 10.5 }, color: "#5C6D69" },
        },
        y: {
          stacked: true,
          grid: { color: "#EEF1EE" },
          ticks: { font: { size: 10.5 }, color: "#5C6D69" },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { boxWidth: 10, font: { size: 10.5 } },
        },
      },
    }),
  });

  const defiCounts = countBy(data, (r) => r.defiEco, OPTIONS.defiEco);
  upsertChart(chartDefiEcoEl.value, "defi", {
    type: "pie",
    data: {
      labels: OPTIONS.defiEco,
      datasets: [
        {
          data: Object.values(defiCounts),
          backgroundColor: PALETTE,
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } },
      },
    },
  });

  const prioCounts = countBy(data, (r) => r.priorites, OPTIONS.priorites);
  const sortedPrio = OPTIONS.priorites
    .map((p) => ({ label: p, value: prioCounts[p] }))
    .sort((a, b) => b.value - a.value);
  upsertChart(chartPrioritesEl.value, "priorites", {
    type: "bar",
    data: {
      labels: sortedPrio.map((d) => d.label),
      datasets: [
        {
          data: sortedPrio.map((d) => d.value),
          backgroundColor: PALETTE[0],
          borderRadius: 6,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: "#EEF1EE" },
          ticks: { font: { size: 10.5 }, color: "#5C6D69" },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10.5 }, color: "#5C6D69" },
        },
      },
    },
  });

  const ainesCounts = countBy(data, (r) => r.aines, OPTIONS.aines);
  upsertChart(chartAinesEl.value, "aines", {
    type: "doughnut",
    data: {
      labels: OPTIONS.aines,
      datasets: [
        {
          data: Object.values(ainesCounts),
          backgroundColor: [PALETTE[1], PALETTE[5], PALETTE[6]],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10.5 } } },
      },
    },
  });
}

/* ---------------- Table : tri + pagination ---------------- */
const sortKey = ref("timestamp");
const sortDir = ref(-1);
const currentPage = ref(1);
const pageSize = 10;

function setSort(key) {
  if (sortKey.value === key) sortDir.value *= -1;
  else {
    sortKey.value = key;
    sortDir.value = 1;
  }
}

const sortedResponses = computed(() => {
  return [...filteredResponses.value].sort((a, b) => {
    let va = a[sortKey.value],
      vb = b[sortKey.value];
    if (sortKey.value === "timestamp") return (va - vb) * sortDir.value;
    if (sortKey.value === "id") return (va - vb) * sortDir.value;
    return String(va).localeCompare(String(vb)) * sortDir.value;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedResponses.value.length / pageSize))
);
const pageRows = computed(() => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
  const start = (currentPage.value - 1) * pageSize;
  return sortedResponses.value.slice(start, start + pageSize);
});

function fmtDate(d) {
  return (
    d.toLocaleDateString("fr-CA") +
    " · " +
    d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })
  );
}
function badgeClass(value) {
  return value === "Oui" ? "oui" : value === "Non" ? "non" : "neutre";
}

/* ---------------- Export CSV (compatible Excel FR) ---------------- */

// Libellés lisibles pour les champs connus. Tout champ présent dans les
// données mais absent d'ici obtient automatiquement un libellé généré
// (voir humanizeKey) — aucun champ n'est donc jamais oublié à l'export.
const FIELD_LABELS = {
  id: "ID",
  timestamp: "Horodatage",
  age: "Groupe d'âge",
  duree: "Durée à Moonbeam",
  menage: "Type de ménage",
  logementSituation: "Situation logement",
  logementSatisfaction: "Satisfaction logement",
  trouveFacilementLogement: "Trouve facilement logement",
  coutsLogement: "Coûts logement raisonnables",
  logementsManquants: "Types de logements manquants",
  envisageQuitterLogement: "Envisage de quitter (logement)",
  quitterMoonbeam: "Envisage de quitter Moonbeam",
  connaitPersonneCherchantLogement: "Connaît une personne cherchant un logement",
  nouveauxLogementsAttireraient: "Nouveaux logements attireraient des résidents",
  servicesAinesSuffisants: "Services aînés jugés suffisants",
  residenceAinesRepondBesoin: "Résidence aînés répond au besoin",
  favorableResidenceAines: "Favorable à une résidence pour aînés",
  aines: "Services aînés jugés suffisants",
  famillesTrouventServices: "Familles trouvent les services",
  encourageraitJeunesFamilles: "Encouragerait les jeunes familles",
  servicesFamilles: "Services aux familles souhaités",
  servicesAines: "Services aux aînés souhaités",
  defiEco: "Plus grand défi économique",
  forceMoonbeam: "Plus grande force de Moonbeam",
  defiMoonbeam: "Plus grand défi de Moonbeam",
  projetAmelioreMoonbeam: "Projet qui améliorerait Moonbeam",
  commercesSouhaites: "Commerces souhaités",
  priorites: "Priorités citoyennes",
  servicesSatisfaction: "Satisfaction des services municipaux",
  commentaire: "Commentaires et suggestions",
  completionSeconds: "Durée de complétion (secondes)",
  locale: "Langue",
  isComplete: "Réponse complète",
};

// Ordre d'affichage préféré pour les champs connus — les champs inconnus
// (qui pourraient exister côté API sans être listés ici) sont ajoutés à la fin.
const FIELD_ORDER = [
  "id",
  "timestamp",
  "age",
  "duree",
  "menage",
  "logementSituation",
  "logementSatisfaction",
  "trouveFacilementLogement",
  "coutsLogement",
  "logementsManquants",
  "envisageQuitterLogement",
  "quitterMoonbeam",
  "connaitPersonneCherchantLogement",
  "nouveauxLogementsAttireraient",
  "servicesAinesSuffisants",
  "residenceAinesRepondBesoin",
  "favorableResidenceAines",
  "aines",
  "servicesAines",
  "famillesTrouventServices",
  "encourageraitJeunesFamilles",
  "servicesFamilles",
  "defiEco",
  "forceMoonbeam",
  "defiMoonbeam",
  "projetAmelioreMoonbeam",
  "commercesSouhaites",
  "priorites",
  "servicesSatisfaction",
  "commentaire",
  "completionSeconds",
  "locale",
  "isComplete",
];

function humanizeKey(key) {
  const spaced = key.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Choix multiples (tableau) -> valeurs séparées par " | "
// Grille de satisfaction (objet) -> "Service: réponse | Service: réponse"
function formatCsvValue(key, value) {
  if (value === null || value === undefined || value === "") return "";
  if (key === "timestamp") return fmtDate(value);
  if (Array.isArray(value)) return value.join(" | ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");
  }
  return String(value);
}

function exportCsv() {
  const data = filteredResponses.value;
  if (!data.length) return;

  // Toutes les clés réellement présentes dans les réponses, dans l'ordre
  // de première apparition — garantit qu'on n'oublie aucun champ même s'il
  // n'est pas dans FIELD_ORDER (ex: nouveau champ ajouté au sondage plus tard).
  const seen = new Set();
  const allKeys = [];
  data.forEach((r) => {
    Object.keys(r).forEach((k) => {
      if (!seen.has(k)) {
        seen.add(k);
        allKeys.push(k);
      }
    });
  });

  const orderedKeys = [
    ...FIELD_ORDER.filter((k) => allKeys.includes(k)),
    ...allKeys.filter((k) => !FIELD_ORDER.includes(k)),
  ];

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const headerRow = orderedKeys
    .map((k) => escape(FIELD_LABELS[k] || humanizeKey(k)))
    .join(";");

  const rows = data.map((r) =>
    orderedKeys.map((k) => escape(formatCsvValue(k, r[k]))).join(";")
  );

  // ";" comme séparateur (attendu par Excel FR), \r\n pour compatibilité Windows,
  // BOM UTF-8 pour que les accents s'affichent correctement à l'ouverture.
  const csv = [headerRow, ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `moonbeam-sondage-complet-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- Cycle de vie ---------------- */
onMounted(async () => {
  await fetchResponses();
  await nextTick();
  renderCharts();
});
watch(filteredResponses, () => renderCharts());
</script>

<style scoped>
.dash-page {
  --bg: #f5f7f4;
  --bg-card: #ffffff;
  --ink: #152524;
  --ink-muted: #5c6d69;
  --ink-soft: #8b9a96;
  --primary: #164e48;
  --primary-light: #2c7a6e;
  --primary-pale: #e4eeeb;
  --accent: #e8b14d;
  --accent-deep: #b9821e;
  --line: #e2e6e2;
  --red: #c2594b;
  --red-soft: #f3ddd8;
  --radius: 14px;
  --shadow: 0 1px 2px rgba(21, 37, 36, 0.04), 0 6px 20px rgba(21, 37, 36, 0.05);

  background: var(--bg);
  color: var(--ink);
  font-family: "Inter", system-ui, sans-serif;
  min-height: 100vh;
}

.mono {
  font-family: "JetBrains Mono", monospace;
}

.top {
  position: relative;
  background: linear-gradient(160deg, var(--primary) 0%, #0f3934 62%, #0c2e2a 100%);
  color: #f4f6f2;
  padding: 34px 40px 30px;
  overflow: hidden;
}
.top::before {
  content: "";
  position: absolute;
  top: -120px;
  right: -60px;
  width: 420px;
  height: 420px;
  background: radial-gradient(
    circle,
    rgba(232, 177, 77, 0.55) 0%,
    rgba(232, 177, 77, 0.12) 45%,
    transparent 70%
  );
}
.top::after {
  content: "";
  position: absolute;
  top: 36px;
  right: 120px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 32%,
    #fcefce 0%,
    var(--accent) 55%,
    transparent 78%
  );
  box-shadow: 0 0 60px 10px rgba(232, 177, 77, 0.35);
  opacity: 0.85;
}
.top-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--accent);
  margin: 0 0 10px;
}
.title {
  font-family: "Fraunces", serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.15;
  margin: 0 0 6px;
  max-width: 640px;
}
.subtitle {
  color: #cbd9d4;
  font-size: 14px;
  margin: 0;
  max-width: 520px;
}
.updated {
  font-size: 12px;
  color: #a9bdb7;
  text-align: right;
}
.updated .dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #7bd3a6;
  margin-right: 6px;
  box-shadow: 0 0 0 3px rgba(123, 211, 166, 0.25);
}

.state-box {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--ink-muted);
}
.state-box.error {
  border-color: var(--red);
  color: var(--red);
}

main {
  padding: 26px 40px 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.filters {
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  align-items: flex-end;
  margin-top: -46px;
  position: relative;
  z-index: 2;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
  flex: 1 1 150px;
}
.field label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--ink-muted);
  text-transform: uppercase;
}
.field select,
.field input[type="date"],
.field input[type="search"] {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13.5px;
  background: #fcfdfc;
  color: var(--ink);
  font-family: inherit;
}
.field select:focus,
.field input:focus {
  outline: 2px solid var(--primary-light);
  outline-offset: 1px;
}
.filters .actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
  align-items: flex-end;
}
button {
  font-family: inherit;
  cursor: pointer;
}
.btn {
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}
.btn:hover {
  border-color: var(--primary-light);
}
.btn.primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.btn.primary:hover {
  background: var(--primary-light);
}
.active-count {
  font-size: 12px;
  color: var(--ink-muted);
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.active-count b {
  color: var(--primary);
  font-weight: 700;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.kpi {
  min-width: 0;
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
}
.kpi .label {
  font-size: 12px;
  color: var(--ink-muted);
  font-weight: 600;
  margin-bottom: 10px;
}
.kpi .value {
  font-family: "Fraunces", serif;
  font-size: 34px;
  font-weight: 600;
  color: var(--primary);
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.kpi .value .unit {
  font-size: 16px;
  color: var(--ink-soft);
  font-weight: 500;
}
.kpi .glow {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  right: -30px;
  top: -30px;
  background: radial-gradient(circle, rgba(232, 177, 77, 0.28), transparent 70%);
}
.kpi .delta {
  font-size: 12px;
  margin-top: 8px;
  color: var(--ink-muted);
}
.kpi .delta.up {
  color: #2c7a6e;
}
.kpi .delta.warn {
  color: var(--red);
}

.section-title {
  font-family: "Fraunces", serif;
  font-size: 19px;
  font-weight: 600;
  margin: 34px 0 14px;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-title .bar {
  width: 22px;
  height: 3px;
  background: var(--accent);
  border-radius: 2px;
  display: inline-block;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}
.card {
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px 20px;
  min-width: 0;
}
.card h3 {
  margin: 0 0 3px;
  font-size: 14.5px;
  font-weight: 700;
}
.card p.hint {
  margin: 0 0 14px;
  font-size: 12px;
  color: var(--ink-muted);
}
.col-4 {
  grid-column: span 4;
}
.col-5 {
  grid-column: span 5;
}
.col-7 {
  grid-column: span 7;
}
.col-8 {
  grid-column: span 8;
}
.col-12 {
  grid-column: span 12;
}

/* Conteneur à hauteur fixe requis par Chart.js en mode responsive :
     sans lui, le canvas n'a rien pour borner sa hauteur et gonfle à l'infini. */
.chart-wrap {
  position: relative;
  width: 100%;
}
.chart-wrap canvas {
  max-width: 100%;
}
.h-110 {
  height: 110px;
}
.h-200 {
  height: 200px;
}
.h-220 {
  height: 220px;
}
.h-230 {
  height: 230px;
}

.table-card {
  margin-top: 16px;
}
.table-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
thead th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-muted);
  border-bottom: 1px solid var(--line);
  padding: 9px 10px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
thead th:hover {
  color: var(--primary);
}
tbody td {
  padding: 10px;
  border-bottom: 1px solid #eef1ee;
  white-space: nowrap;
}
tbody tr:hover {
  background: var(--primary-pale);
}
.badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
}
.badge.oui {
  background: var(--primary-pale);
  color: var(--primary);
}
.badge.non {
  background: var(--red-soft);
  color: var(--red);
}
.badge.neutre {
  background: #f1f1ec;
  color: var(--ink-muted);
}
.ts {
  color: var(--ink-soft);
  font-size: 12px;
}
.pager {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 14px;
  font-size: 13px;
  color: var(--ink-muted);
}
.pager button {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
}
.pager button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Tablette : chaque carte prend toute la largeur de la ligne.
     "1 / -1" (plutôt que "span 12") force la pleine largeur peu importe
     le nombre de colonnes du grid parent — plus robuste que span 12. */
@media (max-width: 1100px) {
  main {
    padding-left: 24px;
    padding-right: 24px;
  }
  .title {
    font-size: 27px;
  }
  .kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .col-4,
  .col-5,
  .col-7,
  .col-8,
  .col-12 {
    grid-column: 1 / -1;
    width: 100%;
  }
  .card {
    padding: 20px 22px;
  }
  .card h3 {
    font-size: 16px;
  }
  .card p.hint {
    font-size: 13px;
  }
  .kpi .value {
    font-size: 30px;
  }
  /* Graphiques agrandis : une seule carte par ligne, donc plus de place */
  .h-110 {
    height: 160px;
  }
  .h-200 {
    height: 260px;
  }
  .h-220 {
    height: 260px;
  }
  .h-230 {
    height: 270px;
  }
}

/* Téléphone : pleine largeur + texte/graphiques encore un peu plus grands */
@media (max-width: 640px) {
  .top,
  main {
    padding-left: 18px;
    padding-right: 18px;
  }
  .title {
    font-size: 23px;
  }
  .subtitle {
    font-size: 13.5px;
  }
  .updated {
    text-align: left;
  }
  .filters {
    flex-direction: column;
    align-items: stretch;
    margin-top: 16px;
  }
  .field,
  .field[style] {
    min-width: 100% !important;
    flex: 1 1 100%;
  }
  .filters .actions {
    margin-left: 0;
    width: 100%;
  }
  .filters .actions .btn {
    flex: 1;
  }
  .kpis {
    grid-template-columns: 1fr;
  }
  .kpi {
    padding: 20px 22px;
  }
  .kpi .value {
    font-size: 32px;
  }
  .kpi .label {
    font-size: 13px;
  }
  .section-title {
    font-size: 18px;
    margin: 28px 0 12px;
  }
  .card {
    padding: 18px 20px;
  }
  .card h3 {
    font-size: 16.5px;
  }
  .card p.hint {
    font-size: 13px;
  }
  .h-110 {
    height: 170px;
  }
  .h-200 {
    height: 250px;
  }
  .h-220 {
    height: 250px;
  }
  .h-230 {
    height: 260px;
  }
  table {
    font-size: 12.5px;
  }
}
</style>
