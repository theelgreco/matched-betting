<script setup lang="ts">
import {mdiPlus} from "@mdi/js";
import {Button} from "@/components/ui/button";
import CreateBookmakerDialog from "@/components/bookmakers/dialogs/CreateBookmakerDialog.vue";
import Bookmaker from "@/components/bookmakers/Bookmaker.vue";
import SvgIcon from "@/components/icons/SvgIcon.vue";
import {onMounted, ref} from "vue";
import {supabase} from "@/lib/supabaseClient.ts";
import {type BookmakerWithOffersBetsAndMatches} from "@/types/queries/queries.types";

const bookmakers = ref<BookmakerWithOffersBetsAndMatches[]>()

const dialogs = ref<{ [key: string]: boolean }>({
  createBookmakerDialog: false,
})

async function addBookmakerToArray(bookmaker: BookmakerWithOffersBetsAndMatches) {
  if (bookmakers.value?.length) {
    bookmakers.value.unshift(bookmaker)
  } else {
    bookmakers.value = [bookmaker]
  }
}

async function getBookmakers() {
  const {data} = await supabase.from('bookmakers').select(`
    *,
    bookmaker_offers (
      *,
      accumulators (
        *,
        bets (
          *,
          matches (
            *
          )
        )
      ),
      bets (
        *,
        matches (
          *
        )
      )
    )
  `).order('created_at', {ascending: false}).is('bookmaker_offers.bets.accumulator_id', null);

  if (data?.length) {
    bookmakers.value = data

    bookmakers.value.forEach((bookmaker) => {
      bookmaker.bookmaker_offers.forEach((offer) => {
        offer.bets.sort((a, b) => {
          return a.bet_category === "QUALIFYING" ? -1 : 1
        })
        offer.accumulators.sort((a, b) => {
          return a.bet_category === "QUALIFYING" ? -1 : 1
        })
      })
    })
  }
}

onMounted(() => {
  getBookmakers()
})
</script>

<template>
  <div class="w-full max-w-full flex flex-col justify-center">
    <div class="flex justify-between items-center p-6">
      <h1 class="w-fit font-bold text-4xl mb-3">Bookmakers</h1>
      <!-- ADD BOOKMAKER BUTTON -->
      <Button size="lg" class="w-fit" @click="dialogs.createBookmakerDialog = true">
        <SvgIcon :path="mdiPlus"/>
        <p>Add bookmaker</p>
      </Button>
    </div>
    <!-- RESULTS -->
    <div class="flex flex-col gap-10 px-6 overflow-hidden">
      <template v-if="bookmakers">
        <Bookmaker v-for="bookmaker in bookmakers" :key="bookmaker.id" :bookmaker="bookmaker"/>
      </template>
      <!-- NO RESULTS -->
      <div v-else class="p-10 text-secondary-foreground grid place-items-center border border-border">
        No bookmakers found
      </div>
    </div>
    <!-- DIALOGS -->
    <CreateBookmakerDialog v-model:open="dialogs.createBookmakerDialog" :modal="true" @created="addBookmakerToArray"/>
  </div>
</template>