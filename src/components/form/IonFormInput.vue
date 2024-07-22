<template>
  <IonInput
    :class="{ 'ion-touched': meta.touched, 'ion-invalid': errorMessage }"
    :name="name"
    :value="value"
    :label="label"
    mode="md"
    label-placement="stacked"
    fill="outline"
    inputmode="text"
    :error-text="errorMessage"
    @ion-change="handleChange"
    @ion-blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { IonInput } from '@ionic/vue';
import { useField } from 'vee-validate';

const props = defineProps<{ name: string; label?: string }>();

const { value, errorMessage, meta, handleChange, handleBlur } = useField<string>(() => props.name);
</script>
