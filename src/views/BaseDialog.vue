<template>
  <div class="dialog-base" :style="{ justifyContent }" @click="onClick()">
    <div class="content w-full" :style="{ maxWidth }" @click.stop>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DialogProps {
  maxWidth?: string;
  justifyContent?: 'center' | 'flex-start' | 'flex-end';
}

withDefaults(defineProps<DialogProps>(), {
  maxWidth: '500px'
});

const emits = defineEmits<{
  (e: 'backdrop'): void;
}>();

const onClick = () => {
  emits('backdrop');
};
</script>

<style scoped>
.dialog-base {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
