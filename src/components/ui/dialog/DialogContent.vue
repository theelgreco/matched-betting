<script setup lang="ts">
import {cn, onInteractOutsideDialog} from '@/lib/utils'
import {X} from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import {computed, type HTMLAttributes} from 'vue'
import DialogOverlay from './DialogOverlay.vue'
import {DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog/index.ts";
import {Button} from "@/components/ui/button";

const props = withDefaults(defineProps<DialogContentProps & {
  class?: HTMLAttributes['class']
  loading?: boolean
  title?: string
  subtitle?: string
  cancelButtonText?: string
  saveButtonText?: string
  def?: boolean
}>(), {
  title: "Title",
  subtitle: "Fill out the form and submit when you're done",
  cancelButtonText: "Cancel",
  saveButtonText: "Save",
  def: true
})
const emits = defineEmits<DialogContentEmits & {
  save: [event: { value: boolean }]
}>()

const delegatedProps = computed(() => {
  const {class: _, ...delegated} = props

  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay/>
    <DialogContent
        data-slot="dialog-content"
        v-bind="forwarded"
        @interactOutside="(event) => onInteractOutsideDialog(event, loading)"
        :class="
        cn(
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          def && 'bg-background grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]',
          props.class,
        )"
    >
      <slot>
        <DialogClose
            class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <X/>
          <span class="sr-only">Close</span>
        </DialogClose>

        <DialogHeader class="p-6 pb-0">
          <slot name="header">
            <DialogTitle>{{ title }}</DialogTitle>
            <DialogDescription>{{ subtitle }}</DialogDescription>
          </slot>
        </DialogHeader>

        <div class="grid gap-4 p-6 max-h-[500px] overflow-y-auto">
          <slot name="body"/>
        </div>

        <DialogFooter class="p-6 pt-0 flex justify-between w-full">
          <slot name="footer">
            <DialogClose class="mr-auto">
              <Button variant="outline" :disabled="loading">{{ cancelButtonText }}</Button>
            </DialogClose>
            <Button @click="emits('save', {value: true})" :disabled="loading">{{ saveButtonText }}</Button>
          </slot>
        </DialogFooter>
      </slot>

    </DialogContent>
  </DialogPortal>
</template>
