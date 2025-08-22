<script setup lang="ts">
import {RouterView} from 'vue-router'
import {Toaster} from "@/components/ui/sonner";
import NavBar from "@/components/nav/NavBar.vue";
</script>

<template>
  <NavBar/>
  <RouterView v-slot="{Component}">
    <keep-alive>
      <component :is="Component"></component>
    </keep-alive>
  </RouterView>
  <Toaster class="pointer-events-auto"/>
</template>
