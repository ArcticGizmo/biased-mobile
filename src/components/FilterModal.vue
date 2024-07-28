<template>
  <BaseModal v-touch:swipe.right="onClose" title="Filters" max-width="500px">
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
      <div class="mb-5">
        <span class="p-0 pl-1 mb-1 text-xl">Sort</span>
        <div class="options">
          <FilterItem
            class="h-8"
            v-for="(option, index) of SORT_OPTIONS"
            :key="index"
            :model-value="option.value === sorter"
            :icon="option.icon"
            :text="option.text"
            @changed="sorter = option.value"
          />
        </div>
      </div>
      <template v-for="section of filterSections" :key="section.name">
        <div v-if="section.options.filter(x => !x.disabled).length" class="mb-5">
          <span class="p-0 pl-1 mb-1 text-xl">{{ section.name }}</span>
          <div class="options">
            <FilterItem
              class="h-8"
              v-for="(option, index) of section.options"
              :key="index"
              :model-value="section.values.includes(option.id)"
              :text="option.text"
              :disabled="option.disabled"
              @changed="toggleValue(section, option.id, $event)"
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
import { TAGS } from '@/types/tags';
import BaseModal from '@/views/BaseModal.vue';
import { IonTitle, IonButtons, IonButton, IonIcon, modalController, onIonViewWillEnter } from '@ionic/vue';
import { arrowBack } from 'ionicons/icons';
import FilterItem from './FilterItem.vue';
import { onMounted, reactive, ref } from 'vue';
import { newToOld, oldToNew, aToZ, zToA } from '@/icons';

interface FilterOption {
  id: string;
  text: string;
  disabled?: boolean;
}

interface FilterSection {
  name: string;
  key: string;
  values: string[];
  options: FilterOption[];
}

export interface Filter {
  key: string;
  values: string[];
}

export type Sorter = 'a-to-z' | 'z-to-a' | 'new-to-old' | 'old-to-new';

interface SortOption {
  value: Sorter;
  icon: string;
  text: string;
}

const SORT_OPTIONS: SortOption[] = [
  {
    value: 'new-to-old',
    text: 'Newest First',
    icon: newToOld
  },
  {
    value: 'old-to-new',
    text: 'Oldest First',
    icon: oldToNew
  },
  {
    value: 'a-to-z',
    text: 'A-Z',
    icon: aToZ
  },
  {
    value: 'z-to-a',
    text: 'Z-A',
    icon: zToA
  }
];

const props = defineProps<{ cards: KPopCard[]; activeFilters?: Filter[]; activeSorter?: Sorter }>();

const sorter = ref<Sorter>('new-to-old');
const filterSections = ref<FilterSection[]>([]);

const createFilterSection = (name: string, key: string): FilterSection => {
  const rawOptions = props.cards
    .map(c => (c as any)[key])
    .flat()
    .filter(c => c != null);
  const options = [...new Set(rawOptions)];
  options.sort((a, b) => a.localeCompare(b));

  return reactive({ name, key, values: [], options: options.map(o => ({ id: o, text: o })) });
};

const createTagFilterSection = (): FilterSection => {
  const existingTags = props.cards.map(c => c.tags).flat();
  const uniqueTags = [...new Set(existingTags)];

  const options = TAGS.map(t => {
    return {
      id: t.id,
      text: t.text,
      icon: t.icon,
      disabled: !uniqueTags.includes(t.id)
    };
  });

  return reactive({
    name: 'Tag',
    key: 'tags',
    values: [],
    options
  });
};

const onReset = (useInitial = false) => {
  sorter.value = props.activeSorter || 'new-to-old';

  const oldFilters = props.activeFilters || [];

  const sections: FilterSection[] = [
    createFilterSection('Artist', 'artists'),
    createFilterSection('Group', 'groupName'),
    createFilterSection('Album', 'whereFromName'),
    createFilterSection('Year', 'year'),
    createTagFilterSection()
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
  const filters: Filter[] = filterSections.value
    .filter(f => f.options.length > 1 && f.values.length > 0)
    .map(f => {
      return {
        key: f.key,
        values: f.values
      };
    });

  modalController.dismiss(
    {
      filters,
      sorter: sorter.value
    },
    'accept'
  );
};
</script>
