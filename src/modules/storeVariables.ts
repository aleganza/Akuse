import Store from 'electron-store';
import { Provider } from '../renderer/tabs/Tab4';

const STORE = new Store();

const defaultValues = {
  update_progress: true,
  autoplay_next: true,
  dubbed: false,
  source_flag: 'HIANIME',
  subtitle_language: 'English',
  intro_skip_time: 85,
  key_press_skip: 5,
  show_duration: true,
  trailer_volume_on: false,
  volume: 1,
  episodes_per_page: 30,
  history: { entries: {} },
  provider_match_cache: {},
  adult_content: true,
  light_mode: false,
};

export const setDefaultStoreVariables = () => {
  for (const [key, value] of Object.entries(defaultValues)) {
    if (STORE.has(key)) continue;
    STORE.set(key, value);
  }
};

export const getSourceFlag = async (): Promise<Provider | null> => {
  switch (STORE.get('source_flag')) {
    case 'HIANIME': {
      return 'HIANIME';
    }
    case 'GOGOANIME': {
      return 'GOGOANIME';
    }
    case 'ANIMEHEAVEN': {
      return 'ANIMEHEAVEN';
    }
    case 'ANIMEUNITY': {
      return 'ANIMEUNITY';
    }
    default: {
      return null;
    }
  }
};

export const getProviderSearchMatch = (
  anilistId: number,
  provider: Provider,
  dubbed: boolean,
): any | null => {
  const cache = STORE.get('provider_match_cache', {}) as any;
  const key = `${anilistId}-${provider}-${dubbed}`;

  console.log(key)
  console.log(cache[key])

  return cache[key] ?? null
};

/**
 *
 * used for the provider matches caching
 *
 * first 3 params make the id
 * pattern: anilistId-provider-dubbed
 * @param anilistId
 * @param provider
 * @param dubbed
 *
 * result from the provider
 * @param choice
 * @returns
 */
export const setProviderSearchMatch = (
  anilistId: number,
  provider: Provider,
  dubbed: boolean,
  choice: any,
) => {
  const cache = STORE.get('provider_match_cache', {}) as any;
  const key = `${anilistId}-${provider}-${dubbed}`;
  const value = {
    id: choice.id,
    title: choice.title,
    image: choice.image,
  };

  cache[key] = {
    ...cache[key],
    ...value,
  };

  STORE.set('provider_match_cache', cache);
};
