<template>
  <IonInput v-bind="attrs" :model-value="model" :label="label" :fill="fill" :label-placement="labelPlacement" @click="onOpen()" />

  <ion-button id="open-picker">Open</ion-button>
  <ion-picker trigger="open-picker" :columns="pickerColumns" :buttons="pickerButtons"></ion-picker>

  <div v-if="isOpen" class="generic-overlay">
    <div class="overlay-content">
      <div class="datetime-wrapper py-4">
        <IonDatetime v-model="tempValue" presentation="year" />

        <div class="flex justify-end pr-4">
          <IonButton fill="clear" @click="onCancel()">cancel</IonButton>
          <IonButton @click="onOk()">ok</IonButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonDatetime, IonInput, IonPicker } from '@ionic/vue';
import { ref, useAttrs } from 'vue';

const model = defineModel<string>({ required: true });

const tempValue = ref('');

defineProps<{
  label?: string;
  fill?: 'outline' | 'solid';
  labelPlacement?: 'start' | 'end' | 'floating' | 'stacked' | 'fixed';
  placeholder?: string;
}>();

const pickerColumns = [
  {
    name: 'languages',
    options: [
      {
        text: 'JavaScript',
        value: 'javascript'
      },
      {
        text: 'TypeScript',
        value: 'typescript'
      },
      {
        text: 'Rust',
        value: 'rust'
      },
      {
        text: 'C#',
        value: 'c#'
      }
    ]
  }
];

const pickerButtons = [
  {
    text: 'Cancel',
    role: 'cancel'
  },
  {
    text: 'Confirm',
    handler: (value: any) => {
      console.log(`You selected: ${value.languages.value}`);
    }
  }
];

const attrs = useAttrs();

const isOpen = ref(false);

const onOpen = () => {
  tempValue.value = model.value;
  isOpen.value = true;
};

const onCancel = () => {
  isOpen.value = false;
};

const onOk = () => {
  isOpen.value = false;
  model.value = tempValue.value;
};
</script>

<style scoped>
.generic-overlay {
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  background-color: #9c9c9c;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.datetime-wrapper {
  min-width: 20rem;
  min-height: 10rem;
  background-color: white;
  border-radius: 1rem;
}
</style>
