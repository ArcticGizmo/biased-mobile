<template>
  <PickerInput
    :class="{ 'ion-touched': meta.touched, 'ion-invalid': errorMessage }"
    :name="name"
    :model-value="value"
    :options="options"
    :label="label"
    label-placement="stacked"
    fill="outline"
    @update:model-value="onChange"
  />
</template>

<script setup lang="ts">
import { PickerColumnOption } from '@ionic/vue';
import PickerInput from '../PickerInput.vue';
import { useField } from 'vee-validate';

const props = defineProps<{ name: string; label?: string; options: PickerColumnOption[] }>();

const { value, errorMessage, meta, handleChange, handleBlur } = useField<string | number>(() => props.name);

const onChange = (value: string | number) => {
  handleChange(value);
  handleBlur();
};
</script>
