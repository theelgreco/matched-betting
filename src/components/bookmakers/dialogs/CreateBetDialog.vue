<script setup lang="ts">
import type {Tables} from "@/types/database/database.types.ts";
import {computed, ref, onMounted} from 'vue'
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {supabase} from "@/lib/supabaseClient.ts";
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useForm, Field as FormField} from "vee-validate";
import {FormControl, FormDescription, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import DateTimeButton from "@/components/form/DateTimeButton.vue";
import {Input} from "@/components/ui/input";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement, NumberFieldInput
} from "@/components/ui/number-field";
import {Select, SelectItem, SelectGroup, SelectContent, SelectTrigger, SelectValue} from "@/components/ui/select";
import type {BetWithMatches, OfferWithBetsAndMatches} from "@/types/queries/queries.types.ts";
import {raiseErrorToast, raiseSuccessToast} from "@/lib/utils";

// INTERFACES

interface Props {
  open: boolean
  offer: OfferWithBetsAndMatches
  isEditing?: boolean
  bet?: BetWithMatches
}

interface Emits {
  (event: 'update:open', value: boolean): void

  (event: 'created', value: BetWithMatches): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// REFS

const matches = ref<Tables<'matches'>[]>()

const accumulators = ref<Tables<'accumulators'>[]>()

const loading = ref(false)

const submitBtn = ref<HTMLButtonElement>()

// COMPUTED

const _open = computed({
  get() {
    return props.open
  },
  set() {
    emit('update:open', false)
  }
})

// ASYNC FUNCTIONS

async function getMatches() {
  const {data} = await supabase.from("matches").select()

  if (data?.length) {
    matches.value = data
  }
}

async function getAccumulators() {
  const {data} = await supabase
      .from('accumulators')
      .select(`
        *,
        bets (
          id,
          offer_id
        )
      `).eq('bets.offer_id', props.offer.id);

  if (data?.length) {
    accumulators.value = data
  }
}

// FORM DATA

const formSchema = toTypedSchema(z.object({
  match_date: z.string(),
  home_team: z.string(),
  away_team: z.string(),
  back_odds: z.number(),
  lay_odds: z.number(),
  back_stake: z.number(),
  lay_stake: z.number(),
  liability: z.number(),
  outcome: z.enum(["HOME", "DRAW", "AWAY"]),
  bet_category: z.enum(["QUALIFYING", "FREE"])
}))

const form = useForm({
  validationSchema: formSchema
})

const submitEdit = async (values: Required<typeof form.values>) => {
  if (!props.bet) return

  loading.value = true

  const {
    match_date,
    home_team,
    away_team,
    back_odds,
    lay_odds,
    back_stake,
    lay_stake,
    liability,
    outcome,
    bet_category
  } = values

  // Update match details
  const {data: matches, error: matchErr} = await supabase.from('matches').update({
    match_date,
    home_team,
    away_team
  }).eq('id', props.bet.match_id as string).select()

  if (matchErr) {
    raiseErrorToast(matchErr, "Failed to update match details")
    _open.value = false
    return;
  }

  // Update bet details
  const {data, error} = await supabase.from('bets').update({
    back_odds,
    lay_odds,
    back_stake,
    lay_stake,
    liability,
    outcome,
    bet_category,
  }).eq('id', props.bet.id).select(`
      *,
      matches (
        *
      ),
      accumulators (
        *
      )
    `)

  if (error) {
    raiseErrorToast(error, 'Failed to update bet')
  } else if (data) {
    raiseSuccessToast('Bet updated')
    emit('created', data[0])
    _open.value = false
  }

}

const submitCreate = async (values: Required<typeof form.values>) => {
  loading.value = true

  const {
    match_date,
    home_team,
    away_team,
    back_odds,
    lay_odds,
    back_stake,
    lay_stake,
    liability,
    outcome,
    bet_category
  } = values

  const {data: matches} = await supabase.from('matches').insert({match_date, home_team, away_team}).select()

  if (matches) {
    const {data, error} = await supabase.from('bets').insert({
      back_odds,
      lay_odds,
      back_stake,
      lay_stake,
      liability,
      outcome,
      bet_category,
      match_id: matches[0].id,
      offer_id: props.offer.id
    }).select(`
      *,
      matches (
        *
      ),
      accumulators (
        *
      )
    `)

    if (error) {
      raiseErrorToast(error, 'Failed to add bet')
    } else if (data) {
      raiseSuccessToast('bet added')
      emit('created', data[0])
      _open.value = false
    }
  }

  loading.value = false
}

const onSubmit = form.handleSubmit(props.isEditing ? submitEdit : submitCreate)

// LIFECYCLE HOOKS

onMounted(() => {
  if (props.isEditing && props.bet) {
    form.setValues({
      match_date: props.bet.matches.match_date,
      home_team: props.bet.matches.home_team,
      away_team: props.bet.matches.away_team,
      back_odds: props.bet.back_odds as number,
      lay_odds: props.bet.lay_odds as number,
      back_stake: props.bet.back_stake as number,
      lay_stake: props.bet.lay_stake as number,
      liability: props.bet.liability as number,
      outcome: props.bet.outcome,
      bet_category: props.bet.bet_category
    })
  }

  getMatches()
  getAccumulators()
})
</script>

<template>
  <Dialog v-model:open="_open">
    <DialogContent :loading="loading" :title="isEditing ? 'Update this bet' : 'Add a new bet'"
                   @save="submitBtn?.click()">
      <template #body>
        <form @submit="onSubmit" class="flex flex-col gap-10">
          <!-- MATCH DATE -->
          <FormField v-slot="{componentField, errors}" name="match_date">
            <FormItem class="flex flex-col">
              <FormLabel>Match date</FormLabel>
              <DateTimeButton :date="form.values.match_date" v-bind="componentField" :error="!!errors.length"/>
              <FormDescription>
                The date and time of the match
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- TEAM -->
          <div class="flex items-center w-full gap-3">
            <!-- HOME TEAM -->
            <FormField v-slot="{componentField}" name="home_team">
              <FormItem class="w-1/2">
                <FormLabel>Home team</FormLabel>
                <FormControl>
                  <Input type="text" v-bind="componentField" placeholder="e.g. Aston Villa"/>
                </FormControl>
              </FormItem>
            </FormField>
            <div class="grid place-items-center mt-auto h-[40px] font-black text-sm">v</div>
            <!-- AWAY TEAM -->
            <FormField v-slot="{componentField}" name="away_team">
              <FormItem class="w-1/2">
                <FormLabel class="ml-auto">Away team</FormLabel>
                <FormControl>
                  <Input type="text" v-bind="componentField" placeholder="e.g. Paris Saint Germain"/>
                </FormControl>
              </FormItem>
            </FormField>
          </div>
          <!-- BACK BET -->
          <div class="flex items-center w-full gap-7">
            <FormField v-slot="{value}" name="back_stake">
              <FormItem class="w-1/2">
                <FormLabel>Back stake</FormLabel>
                <NumberField :min="0.00"
                             :defaultValue="0.00"
                             :formatOptions="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                             :modelValue="value"
                             :stepSnapping="false"
                             :required="true"
                             @update:modelValue="(val) => {
                               if(val) {
                                  form.setFieldValue('back_stake', val)
                               } else {
                                  form.setFieldValue('back_stake', 0.00)
                               }
                             }">
                  <NumberFieldContent>
                    <NumberFieldDecrement/>
                    <FormControl>
                      <NumberFieldInput/>
                    </FormControl>
                    <NumberFieldIncrement/>
                  </NumberFieldContent>
                </NumberField>
                <FormMessage/>
              </FormItem>
            </FormField>
            <FormField v-slot="{value}" name="back_odds">
              <FormItem class="w-1/2">
                <FormLabel class="w-full [direction:rtl]">Back odds</FormLabel>
                <NumberField :min="0.00"
                             :defaultValue="0.00"
                             :formatOptions="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                             :modelValue="value"
                             :stepSnapping="false"
                             :required="true"
                             @update:modelValue="(val) => {
                           if(val) {
                              form.setFieldValue('back_odds', val)
                           } else {
                              form.setFieldValue('back_odds', 0.00)
                           }
                         }">
                  <NumberFieldContent>
                    <NumberFieldDecrement/>
                    <FormControl>
                      <NumberFieldInput/>
                    </FormControl>
                    <NumberFieldIncrement/>
                  </NumberFieldContent>
                </NumberField>
                <FormMessage/>
              </FormItem>
            </FormField>
          </div>
          <!-- LAY BET -->
          <div class="flex items-center w-full gap-7">
            <FormField v-slot="{value}" name="lay_stake">
              <FormItem class="w-1/2">
                <FormLabel>Lay stake</FormLabel>
                <NumberField :min="0.00"
                             :defaultValue="0.00"
                             :formatOptions="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                             :modelValue="value"
                             :stepSnapping="false"
                             :required="true"
                             @update:modelValue="(val) => {
                           if(val) {
                              form.setFieldValue('lay_stake', val)
                           } else {
                              form.setFieldValue('lay_stake', 0.00)
                           }
                         }">
                  <NumberFieldContent>
                    <NumberFieldDecrement/>
                    <FormControl>
                      <NumberFieldInput/>
                    </FormControl>
                    <NumberFieldIncrement/>
                  </NumberFieldContent>
                </NumberField>
                <FormMessage/>
              </FormItem>
            </FormField>
            <FormField v-slot="{value}" name="lay_odds">
              <FormItem class="w-1/2">
                <FormLabel class="w-full [direction:rtl]">Lay odds</FormLabel>
                <NumberField :min="0.00"
                             :defaultValue="0.00"
                             :formatOptions="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                             :modelValue="value"
                             :stepSnapping="false"
                             :required="true"
                             @update:modelValue="(val) => {
                           if(val) {
                              form.setFieldValue('lay_odds', val)
                           } else {
                              form.setFieldValue('lay_odds', 0.00)
                           }
                         }">
                  <NumberFieldContent>
                    <NumberFieldDecrement/>
                    <FormControl>
                      <NumberFieldInput/>
                    </FormControl>
                    <NumberFieldIncrement/>
                  </NumberFieldContent>
                </NumberField>
                <FormMessage/>
              </FormItem>
            </FormField>
          </div>
          <!-- LIABILITY -->
          <FormField v-slot="{value}" name="liability">
            <FormItem>
              <FormLabel>Liability</FormLabel>
              <NumberField :min="0.00"
                           :defaultValue="0.00"
                           :formatOptions="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                           :modelValue="value"
                           :stepSnapping="false"
                           :required="true"
                           @update:modelValue="(val) => {
                           if(val) {
                              form.setFieldValue('liability', val)
                           } else {
                              form.setFieldValue('liability', 0.00)
                           }
                         }">
                <NumberFieldContent>
                  <NumberFieldDecrement/>
                  <FormControl>
                    <NumberFieldInput/>
                  </FormControl>
                  <NumberFieldIncrement/>
                </NumberFieldContent>
              </NumberField>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- OUTCOME -->
          <FormField v-slot="{ componentField }" name="outcome">
            <FormItem class="w-full">
              <FormLabel>Outcome</FormLabel>
              <Select v-bind="componentField" class="w-full">
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select the outcome"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="HOME">
                      Home
                    </SelectItem>
                    <SelectItem value="DRAW">
                      Draw
                    </SelectItem>
                    <SelectItem value="AWAY">
                      Away
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>
                The outcome that you chose on for the back bet
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- BET CATEGORY -->
          <FormField v-slot="{ componentField }" name="bet_category">
            <FormItem class="w-full">
              <FormLabel>Bet category</FormLabel>
              <Select v-bind="componentField" class="w-full">
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select the category"/>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="QUALIFYING">
                      Qualifying
                    </SelectItem>
                    <SelectItem value="FREE">
                      Free
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>
                Is this a qualifying bet or free bet?
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- HIDDEN SUBMIT BUTTON -->
          <button type="submit" class="hidden" ref="submitBtn"/>
        </form>
      </template>
    </DialogContent>
  </Dialog>
</template>