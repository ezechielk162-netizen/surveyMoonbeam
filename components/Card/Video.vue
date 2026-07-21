<template>
  <div class="landing">
    <div class="glow"></div>
    <div class="content">
      <p class="eyebrow">Ville de Moonbeam · Consultation publique</p>
      <h1 class="title">Ensemble pour l'avenir de Moonbeam</h1>
      <p class="subtitle">
        Votre opinion guide directement les décisions du conseil municipal et les demandes de
        subvention pour le logement, les services aux aînés et le développement économique.
        Le sondage prend environ 8 minutes.
      </p>
      <div class="actions">
        <NuxtLink to="/survey" class="btn primary">Commencer le sondage</NuxtLink>
        <NuxtLink to="/dashboard" class="btn secondary">Voir les résultats</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: "Sondage citoyen — Moonbeam" });
</script>

<style scoped>
.landing {
  --bg: #f5f7f4;
  --ink: #152524;
  --primary: #164e48;
  --primary-light: #2c7a6e;
  --accent: #e8b14d;

  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, var(--primary) 0%, #0f3934 62%, #0c2e2a 100%);
  color: #f4f6f2;
  overflow: hidden;
  font-family: "Inter", system-ui, sans-serif;
  text-align: center;
  padding: 2rem;
}

.glow {
  position: absolute;
  top: -120px;
  right: -60px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(232, 177, 77, 0.55) 0%, rgba(232, 177, 77, 0.12) 45%, transparent 70%);
  pointer-events: none;
}

.content {
  position: relative;
  z-index: 1;
  max-width: 560px;
  width: 100%;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  margin: 0 0 14px;
}

.title {
  font-family: "Fraunces", serif;
  font-weight: 600;
  font-size: 2.4rem;
  line-height: 1.15;
  margin: 0 0 16px;
}

.subtitle {
  color: #cbd9d4;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 32px;
}

.actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  text-decoration: none;
  font-family: inherit;
  font-weight: 600;
  font-size: 14.5px;
  padding: 13px 30px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn.primary {
  background: var(--accent);
  color: #14201d;
}

.btn.primary:hover {
  background: #f0c065;
}

.btn.secondary {
  background: transparent;
  border-color: rgba(244, 246, 242, 0.35);
  color: #f4f6f2;
}

.btn.secondary:hover {
  background: rgba(244, 246, 242, 0.08);
  border-color: rgba(244, 246, 242, 0.55);
}

/* Responsive : téléphone */
@media (max-width: 480px) {
  .landing {
    padding: 1.5rem 1.25rem;
    min-height: 100dvh;
  }

  .glow {
    width: 260px;
    height: 260px;
    top: -80px;
    right: -80px;
  }

  .title {
    font-size: 1.7rem;
  }

  .subtitle {
    font-size: 14px;
    margin-bottom: 28px;
  }

  .actions {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }

  .btn {
    width: 100%;
    box-sizing: border-box;
    padding: 14px 24px;
  }
}
</style>