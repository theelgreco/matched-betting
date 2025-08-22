import {supabase} from "@/lib/supabaseClient.ts";
import type {QueryData} from "@supabase/supabase-js";

const bookmakerWithOffersBetsAndMatches = supabase.from('bookmakers').select(`
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
  `).single()

const offerWithBetsAndMatches = supabase.from('bookmaker_offers').select(`
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
  `).single()

const betWithMatches = supabase.from('bets').select(`
     *,
     matches (
       *
     )
   `).single()

const accumulatorWithBetsAndMatches = supabase.from('accumulators').select(`
    *,
    bets (
      *,
      matches (
        *
      )
    )
`).single()

export type OfferWithBetsAndMatches = QueryData<typeof offerWithBetsAndMatches>

export type BetWithMatches = QueryData<typeof betWithMatches>

export type BookmakerWithOffersBetsAndMatches = QueryData<typeof bookmakerWithOffersBetsAndMatches>

export type AccumulatorWithBetsAndMatches = QueryData<typeof accumulatorWithBetsAndMatches>