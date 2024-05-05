<template>
  <IonAccordionGroup :value="`${show}`">
    <IonAccordion value="true">
      <div slot="content">
        <slot slot="content"></slot>
      </div>
    </IonAccordion>
  </IonAccordionGroup>
</template>

<script setup lang="ts">
import { IonAccordion, IonAccordionGroup } from '@ionic/vue';
defineProps<{ show: boolean }>();
</script>
