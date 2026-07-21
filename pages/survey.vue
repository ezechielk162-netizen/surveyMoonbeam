<template>
  <div class="survey-page">
    <header class="top">
      <div class="top-inner">
        <p class="eyebrow">Ville de Moonbeam · Consultation publique</p>
        <h1 class="title">Ensemble pour l'avenir de Moonbeam</h1>
        <p class="subtitle">
          Votre opinion guide directement les décisions du conseil municipal et les demandes de
          subvention pour le logement, les services aux aînés et le développement économique.
        </p>
      </div>
    </header>

    <div v-if="pending" class="state-box">Chargement du questionnaire...</div>

    <div v-else-if="error" class="state-box error">
      Impossible de charger le questionnaire pour le moment.
      <button class="btn" @click="refresh()">Réessayer</button>
    </div>

    <div v-else-if="!sections?.length" class="state-box">
      Aucune question disponible pour le moment.
    </div>

    <div v-else class="layout">
      <!-- ===== Navigation latérale ===== -->
      <nav class="sections" v-show="!submitSuccess">
        <div class="progress-wrap">
          <div class="progress-bar"><div :style="{ width: progressPct + '%' }"></div></div>
          <div class="progress-label">{{ progressPct }} % complété</div>
        </div>
        <a
          v-for="(section, i) in sections"
          :key="section.id"
          href="#"
          :class="{ active: activeSection === section.id }"
          @click.prevent="scrollToSection(section.id)"
        >
          <span class="num">{{ i + 1 }}</span>{{ section.title }}
        </a>
      </nav>

      <!-- ===== Formulaire ===== -->
      <form v-if="!submitSuccess" class="survey-form" @submit.prevent="onSubmit">
        <section
          v-for="section in sections"
          :id="section.id"
          :key="section.id"
          class="card"
        >
          <h2>{{ section.title }}</h2>

          <div v-for="question in section.questions" :key="question.id" class="question">
            <label class="q-title">
              {{ question.label }}
              <span v-if="question.required" class="required">*</span>
              <span v-if="question.maxChoices" class="q-counter">
                ({{ (answers[question.id] || []).length }} / {{ question.maxChoices }} sélectionnées)
              </span>
            </label>
            <p v-if="question.hint" class="section-hint">{{ question.hint }}</p>

            <!-- radio -->
            <div v-if="question.type === 'radio'" class="options">
              <label
                v-for="opt in question.options"
                :key="opt.value"
                class="opt"
                :class="{ checked: answers[question.id] === opt.value }"
              >
                <input
                  type="radio"
                  :name="question.id"
                  :value="opt.value"
                  v-model="answers[question.id]"
                  :required="question.required"
                />
                <span>{{ opt.label }}</span>
              </label>
            </div>

            <!-- checkbox -->
            <div v-else-if="question.type === 'checkbox'" class="options">
              <label
                v-for="opt in question.options"
                :key="opt.value"
                class="opt"
                :class="{
                  checked: (answers[question.id] || []).includes(opt.value),
                  disabled: isChoiceDisabled(question, opt.value),
                }"
              >
                <input
                  type="checkbox"
                  :value="opt.value"
                  v-model="answers[question.id]"
                  :disabled="isChoiceDisabled(question, opt.value)"
                />
                <span>{{ opt.label }}</span>
              </label>
              <label v-if="question.placeholder" class="opt" :class="{ checked: autreFlags[question.id] }">
                <input type="checkbox" v-model="autreFlags[question.id]" />
                <span>{{ question.placeholder }}</span>
              </label>
              <input
                v-if="question.placeholder && autreFlags[question.id]"
                type="text"
                class="autre-precision"
                v-model="autreTexts[question.id]"
                :placeholder="question.placeholder"
              />
            </div>

            <!-- textarea -->
            <textarea
              v-else-if="question.type === 'textarea'"
              v-model="answers[question.id]"
              :required="question.required"
            ></textarea>

            <!-- ranking -->
            <div v-else-if="question.type === 'ranking'" class="rank-wrap">
              <div v-for="(rank, i) in 3" :key="i" class="rank-row">
                <span class="rank-label">Priorité {{ i + 1 }}</span>
                <select
                  :value="(answers[question.id] || [])[i] || ''"
                  @change="setRank(question.id, i, $event.target.value)"
                >
                  <option value="">— Choisir —</option>
                  <option
                    v-for="opt in question.options"
                    :key="opt.value"
                    :value="opt.value"
                    :disabled="
                      (answers[question.id] || []).includes(opt.value) &&
                      (answers[question.id] || [])[i] !== opt.value
                    "
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- satisfaction-table -->
            <table v-else-if="question.type === 'satisfaction-table'" class="matrix">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="col in question.columns" :key="col.value">{{ col.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in question.rows" :key="row.value">
                  <td>{{ row.label }}</td>
                  <td v-for="col in question.columns" :key="col.value">
                    <input
                      type="radio"
                      :name="question.id + '_' + row.value"
                      :value="col.value"
                      v-model="matrixAnswers[question.id][row.value]"
                      :required="question.required"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="submit-row">
          <p v-if="submitError" class="error-msg">{{ submitError }}</p>
          <button type="submit" class="btn primary" :disabled="submitting">
            {{ submitting ? "Envoi en cours…" : "Envoyer le sondage" }}
          </button>
        </div>
      </form>

      <!-- ===== Écran de confirmation ===== -->
      <div v-else id="confirmation">
        <div class="glow-icon"></div>
        <h2>Merci pour votre participation !</h2>
        <p>Vos réponses ont bien été enregistrées et contribueront directement aux décisions municipales à venir.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";

const { data: sections, pending, error, refresh } = useSurveyData();

const answers = reactive({});
const matrixAnswers = reactive({});
const autreFlags = reactive({});
const autreTexts = reactive({});
const submitting = ref(false);
const submitError = ref("");
const submitSuccess = ref(false);

const activeSection = ref("");
let observer = null;

definePageMeta({
  layout: 'none'
})

// Initialise les structures de réponses une fois que la structure du sondage est chargée
watch(
  sections,
  async (val) => {
    if (!val || !val.length) return;
    for (const section of val) {
      for (const q of section.questions) {
        if (q.type === "checkbox" && !(q.id in answers)) answers[q.id] = [];
        if (q.type === "satisfaction-table" && !(q.id in matrixAnswers)) matrixAnswers[q.id] = {};
      }
    }
    activeSection.value = val[0]?.id ?? "";
    await nextTick();
    setupObserver(val);
  },
  { immediate: true }
);

function setupObserver(sectionList) {
  observer?.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeSection.value = entry.target.id;
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );
  sectionList.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });
}

onBeforeUnmount(() => observer?.disconnect());

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const progressPct = computed(() => {
  const list = sections.value || [];
  if (!list.length) return 0;
  const idx = list.findIndex((s) => s.id === activeSection.value);
  return Math.round(((idx + 1) / list.length) * 100);
});

function isChoiceDisabled(question, value) {
  if (!question.maxChoices) return false;
  const current = answers[question.id] || [];
  return current.length >= question.maxChoices && !current.includes(value);
}

function setRank(questionId, index, value) {
  const current = [...(answers[questionId] || [])];
  current[index] = value;
  answers[questionId] = current;
}

async function onSubmit() {
  submitError.value = "";
  submitting.value = true;
  try {
    await $fetch("/api/sondage/responses", {
      method: "POST",
      body: {
        answers: {
          principal: {
            ...answers,
            services_municipaux: matrixAnswers.services_municipaux ?? {},
          },
        },
      },
    });
    submitSuccess.value = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    submitError.value = "Une erreur est survenue lors de l'envoi. Veuillez réessayer.";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.survey-page {
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
  --radius: 14px;
  --shadow: 0 1px 2px rgba(21, 37, 36, 0.04), 0 6px 20px rgba(21, 37, 36, 0.05);

  background: var(--bg);
  color: var(--ink);
  font-family: "Inter", system-ui, sans-serif;
  min-height: 100vh;
}

.top {
  position: relative;
  background: linear-gradient(160deg, var(--primary) 0%, #0f3934 62%, #0c2e2a 100%);
  color: #f4f6f2;
  padding: 34px 40px 46px;
  overflow: hidden;
}

.top::before {
  content: "";
  position: absolute;
  top: -120px;
  right: -60px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(232, 177, 77, 0.55) 0%, rgba(232, 177, 77, 0.12) 45%, transparent 70%);
}

.top-inner {
  position: relative;
  z-index: 1;
  max-width: 920px;
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
  font-size: 30px;
  line-height: 1.15;
  margin: 0 0 8px;
}

.subtitle {
  color: #cbd9d4;
  font-size: 14px;
  margin: 0;
  max-width: 600px;
  line-height: 1.5;
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

.layout {
  max-width: 1100px;
  margin: -26px auto 60px;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  position: relative;
  z-index: 2;
}

/* Navigation latérale */
.sections {
  position: sticky;
  top: 20px;
  align-self: start;
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 14px;
  height: fit-content;
}


.sections a {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: var(--ink-muted);
  font-size: 12.5px;
  font-weight: 600;
  padding: 8px 9px;
  border-radius: 8px;
  margin-bottom: 2px;
}

.sections a .num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-pale);
  color: var(--primary);
  font-size: 10.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "JetBrains Mono", monospace;
  flex: none;
}

.sections a.active {
  background: var(--primary-pale);
  color: var(--primary);
}

.sections a.active .num {
  background: var(--primary);
  color: #fff;
}

.progress-wrap {
  padding: 6px 9px 12px;
}

.progress-bar {
  height: 6px;
  background: var(--primary-pale);
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar > div {
  height: 100%;
  background: var(--accent);
  width: 0%;
  transition: width 0.25s ease;
}

.progress-label {
  font-size: 11px;
  color: var(--ink-muted);
  margin-top: 6px;
}

/* Formulaire */
.survey-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 26px 28px;
  scroll-margin-top: 20px;
}

.card h2 {
  font-family: "Fraunces", serif;
  font-size: 21px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--ink);
}

.section-hint {
  margin: 0 0 18px;
  font-size: 13px;
  color: var(--ink-muted);
}

.question {
  margin-bottom: 20px;
}

.question:last-child {
  margin-bottom: 0;
}

.q-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--ink);
}

.required {
  color: var(--red);
}

.q-counter {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--ink-soft);
  margin-left: 6px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opt {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13.5px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.opt:hover {
  border-color: var(--primary-light);
}

.opt input {
  accent-color: var(--primary);
  width: 16px;
  height: 16px;
  flex: none;
}

.opt.checked {
  border-color: var(--primary);
  background: var(--primary-pale);
}

.opt.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

input[type="text"],
textarea,
select {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 10px 12px;
  font-size: 13.5px;
  font-family: inherit;
  color: var(--ink);
  background: #fcfdfc;
}

textarea {
  min-height: 84px;
  resize: vertical;
}

input:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--primary-light);
  outline-offset: 1px;
}

.autre-precision {
  margin-top: 8px;
  margin-left: 26px;
  width: calc(100% - 26px);
}

/* Tableau matriciel */
table.matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

table.matrix th {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-muted);
  padding: 8px 6px;
  border-bottom: 1px solid var(--line);
}

table.matrix th:first-child {
  text-align: left;
}

table.matrix td {
  padding: 10px 6px;
  border-bottom: 1px solid #eef1ee;
  text-align: center;
}

table.matrix td:first-child {
  text-align: left;
  font-weight: 600;
  font-size: 13px;
}

table.matrix input {
  accent-color: var(--primary);
  width: 16px;
  height: 16px;
}

/* Classement */
.rank-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.rank-row .rank-label {
  width: 90px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-muted);
  flex: none;
}

/* Bouton d'envoi */
.submit-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

button {
  font-family: inherit;
  cursor: pointer;
}

.btn {
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  padding: 10px 18px;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 600;
}

.btn.primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.btn.primary:hover {
  background: var(--primary-light);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.error-msg {
  color: var(--red);
  margin: 0;
}

/* Écran de confirmation */
#confirmation {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px 20px;
}

#confirmation .glow-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 32%, #fcefce 0%, var(--accent) 55%, transparent 78%);
  box-shadow: 0 0 60px 10px rgba(232, 177, 77, 0.35);
}

#confirmation h2 {
  font-family: "Fraunces", serif;
  font-size: 24px;
  margin: 0 0 8px;
}

#confirmation p {
  color: var(--ink-muted);
  font-size: 14px;
  max-width: 420px;
  margin: 0 auto;
}

@media (max-width: 820px) {
  .layout {
    grid-template-columns: 1fr;
    margin-top: -20px;
  }
  
  .sections {
    position: static;
    display: flex;
    overflow-x: auto;
    gap: 4px;
  }
  .sections a {
    white-space: nowrap;
  }
  .card {
    padding: 18px 16px;
  }
  .top,
  .layout {
    padding-left: 18px;
    padding-right: 18px;
  }
}

@media (max-width: 380px) {
  .card {
    margin-top: 40px;
    padding: 8px;
  }
  .rank-row {
    flex-wrap: wrap;
  }
  .rank-row .rank-label {
    width: 100%;
  }
  .top,
  .layout {
    padding-left: 5px;
    padding-right: 5px;
  }
  .sections {
    display: none;
  }
}
</style>