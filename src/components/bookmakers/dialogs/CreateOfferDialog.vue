<script setup lang="ts">
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {computed, ref} from "vue";
import {toTypedSchema} from "@vee-validate/zod";
import {useForm, Field as FormField} from "vee-validate";
import {z} from "zod";
import {FormControl, FormDescription, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from "@/components/ui/number-field";
import {supabase} from "@/lib/supabaseClient.ts";
import type {Tables} from "@/types/database/database.types.ts";
import {Textarea} from "@/components/ui/textarea";
import DateButton from "@/components/form/DateButton.vue";
import {type OfferWithBetsAndMatches} from "@/types/queries/queries.types";
import {raiseErrorToast, raiseSuccessToast} from "@/lib/utils";

interface Props {
  open: boolean
  bookmaker: Tables<'bookmakers'>
}

interface Emits {
  (event: "update:open", value: boolean): void;

  (event: "created", value: OfferWithBetsAndMatches): void;
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const loading = ref(false)

const submitBtn = ref()

const _open = computed({
  get() {
    return props.open
  },
  set() {
    emit('update:open', false)
  }
})

const formSchema = toTypedSchema(z.object({
  description: z.string().min(1),
  terms_and_conditions: z.string().min(1),
  qualifying_bet_amount: z.number().min(0),
  free_bet_amount: z.number().min(0),
  started_date: z.string().optional(),
  expires_in_days: z.number().min(1).optional()
}))

const form = useForm({
  validationSchema: formSchema,
})

const startedDate = computed(() => {
  return form.values.started_date
})

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true

  const {data, error} = await supabase.from('bookmaker_offers').insert({
    ...values,
    bookmaker_id: props.bookmaker.id,
  }).select(`
    *,
    bets (
      *,
      matches (
        *
      ),
      accumulators (
        *
      )
    )
  `)

  if (error) {
    raiseErrorToast(error, 'Failed to create offer')
  } else if (data) {
    raiseSuccessToast('Offer created')
    emit('created', data[0])
    _open.value = false
  }

  loading.value = false
})
</script>

<template>
  <Dialog v-model:open="_open">
    <DialogContent :loading="loading"
                   :title="`Add a new ${bookmaker.name} offer`"
                   subtitle="Fill out the form and submit when you're done"
                   @save="submitBtn?.click()">
      <template #body>
        <form @submit="onSubmit" class="flex flex-col gap-6">
          <!-- DESCRIPTION -->
          <FormField v-slot="{ componentField }" name="description" :validateOnBlur="false">
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. Bet £5 get £10" v-bind="componentField"/>
              </FormControl>
              <FormDescription>
                This is the offer description.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- TERMS AND CONDITIONS -->
          <FormField v-slot="{ componentField }" name="terms_and_conditions" :validateOnBlur="false">
            <FormItem>
              <FormLabel>Terms and conditions</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. min qualifying odds 2.0" class="resize-none" v-bind="componentField"/>
              </FormControl>
              <FormDescription>
                The offer t&cs.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- QUALIFYING BET AMOUNT -->
          <FormField v-slot="{ value }" name="qualifying_bet_amount" :validateOnBlur="false">
            <FormItem>
              <FormLabel>Qualifying bet amount</FormLabel>
              <NumberField :min="0.00"
                           :defaultValue="0.00"
                           :formatOptions="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                           :modelValue="value"
                           :stepSnapping="false"
                           :required="true"
                           @update:modelValue="(val) => {
                           if(val) {
                              form.setFieldValue('qualifying_bet_amount', val)
                           } else {
                              form.setFieldValue('qualifying_bet_amount', 0.00)
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
              <FormDescription>
                The qualifying bet amount
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- FREE BET AMOUNT -->
          <FormField v-slot="{ value }" name="free_bet_amount" :validateOnBlur="false">
            <FormItem>
              <FormLabel>Free bet amount</FormLabel>
              <NumberField :min="0.00"
                           :defaultValue="0.00"
                           :formatOptions="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                           :modelValue="value"
                           :stepSnapping="false"
                           :required="true"
                           @update:modelValue="(val) => {
                           if(val) {
                              form.setFieldValue('free_bet_amount', val)
                           } else {
                              form.setFieldValue('free_bet_amount', 0.00)
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
              <FormDescription>
                The free bet amount that is rewarded upon qualification
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- STARTED DATE -->
          <FormField v-slot="{componentField, errors}" name="started_date">
            <FormItem class="flex flex-col">
              <FormLabel>Start date (optional)</FormLabel>
              <DateButton :date="startedDate" v-bind="componentField" :error="!!errors.length"/>
              <FormDescription>
                The date that you signed up for the offer
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- EXPIRES IN DAYS -->
          <FormField v-slot="{ value }" name="expires_in_days" :validateOnBlur="false">
            <FormItem>
              <FormLabel>Valid for (days)</FormLabel>
              <NumberField :min="1"
                           :modelValue="value"
                           :required="false"
                           @update:modelValue="(val) => {
                               if(val) {
                                  form.setFieldValue('expires_in_days', val)
                               } else {
                                  form.setFieldValue('expires_in_days', undefined)
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
              <FormDescription>
                The amount of days the offer is valid for
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- HIDDEN SUBMIT BTN -->
          <button ref="submitBtn" type="submit" class="hidden"/>
        </form>
      </template>
    </DialogContent>
  </Dialog>
</template>