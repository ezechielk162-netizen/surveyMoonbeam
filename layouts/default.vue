<template>
  <div>
    <div v-if="isReady">
      <nav class="navbar navbar-expand-lg custom-navbar">
        <div class="container-fluid">
          <!-- Logo -->
          <NuxtLink to="/" class="navbar-brand d-flex align-items-center gap-2">
            <EnvironmentFilled class="fix-icon fs-5" />
            <strong>Sondage Moonbeam</strong>
          </NuxtLink>

          <!-- Burger -->
          <a-button
            class="navbar-toggler menu-color"
            :class="{ rotated: isOpen }"
            @click="toggleMenu"
          >
            <MenuOutlined />
          </a-button>

          <!-- Menu -->
          <div class="navbar-collapse animated-collapse" :class="{ show: isOpen }">
            <ul class="navbar-nav ms-auto">
              <li v-for="(item, index) in menuItems" :key="index" class="nav-item">
                <NuxtLink :to="item.to" class="nav-link" @click="closeMenu">
                  <component :is="item.icon" class="fix-icon-contact" />
                  {{ t(item.name) }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div v-if="isReady">
        <ChangerLanguage />
      </div>

      <FooterPage />
    </div>
    <div v-else>
      <AppLoaderLoad />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { menuItems } from "~/core/constant";

const { isOpen, handleResize, toggleMenu, closeMenu } = useFunctions();
const route = useRouter();
const { t } = useI18n();

const componentsReady = ref(false);
const isReady = computed(() => componentsReady.value);

const isDesktop = ref(0);

const checkScreen = () => {
  isDesktop.value = window.innerWidth;
};

onMounted(() => {
  checkScreen();
  window.addEventListener("resize", checkScreen);
  window.addEventListener("resize", handleResize);
  componentsReady.value = true;
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreen);
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.custom-navbar {
  background: linear-gradient(90deg, #6b7de7, #7a4aa1);
  padding: 12px 20px;
}

.navbar-brand,
.nav-link {
  color: white !important;
  font-weight: 500;
}

.nav-link {
  margin-left: 5px;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.141);
  border-radius: 7px;
}

/* Burger */
.navbar-toggler {
  border: none;
}

.navbar-toggler:focus {
  box-shadow: none;
}

.animated-collapse {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.35s ease;
}

/* Ouvert */
.animated-collapse.show {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

/* Desktop */
@media (min-width: 991px) {
  .animated-collapse {
    max-height: none;
    opacity: 1;
    transform: none;
    display: flex !important;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .title-size {
    font-size: 17px !important;
  }

  .nav-link {
    margin-top: 5px;
    padding-left: 20px;
  }
}

@media (max-width: 1024px) {
  .title-size {
    font-size: 0px;
  }
}
</style>
