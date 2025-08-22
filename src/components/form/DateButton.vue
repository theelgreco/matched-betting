<script setup lang="ts">
import {mdiCalendar} from "@mdi/js";
import type {DateValue} from "reka-ui";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {FormControl} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import SvgIcon from "@/components/icons/SvgIcon.vue";
import {computed, ref} from "vue"
import {parseDate} from "@internationalized/date"

interface Props {
  date?: string
  error: boolean
  required?: boolean
}

interface Emits {
  (event: "update:modelValue", value: string | undefined): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const _date = ref<DateValue>()

const calendarPlaceholder = computed(() => {
  if (props.date) {
    return new Date(props.date).toDateString()
  }

  return "Pick a date"
})
</script>

<template>
  <Popover>
    <FormControl>
      <PopoverTrigger as-child>
        <Button variant="outline"
                class="'w-full flex-grow ps-3 text-start font-normal'"
                :class="{'text-muted-foreground': !date, '!border-red-500/50': error}">
          <span>{{ calendarPlaceholder }}</span>
          <SvgIcon :path="mdiCalendar" class="ms-auto h-4 w-4 opacity-50"/>
        </Button>
      </PopoverTrigger>
    </FormControl>
    <PopoverContent class="w-auto p-0">
      <Calendar
          v-model="_date"
          :defaultValue="required && date ? parseDate(date) : undefined"
          calendarLabel="Start date"
          @update:modelValue="(v: DateValue | undefined) => {
              if (v) {
                emit('update:modelValue', v.toString())
              } else {
                emit('update:modelValue', undefined)
              }
          }"
      />
    </PopoverContent>
  </Popover>
</template>