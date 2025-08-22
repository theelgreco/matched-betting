<script setup lang="ts">
import {mdiCalculator, mdiCurrencyGbp, mdiMenu} from "@mdi/js";
import {Button} from "@/components/ui/button";
import SvgIcon from "@/components/icons/SvgIcon.vue";
import {useRoute} from "vue-router";
import CalculatorDialog from "@/components/calculator/CalculatorDialog.vue";
import {ref} from "vue";
import BalanceCard from "@/components/BalanceCard.vue";
import {useBalanceStore} from "@/stores/balances";
import {storeToRefs} from "pinia";

const route = useRoute()

const {exchangeBalance, profit, bookmakerBalance} = storeToRefs(useBalanceStore())

const calculatorOpen = ref(false)

const balancesExpanded = ref(false)
</script>

<template>
  <nav class="sticky flex flex-col w-screen top-0 z-40">
    <div
        class="flex items-center justify-between border-b border-b-border p-6 bg-gradient-to-tr to-primary-foreground/50 backdrop-blur-3xl">
      <div class="flex items-center gap-2">
        <img alt="logo" src="/favicon.svg" width="24" height="24"/>
        <p class="text-secondary-foreground/30">/</p>
        <h1 class="text-primary/60">{{ route.meta.title }}</h1>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="icon" @click="calculatorOpen = true">
          <SvgIcon :path="mdiCalculator"/>
        </Button>
        <Button variant="outline" size="icon" @click="balancesExpanded = !balancesExpanded">
          <SvgIcon :path="mdiCurrencyGbp"/>
        </Button>
        <Button variant="outline" size="icon">
          <SvgIcon :path="mdiMenu"/>
        </Button>
      </div>
      <CalculatorDialog v-if="calculatorOpen" v-model:open="calculatorOpen"/>
    </div>
    <div class="bg-[#0c0c0d] p-6 flex justify-between items-center gap-6">
      <BalanceCard label="EXCHANGE BALANCE"
                   :value="exchangeBalance"
                   :expanded="balancesExpanded"/>
      <BalanceCard label="PROFIT"
                   :value="profit"
                   :expanded="balancesExpanded"/>
      <BalanceCard label="BOOKMAKER BALANCE"
                   :value="bookmakerBalance"
                   :expanded="balancesExpanded"/>
    </div>
    <hr class="border-t-primary/10"/>
  </nav>
</template>