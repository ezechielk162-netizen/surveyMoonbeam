<template>
  <div class="loader-container">
    <div class="loader-icon">
      <svg class="location-pulse" viewBox="0 0 120 120">
        <!-- Pin principal -->
        <path
          class="main-pin"
          d="M60 15 C 45 15, 35 25, 35 40 C 35 60, 60 80, 60 80 C 60 80, 85 60, 85 40 C 85 25, 75 15, 60 15 Z"
        />
        <circle class="pin-dot" cx="60" cy="40" r="8" />

        <!-- Ondes de pulsation -->
        <circle class="pulse-ring ring-1" cx="60" cy="40" r="20" />
        <circle class="pulse-ring ring-2" cx="60" cy="40" r="20" />
        <circle class="pulse-ring ring-3" cx="60" cy="40" r="20" />
      </svg>
    </div>

    <div class="loader-text">
      <strong>Chargement</strong>
      <span>Récupération des informations du sondage…</span>
    </div>

    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.loader-container {
  position: fixed;
  inset: 0;
  background: linear-gradient(160deg, #164e48 0%, #0f3934 62%, #0c2e2a 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #f4f6f2;
  gap: 2rem;
  z-index: 9999;
  font-family: "Inter", system-ui, sans-serif;
}

/* Icône de localisation animée */
.loader-icon {
  position: relative;
  width: 120px;
  height: 120px;
}

.location-pulse {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3));
}

/* Pin principal */
.main-pin {
  fill: #f4f6f2;
  animation: bounce 1.2s ease-in-out infinite;
  transform-origin: 60px 80px;
}

.pin-dot {
  fill: #e8b14d;
  animation: pulse-dot 1.2s ease-in-out infinite;
}

/* Anneaux de pulsation */
.pulse-ring {
  fill: none;
  stroke: rgba(232, 177, 77, 0.75);
  stroke-width: 2;
  transform-origin: center;
}

.ring-1 {
  animation: pulse-wave 2s ease-out infinite;
}

.ring-2 {
  animation: pulse-wave 2s ease-out infinite 0.4s;
}

.ring-3 {
  animation: pulse-wave 2s ease-out infinite 0.8s;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.05);
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

@keyframes pulse-wave {
  0% {
    r: 20;
    opacity: 0.8;
  }
  100% {
    r: 50;
    opacity: 0;
  }
}

/* Texte */
.loader-text {
  text-align: center;
  font-family: "Fraunces", serif;
}

.loader-text strong {
  font-size: 1.8rem;
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.loader-text span {
  opacity: 0.85;
  font-size: 1rem;
  font-weight: 400;
  font-family: "Inter", system-ui, sans-serif;
  color: #cbd9d4;
}

/* Barre de progression */
.progress-bar {
  width: 280px;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e8b14d, #2c7a6e, #e8b14d);
  background-size: 200% 100%;
  border-radius: 50px;
  animation: progress-slide 1.5s ease-in-out infinite;
}

@keyframes progress-slide {
  0% {
    width: 0%;
    background-position: 0% 50%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
    background-position: 100% 50%;
  }
}

/* Responsive */
@media (max-width: 576px) {
  .loader-icon {
    width: 100px;
    height: 100px;
  }

  .loader-text strong {
    font-size: 1.5rem;
  }

  .loader-text span {
    font-size: 0.9rem;
  }

  .progress-bar {
    width: 240px;
  }
}
</style>