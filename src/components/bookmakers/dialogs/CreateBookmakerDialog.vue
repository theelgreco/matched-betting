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
import {raiseErrorToast, raiseSuccessToast} from "@/lib/utils";
import {type BookmakerWithOffersBetsAndMatches} from "@/types/queries/queries.types";

interface Props {
  open: boolean
}

interface Emits {
  (event: "update:open", value: boolean): void;

  (event: "created", value: BookmakerWithOffersBetsAndMatches): void;
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
  name: z.string().min(2).max(50),
  url: z.string().url(),
  logo: z.string().url(),
  initial_balance: z.number().min(0).optional()
}))

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit(async (values) => {
  loading.value = true

  const {data, error} = await supabase.from('bookmakers').insert(values).select(`
    *,
    bookmaker_offers (
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
    )
  `)

  if (error) {
    raiseErrorToast(error, 'Failed to create bookmaker')
  } else if (data) {
    raiseSuccessToast('Bookmaker created')
    emit('created', data[0])
    _open.value = false
  }

  loading.value = false
})
</script>

<template>
  <Dialog v-model:open="_open">
    <DialogContent :loading="loading" title="Add a new bookmaker" @save="submitBtn?.click()">
      <template #body>
        <form ref="formRef" @submit="onSubmit" class="flex flex-col gap-6">
          <!-- USERNAME -->
          <FormField v-slot="{ componentField }" name="name" :validateOnBlur="false">
            <FormItem>
              <FormLabel>Bookmaker</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. Coral" v-bind="componentField"/>
              </FormControl>
              <FormDescription>
                This is the name of the bookmaker.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- URL -->
          <FormField v-slot="{ componentField }" name="url" :validateOnBlur="false">
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. https://www.example.com" v-bind="componentField"/>
              </FormControl>
              <FormDescription>
                The URL to the bookmaker's website.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- LOGO -->
          <FormField v-slot="{ componentField }" name="logo" :validateOnBlur="false">
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. https://www.example.com/image.png" v-bind="componentField"/>
              </FormControl>
              <FormDescription>
                A logo to help you easily identify the bookmaker.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <!-- INITIAL BALANCE -->
          <FormField v-slot="{ value }"
                     name="initial_balance"
                     :validateOnBlur="false">
            <FormItem>
              <FormLabel>Initial balance</FormLabel>
              <NumberField :min="0.00"
                           :defaultValue="0.00"
                           :formatOptions="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
                           :modelValue="value"
                           :stepSnapping="false"
                           :required="true"
                           @update:modelValue="(val) => {
                           if(val) {
                              form.setFieldValue('initial_balance', val)
                           } else {
                              form.setFieldValue('initial_balance', 0.00)
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
                How much you are depositing.
              </FormDescription>
              <FormMessage/>
            </FormItem>
          </FormField>
          <button ref="submitBtn" type="submit" class="hidden"/>
        </form>
      </template>
    </DialogContent>
  </Dialog>
</template>