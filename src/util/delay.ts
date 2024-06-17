export async function withDelay<T>(task: Promise<T>, minDuration: number) {
  const [resp] = await Promise.all([task, delay(minDuration)]);
  return resp;
}

export const delay = (durationMs: number) => new Promise(r => setTimeout(r, durationMs));
