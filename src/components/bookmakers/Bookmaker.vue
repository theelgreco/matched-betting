<script setup lang="ts">
import {ref} from 'vue'
import BookmakerMenu from "@/components/bookmakers/menus/BookmakerMenu.vue";
import {
  type BetWithMatches,
  type BookmakerWithOffersBetsAndMatches,
  type OfferWithBetsAndMatches
} from "@/types/queries/queries.types.ts";
import Bet from "@/components/bookmakers/Bet.vue";
import CreateBetDialog from "@/components/bookmakers/dialogs/CreateBetDialog.vue";
import BookmakerOfferMenu from "@/components/bookmakers/menus/BookmakerOfferMenu.vue";
import {addDays, formatDistance} from "date-fns";
import Accumulator from "@/components/bookmakers/Accumulator.vue";

interface Props {
  bookmaker: BookmakerWithOffersBetsAndMatches
}

const props = defineProps<Props>()

const dialogs = ref({
  createBetDialog: false,
  editBetDialog: false
})

const selectedOffer = ref<OfferWithBetsAndMatches>()

const selectedBet = ref<BetWithMatches>()

function settledBets(offer: OfferWithBetsAndMatches) {
  const betCount = offer.bets.length
  const accaCount = offer.accumulators.length

  const settledBetCount = offer.bets.filter(el => el.settled).length
  const settledAccaCount = offer.accumulators.filter(el => el.settled).length

  return `${settledBetCount + settledAccaCount}/${betCount + accaCount} bets settled`
}

function getExpiredString(startedDate: string, expires: number) {
  const str = formatDistance(addDays(new Date(startedDate), expires), new Date(), {
    addSuffix: true,
  })

  return str.includes('in') ? `Expires ${str}` : `Expired ${str}`
}

function replaceBet(bet: BetWithMatches) {
  if (!selectedOffer.value) return

  let indexToReplace = selectedOffer.value.bets.findIndex(el => el.id === bet.id)

  if (indexToReplace > -1) {
    selectedOffer.value.bets.splice(indexToReplace, 1, bet)
  }
}
</script>

<template>
  <div class="flex flex-col border rounded w-full bg-card">
    <!-- BOOKMAKER DETAILS -->
    <div class="flex flex-col p-6 gap-3">
      <div class="flex justify-between">
        <a :href="bookmaker.url" rel="noopener" target="_blank">
          <img :alt="bookmaker.name" :src="bookmaker.logo" class="h-[35px] max-h-[35px]"/>
        </a>
        <BookmakerMenu :bookmaker="bookmaker"/>
      </div>
      <small class="text-secondary-foreground/50">Created {{ new Date(bookmaker.created_at).toDateString() }}</small>
    </div>
    <!-- BOOKMAKER OFFERS -->
    <div v-if="bookmaker.bookmaker_offers" class="flex flex-col">
      <div v-for="offer in bookmaker.bookmaker_offers" class="flex flex-col rounded">
        <!-- HEADER -->
        <div class="flex items-center justify-between px-6 py-3 bg-secondary/50 border-t-1 border-border">
          <div class="flex items-center gap-3">
            <small class="text-secondary-foreground/70">{{ offer.description }}</small>
            <p class="text-muted-foreground/40">|</p>
            <small v-if="offer.started_date && offer.expires_in_days" class="whitespace-pre-line text-muted-foreground">
              {{ getExpiredString(offer.started_date, offer.expires_in_days) }}
            </small>
          </div>
          <div class="flex items-center">
            <small class="text-primary mr-8 font-medium">{{ settledBets(offer) }}</small>
            <BookmakerOfferMenu :offer="offer" @createBet="selectedOffer = offer; dialogs.createBetDialog = true"/>
          </div>
        </div>
        <!-- BETS -->
        <div v-if="offer.bets.length || offer.accumulators.length" class="flex flex-col">
          <template v-if="offer.bets.length">
            <Bet v-for="bet in offer.bets"
                 :key="bet.id"
                 :bet="bet"
                 @toggleSettled="value => bet.settled = value"
                 @edit="selectedBet = bet; selectedOffer = offer; dialogs.editBetDialog = true"/>
          </template>
          <template v-if="offer.accumulators.length">
            <Accumulator v-for="accumulator in offer.accumulators"
                         :key="accumulator.id"
                         :accumulator="accumulator"
                         @toggleSettled="value => accumulator.settled = value"/>
          </template>
        </div>
        <!-- NO BETS -->
        <div v-else-if="!offer.bets.length && !offer.accumulators.length" class="grid place-items-center p-6">
          <p class="text-secondary-foreground/50">No bets added yet</p>
        </div>
      </div>
    </div>
    <!-- NO OFFERS -->
    <div v-else class="grid place-items-center border-t border-border p-6">
      <p class="text-secondary-foreground/50">No offers yet</p>
    </div>
    <!-- DIALOGS -->
    <CreateBetDialog v-if="dialogs.createBetDialog && selectedOffer"
                     :offer="selectedOffer"
                     v-model:open="dialogs.createBetDialog"
                     @created="value => selectedOffer?.bets.push(value)"/>
    <CreateBetDialog v-if="dialogs.editBetDialog && selectedOffer && selectedBet"
                     :offer="selectedOffer"
                     :isEditing="true"
                     :bet="selectedBet"
                     v-model:open="dialogs.editBetDialog"
                     @created="(value: BetWithMatches) => {
                       replaceBet(value); selectedOffer = undefined; selectedBet = undefined
                     }"/>
  </div>
</template>