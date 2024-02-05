<template>
  <router-view />
</template>

<script setup>
import { useAppStore } from '@/store/app';

const store = useAppStore();

store.connectToWebsocket();
</script>
