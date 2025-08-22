<script setup lang="ts">
import {mdiCalendar} from "@mdi/js";
import type {DateValue} from "reka-ui";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {FormControl} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import SvgIcon from "@/components/icons/SvgIcon.vue";
import {computed, ref, onMounted} from "vue"
import {parseDate} from "@internationalized/date"
import {Input} from "@/components/ui/input";

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

const _hour = ref<string>()

const _minute = ref<string>()

const calendarPlaceholder = computed(() => {
  if (props.date) {
    return new Date(props.date.substring(0, 10)).toDateString()
  }

  return "Pick a date"
})

function updateDateTime() {
  let date: Date | undefined = undefined

  let parsedHour = _hour.value === undefined || _hour.value === "" ? 0 : parseInt(_hour.value)
  let parsedMinute = _minute.value === undefined || _minute.value === "" ? 0 : parseInt(_minute.value)

  if (parsedHour < 0) {
    _hour.value = "00"
    parsedHour = 0
  } else if (parsedHour < 10) {
    _hour.value = `0${parsedHour}`
  } else if (parsedHour > 23) {
    _hour.value = "23"
    parsedHour = 23
  }

  if (parsedMinute < 0) {
    _minute.value = "00"
    parsedMinute = 0
  } else if (parsedMinute < 10) {
    _minute.value = `0${parsedMinute}`
  } else if (parsedMinute > 59) {
    _minute.value = "59"
    parsedMinute = 59
  }

  if (_date.value) {
    date = new Date(_date.value.toString())
    date.setHours(parsedHour + 1)
    date.setMinutes(parsedMinute)
  }

  emit("update:modelValue", date?.toISOString())
}

onMounted(() => {
  if (props.date) {
    const d = new Date(props.date)
    _date.value = parseDate(props.date.replace(/T.*$/, ""))
    _hour.value = d.getHours().toString()
    _minute.value = d.getMinutes().toString()
  }
})
</script>

<template>
  <Popover>
    <FormControl>
      <div class="flex w-full gap-1">
        <PopoverTrigger as-child>

          <Button variant="outline"
                  class="'w-full flex-grow ps-3 text-start font-normal'"
                  :class="{'text-muted-foreground': !date, '!border-red-500/50': error}">
            <span>{{ calendarPlaceholder }}</span>
            <SvgIcon :path="mdiCalendar" class="ms-auto h-4 w-4 opacity-50"/>
          </Button>
        </PopoverTrigger>
        <Input v-model="_hour"
               type="number"
               class="w-[90px]"
               placeholder="hour"
               :min="0"
               :max="23"
               :disabled="!date"
               @change="updateDateTime()"/>
        <Input v-model="_minute"
               type="number"
               class="w-[90px]"
               placeholder="minute"
               :min="0"
               :max="59"
               :disabled="!date"
               @change="updateDateTime()"/>
      </div>
    </FormControl>
    <PopoverContent class="w-auto p-0">
      <Calendar
          v-model="_date"
          :defaultValue="required && date ? parseDate(date) : undefined"
          calendarLabel="Start date"
          @update:modelValue="updateDateTime()"
      />
    </PopoverContent>
  </Popover>
</template>