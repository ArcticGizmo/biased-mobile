<template>
  <IonInput
    v-bind="attrs"
    :model-value="model"
    :label="label"
    :name="name"
    :mode="fill ? 'md' : undefined"
    :fill="fill"
    :label-placement="labelPlacement"
    :disabled="isOpen"
    @click.capture="onOpen()"
  />
</template>

<script setup lang="ts">
import { IonInput, PickerColumnOption, pickerController } from '@ionic/vue';
import { useAttrs, ref } from 'vue';

const model = defineModel<string | number>({ required: true });

const props = defineProps<{
  name?: string;
  options: PickerColumnOption[];
  label?: string;
  fill?: 'outline' | 'solid';
  labelPlacement?: 'start' | 'end' | 'floating' | 'stacked' | 'fixed';
  placeholder?: string;
}>();

const attrs = useAttrs();
const isOpen = ref(false);

const onOpen = async () => {
  if (isOpen.value) {
    return;
  }
  isOpen.value = true;

  const selectedIndex = props.options.findIndex(o => o.value == model.value);
  const picker = await pickerController.create({
    showBackdrop: true,
    keyboardClose: true,
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
  picker.present();

  const resp = await picker.onDidDismiss();

  if (resp.role === 'ok') {
    model.value = resp.data.value.value;
  }

  isOpen.value = false;
};
</script>
