<template>
  <BaseModal title="Filters" max-width="500px">
    <template #header>
      <IonButtons slot="start">
        <IonButton @click="onClose()">
          <IonIcon :icon="arrowBack" slot="icon-only" />
        </IonButton>
      </IonButtons>
      <IonButtons class="mr-4" slot="end">
        <IonButton color="danger" @click="onReset()"> Reset </IonButton>
      </IonButtons>
      <IonTitle class="text-center">Filters</IonTitle>
    </template>
    <div class="p-4">
      <template v-for="section of filterSections" :key="section.name">
        <div v-if="section.options.length > 1" class="mb-5">
          <span class="p-0 pl-1 mb-1 text-xl">{{ section.name }}</span>
          <div class="divider"></div>
          <div class="options">
            <FilterItem
              v-for="(option, index) of section.options"
              :key="index"
              :model-value="section.values.includes(option)"
              :text="option"
              @changed="toggleValue(section, option, $event)"
            />
          </div>
        </div>
      </template>
    </div>
    <template #footer>
      <IonButton class="mx-3" expand="block" @click="onApply()">Apply</IonButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { KPopCard } from '@/types';
import BaseModal from '@/views/BaseModal.vue';
import { IonTitle, IonButtons, IonButton, IonIcon, modalController, onIonViewWillEnter } from '@ionic/vue';
import { arrowBack } from 'ionicons/icons';
import FilterItem from './FilterItem.vue';
import { onMounted, reactive, ref } from 'vue';

interface FilterSection {
  name: string;
  key: string;
  values: string[];
  options: string[];
}

export interface Filter {
  key: string;
  values: string[];
}

const props = defineProps<{ cards: KPopCard[]; activeFilters?: Filter[] }>();

const filterSections = ref<FilterSection[]>([]);

const createFilterSection = (name: string, key: string) => {
  const rawOptions = props.cards.map(c => (c as any)[key]).filter(c => c != null);
  const options = [...new Set(rawOptions)];
  options.sort((a, b) => a.localeCompare(b));

  return reactive({ name, key, values: [], options });
};

const onReset = (useInitial = false) => {
  const oldFilters = props.activeFilters || [];

  const sections: FilterSection[] = [
    createFilterSection('Artist', 'artist'),
    createFilterSection('Group', 'groupName'),
    createFilterSection('Album', 'whereFromName'),
    createFilterSection('Year', 'year')
  ];

  if (useInitial) {
    for (const old of oldFilters) {
      const match = sections.find(s => s.key === old.key);
      if (match) {
        match.values = [...old.values];
      }
    }
  }

  filterSections.value = sections;
};

onMounted(() => {
  onReset(true);
});

onIonViewWillEnter(() => {
  onReset(true);
});

const onClose = () => {
  modalController.dismiss(undefined, 'cancelled');
};

const toggleValue = (section: FilterSection, option: string, add: boolean) => {
  if (add) {
    section.values.push(option);
  } else {
    section.values = section.values.filter(v => v !== option);
  }
};

const onApply = () => {
  const filterRequests: Filter[] = filterSections.value
    .filter(f => f.options.length > 1 && f.values.length > 0)
    .map(f => {
      return {
        key: f.key,
        values: f.values
      };
    });

  modalController.dismiss(filterRequests, 'accept');
};
</script>
