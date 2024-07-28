import { onIonViewDidEnter, onIonViewDidLeave, onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import { provide, inject, ref, Ref, onUnmounted } from 'vue';
import { RouteRecordRaw, RouteComponent } from 'vue-router';

type Hook = () => void;

interface HookMap {
  willEnter: Hook[];
  didEnter: Hook[];
  willLeave: Hook[];
  didLeave: Hook[];
}

interface Page {
  id: number;
  name: string;
  hooks: HookMap;
}

/*
This custom lifecycle allows all components to use page lifecycle events to make things 
more intuitive ... but there are some quirks to consider.

Solution:
onIon(will|did)(enter|leave) are only called from components references in the **router definition**
and will not trigger for any other components. We use this fact to either
* register via the normal ionic lifecycle events if a router component
* inject the closest page in the heirachy to register custom events instead

This means that all lifecycle events for **everything** within a page can be triggered under the same
hook and actually be intuitive
*/
const useLifecycle = () => {
  const page = inject<Ref<Page>>('page', () => ref(createPage('__modal')), true);

  const hooks: HookMap = {
    willEnter: [],
    didEnter: [],
    willLeave: [],
    didLeave: []
  };

  // if the ionWillEnter event triggers, we know it is a router component
  // and should use local hooks ONLY
  let useLocalHooks = false;

  onIonViewWillEnter(() => {
    useLocalHooks = true;
    hooks.willEnter.forEach(c => c());
  });
  onIonViewDidEnter(() => hooks.didEnter.forEach(c => c()));
  onIonViewWillLeave(() => hooks.willLeave.forEach(c => c()));
  onIonViewDidLeave(() => hooks.didLeave.forEach(c => c()));

  const registerHook = (type: keyof HookMap, hook: Hook) => {
    if (useLocalHooks) {
      hooks[type].push(hook);
    } else {
      page.value.hooks[type].push(hook);
    }
  };

  const onPageWillEnter = (hook: Hook) => registerHook('willEnter', hook);
  const onPageDidEnter = (hook: Hook) => registerHook('didEnter', hook);
  const onPageWillLeave = (hook: Hook) => registerHook('willLeave', hook);
  const onPageDidLeave = (hook: Hook) => registerHook('didLeave', hook);

  return { onPageWillEnter, onPageDidEnter, onPageWillLeave, onPageDidLeave };
};

export const onPageWillEnter = (hook: Hook) => useLifecycle().onPageWillEnter(hook);
export const onPageDidEnter = (hook: Hook) => useLifecycle().onPageDidEnter(hook);
export const onPageWillLeave = (hook: Hook) => useLifecycle().onPageWillLeave(hook);
export const onPageDidLeave = (hook: Hook) => useLifecycle().onPageDidLeave(hook);

let PAGE_ID = 1;
const pages = ref<Ref<Page>[]>([]);

const createPage = (name: string): Page => {
  return {
    id: PAGE_ID++,
    name,
    hooks: {
      willEnter: [],
      didEnter: [],
      willLeave: [],
      didLeave: []
    }
  };
};

export const registerPage = (name: any) => {
  const page = ref(createPage(name));
  pages.value = [...pages.value, page];

  provide('page', page);

  onUnmounted(() => {
    // remove page from list so it will no longer trigger
    pages.value = pages.value.filter(p => p.value.id !== p.value.id);
  });

  const triggerHooks = (name: keyof HookMap) => {
    page.value.hooks[name].forEach(c => c());
  };

  onIonViewWillEnter(() => triggerHooks('willEnter'));
  onIonViewDidEnter(() => triggerHooks('didEnter'));
  onIonViewWillLeave(() => triggerHooks('willLeave'));
  onIonViewDidLeave(() => triggerHooks('didLeave'));
};

export const wireUpRouteLifecycles = (routes: RouteRecordRaw[]) => {
  routes.forEach(wireUpRouteLifecycle);
};

/*
Here we ensure that the relevant page is being injected to children for hooks to be bound against
*/
const wireUpRouteLifecycle = (route: RouteRecordRaw) => {
  if (typeof route.component === 'function') {
    const oldC = route.component as () => Promise<RouteComponent>;
    route.component = async () => {
      const c = ((await oldC()) as any).default;
      const name = c.__name;
      c.beforeCreate = function () {
        registerPage(name);
      };
      return c;
    };
  } else if (route.component) {
    const name = route.component.__name;

    route.component.beforeCreate = function () {
      registerPage(name);
    };
  }

  route.children?.forEach(wireUpRouteLifecycle);
};
