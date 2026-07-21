<template>
  <div>
    <div v-if="isReady">
      <NuxtPage></NuxtPage>
     <ChangerLanguage />
    </div>

    <div v-else>
      <AppLoaderLoad />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { handleResize } = useFunctions();

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
