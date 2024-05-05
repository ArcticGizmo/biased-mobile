<template>
  <IonInput v-bind="attrs" :model-value="model" :label="label" :fill="fill" :label-placement="labelPlacement" @click.prevent="onOpen()" />
</template>

<script setup lang="ts">
import { IonInput, PickerColumnOption, pickerController } from '@ionic/vue';
import { useAttrs } from 'vue';

const model = defineModel<string | number>({ required: true });

const props = defineProps<{
  options: PickerColumnOption[];
  label?: string;
  fill?: 'outline' | 'solid';
  labelPlacement?: 'start' | 'end' | 'floating' | 'stacked' | 'fixed';
  placeholder?: string;
}>();

const attrs = useAttrs();

const onOpen = async () => {
  const selectedIndex = props.options.findIndex(o => o.value == model.value);
  const picker = await pickerController.create({
    columns: [{ name: 'value', options: props.options, selectedIndex }],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Confirm',
        role: 'ok'
      }
    ]
  });
  await picker.present();

  const resp = await picker.onDidDismiss();

  if (resp.role === 'ok') {
    model.value = resp.data.value.value;
  }
};
</script>
