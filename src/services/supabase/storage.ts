import * as SecureStore from 'expo-secure-store';

const STORAGE_PREFIX = 'epa608pro.supabase.auth';
const CHUNK_SIZE = 1800;

const countKey = (key: string): string => `${STORAGE_PREFIX}.${key}.count`;
const chunkKey = (key: string, index: number): string =>
  `${STORAGE_PREFIX}.${key}.${index}`;

const removeChunks = async (key: string): Promise<void> => {
  const existingCount = await SecureStore.getItemAsync(countKey(key));
  const chunkCount = Number(existingCount ?? 0);

  await Promise.all([
    SecureStore.deleteItemAsync(countKey(key)),
    ...Array.from({ length: chunkCount }, (_, index) =>
      SecureStore.deleteItemAsync(chunkKey(key, index)),
    ),
  ]);
};

export const secureStoreStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const rawCount = await SecureStore.getItemAsync(countKey(key));

    if (!rawCount) {
      return null;
    }

    const chunkCount = Number(rawCount);

    if (!Number.isFinite(chunkCount) || chunkCount <= 0) {
      return null;
    }

    const chunks = await Promise.all(
      Array.from({ length: chunkCount }, (_, index) =>
        SecureStore.getItemAsync(chunkKey(key, index)),
      ),
    );

    if (chunks.some((chunk) => chunk == null)) {
      await removeChunks(key);
      return null;
    }

    return chunks.join('');
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await removeChunks(key);

    const chunks =
      value.length > CHUNK_SIZE ? value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) ?? [] : [value];

    await Promise.all([
      SecureStore.setItemAsync(countKey(key), String(chunks.length)),
      ...chunks.map((chunk, index) =>
        SecureStore.setItemAsync(chunkKey(key, index), chunk),
      ),
    ]);
  },
  removeItem: async (key: string): Promise<void> => {
    await removeChunks(key);
  },
};
