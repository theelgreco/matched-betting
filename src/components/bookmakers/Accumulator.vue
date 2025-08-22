<script setup lang="ts">
import {type AccumulatorWithBetsAndMatches} from "@/types/queries/queries.types";
import {mdiCheck, mdiChevronDown} from "@mdi/js";
import {raiseErrorToast, raiseSuccessToast} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import SvgIcon from "@/components/icons/SvgIcon.vue";
import {onMounted, ref} from "vue"
import Bet from "@/components/bookmakers/Bet.vue";
import BetCategoryBadge from "@/components/bookmakers/BetCategoryBadge.vue";
import {useBalanceStore} from "@/stores/balances";
import {Badge} from "@/components/ui/badge";
import {supabase} from "@/lib/supabaseClient";

interface Props {
  accumulator: AccumulatorWithBetsAndMatches
}

interface Emits {
  (event: 'toggleSettled', value: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const {increment} = useBalanceStore()

const betsExpanded = ref(false)

const profit = ref<number | null>(null)

async function markAsSettled() {
  const {error} = await supabase.from('accumulators').update({settled: !props.accumulator.settled}).eq('id', props.accumulator.id)

  if (!error) {
    raiseSuccessToast(props.accumulator.settled ? "Bet marked as unsettled" : "Bet marked as settled")
    emit("toggleSettled", !props.accumulator.settled)
  } else {
    raiseErrorToast(error, "Failed to mark bet as settled")
  }
}

onMounted(() => {
  if (props.accumulator.back_stake && props.accumulator.back_odds && props.accumulator.liability) {
    const total = Number(((props.accumulator.back_stake * props.accumulator.back_odds) - props.accumulator.back_stake - props.accumulator.liability).toFixed(2))
    profit.value = total

    increment(total, 'profit')
  }
})
</script>

<template>
  <div class="flex flex-col overflow-hidden">
    <div class="flex w-full items-center justify-between border-t-1 border-border py-5 px-6">
      <div class="flex items-center gap-3">
        <BetCategoryBadge :betCategory="accumulator.bet_category"/>
        <Badge variant="outline">ACCA.</Badge>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-1">
            <small>{{ accumulator.bets.length }}-way accumulator</small>
            <SvgIcon :path="mdiChevronDown"
                     class="cursor-pointer hover:bg-secondary rounded transition-all text-white/50"
                     :rotate="betsExpanded ? -180 : 0"
                     @click="betsExpanded = !betsExpanded"/>
          </div>
          <div class="flex gap-3">
            <small>
              <span class="text-secondary-foreground/50">Back bet:</span>
              £{{ accumulator.back_stake }} @ {{ accumulator.back_odds }}
            </small>
            <small>
              <span class="text-secondary-foreground/50">Lay bet:</span> £{{ accumulator.lay_stake }} @
              {{ accumulator.lay_odds }}
            </small>
            <small>
              <span class="text-secondary-foreground/50">Liability:</span> £{{ accumulator.liability }}
            </small>
            <small>
              <span class="text-secondary-foreground/50">Profit:</span> £{{ profit }}
            </small>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-5 h-full">
        <Button variant="outline" size="icon"
                @click="markAsSettled"
                class="border rounded-full w-[20px] h-[20px]"
                :class="{'!border-primary/50 !bg-primary/10': accumulator.settled}">
          <SvgIcon v-if="accumulator.settled" :path="mdiCheck" class="text-primary"/>
        </Button>
      </div>
    </div>
    <div class="flex flex-col transition-all max-h-[20000px]" :class="{'!max-h-0': !betsExpanded}">
      <Bet v-for="(bet, index) in accumulator.bets" :bet="bet" :key="bet.id" :leg="index + 1"/>
    </div>
  </div>
</template>