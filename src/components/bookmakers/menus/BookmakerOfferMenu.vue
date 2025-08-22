<script setup lang="ts">
import {mdiDotsVertical, mdiPlus} from "@mdi/js";
import {Button} from "@/components/ui/button";
import SvgIcon from "@/components/icons/SvgIcon.vue";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {type OfferWithBetsAndMatches} from "@/types/queries/queries.types";

interface Props {
  offer: OfferWithBetsAndMatches
}

interface Emits {
  (event: 'createBet'): void
}

defineProps<Props>()

const emit = defineEmits<Emits>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="icon">
        <SvgIcon :path="mdiDotsVertical"/>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent :align="'end'">
      <DropdownMenuItem @click="emit('createBet')">
        <div class="flex items-center gap-2">
          <SvgIcon :path="mdiPlus"/>
          <p>Add bet</p>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>