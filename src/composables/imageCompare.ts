import wretch from 'wretch';

const w = wretch().url('http://localhost:5005');

export interface ComparisonImage {
  id: string;
  extension: string;
}

export const useImageCompare = () => {
  const compare = async (dataUrl: string, targets: ComparisonImage[]) => {
    return w
      .url('/compare')
      .post({ image: dataUrl, targets })
      .json(a => {
        console.log(a);
        return a;
      });
  };

  return { compare };
};
