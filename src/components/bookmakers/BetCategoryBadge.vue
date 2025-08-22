<script setup lang="ts">
import {capitalise} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";

interface Props {
  betCategory: "QUALIFYING" | "FREE"
}

const props = defineProps<Props>()
</script>

<template>
  <Badge class="w-fit min-w-[100px]"
         variant="outline"
         :class="{
           'border-violet-600/30 text-violet-400 bg-violet-900/30': betCategory === 'QUALIFYING',
           'border-green-600/30 text-green-400 bg-green-600/10': betCategory === 'FREE'
         }">
    {{ capitalise(betCategory) }}
  </Badge>
</template>