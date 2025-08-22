<script setup lang="ts">
import type {BetWithMatches} from "@/types/queries/queries.types.ts";
import {capitalise, raiseErrorToast, raiseSuccessToast} from "@/lib/utils.ts";
import {Button} from "@/components/ui/button";
import SvgIcon from "@/components/icons/SvgIcon.vue";
import {mdiCheck, mdiPencil} from "@mdi/js";
import {supabase} from "@/lib/supabaseClient";
import {Badge} from "@/components/ui/badge";
import BetCategoryBadge from "@/components/bookmakers/BetCategoryBadge.vue";
import {computed, onMounted, ref} from "vue";
import {useBalanceStore} from "@/stores/balances";

interface Props {
  bet: BetWithMatches,
  leg?: number
}

interface Emits {
  (event: "toggleSettled" | "edit", value: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const {increment} = useBalanceStore()

const profit = ref<number | null>(null)

function getTime(dateStr: string) {
  const match = dateStr.match(/T([0-9:]+)\+/)

  if (match?.length) return match[1].replace(/:00$/, "")
}

async function markAsSettled() {
  const {error} = await supabase.from('bets').update({settled: !props.bet.settled}).eq('id', props.bet.id)

  if (!error) {
    raiseSuccessToast(props.bet.settled ? "Bet marked as unsettled" : "Bet marked as settled")
    emit("toggleSettled", !props.bet.settled)
  } else {
    raiseErrorToast(error, "Failed to mark bet as settled")
  }
}

onMounted(() => {
  if (props.bet.back_stake && props.bet.back_odds && props.bet.liability) {
    const total = Number(((props.bet.back_stake * props.bet.back_odds) - props.bet.back_stake - props.bet.liability).toFixed(2))
    profit.value = total

    increment(total, 'profit')
  }
})
</script>

<template>
  <div class="flex w-full items-center justify-between border-t-1 border-border py-5 px-6">
    <div class="flex items-center gap-3">
      <BetCategoryBadge v-if="!bet.accumulator_id" :betCategory="bet.bet_category"/>
      <Badge v-else-if="leg" variant="outline" class="w-fit min-w-[100px] bg-secondary">Leg {{ leg }}</Badge>
      <Badge variant="outline">{{ capitalise(bet.outcome) }}</Badge>
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <small>{{ bet.matches.home_team }} v {{ bet.matches.away_team }}</small>
          <small class="text-secondary-foreground/50">
            {{ new Date(bet.matches.match_date).toDateString() }} {{ getTime(bet.matches.match_date) }}
          </small>
        </div>
        <div v-if="!bet.accumulator_id" class="flex gap-3">
          <small>
            <span class="text-secondary-foreground/50">Back bet:</span> £{{ bet.back_stake }} @ {{ bet.back_odds }}
          </small>
          <small>
            <span class="text-secondary-foreground/50">Lay bet:</span> £{{ bet.lay_stake }} @ {{ bet.lay_odds }}
          </small>
          <small>
            <span class="text-secondary-foreground/50">Liability:</span> £{{ bet.liability }}
          </small>
          <small>
            <span class="text-secondary-foreground/50">Profit:</span> £{{ profit }}
          </small>
          <SvgIcon :path="mdiPencil" :size="16" class="cursor-pointer text-secondary-foreground/50"
                   @click="emit('edit', true)"/>

        </div>
      </div>
    </div>
    <div v-if="!bet.accumulator_id" class="flex items-center gap-5 h-full">
      <Button variant="outline" size="icon"
              @click="markAsSettled"
              class="border rounded-full w-[20px] h-[20px]"
              :class="{'!border-primary/50 !bg-primary/10': bet.settled}">
        <SvgIcon v-if="bet.settled" :path="mdiCheck" class="text-primary"/>
      </Button>
    </div>
  </div>
</template>