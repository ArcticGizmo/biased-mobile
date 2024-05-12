import { loadingController } from '@ionic/vue';

export const showLoading = async () => {
  const loading = await loadingController.create({
    cssClass: 'transparent-loading'
  });
  loading.present();
  return loading;
};
