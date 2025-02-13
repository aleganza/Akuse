import 'dotenv/config';

import Store from 'electron-store';

import { ListAnimeData } from '../../types/anilistAPITypes';
import { animeCustomTitles } from '../animeCustomTitles';
import { getParsedAnimeTitles } from '../utils';
import AnimeHeavenAPI from './animeheaven';
import AnimeUnityApi from './animeunity';
import GogoanimeApi from './gogoanime';
import HiAnimeAPI from './hianime';
import AniPlayAPI from './aniplay';
import axios from 'axios';
import AnimeParadiseAPI from './animeparadise';

const STORE = new Store();

export const searchInProvider = async (query: string) => {
  const lang = (await STORE.get('source_flag')) as string;
  const dubbed = (await STORE.get('dubbed')) as boolean;

  switch (lang) {
    case 'HIANIME': {
      const api = new HiAnimeAPI();
      return await api.searchInProvider(query, dubbed);
    }
    case 'GOGOANIME': {
      const api = new GogoanimeApi();
      return await api.searchInProvider(query, dubbed);
    }
    case 'YUKI': {
      const api = new AniPlayAPI();
      return await api.searchInProvider(query, dubbed);
    }
    case 'MAZE': {
      const api = new AniPlayAPI();
      return await api.searchInProvider(query, dubbed);
    }
    case 'PAHE': {
      const api = new AniPlayAPI();
      return await api.searchInProvider(query, dubbed);
    }
    case 'ANIMEPARADISE': {
      const api = new AnimeParadiseAPI();
      return await api.searchInProvider(query, dubbed);
    }
    case 'ANIMEHEAVEN': {
      const api = new AnimeHeavenAPI();
      return await api.searchInProvider(query, dubbed);
    }
    case 'ANIMEUNITY': {
      const api = new AnimeUnityApi();
      return await api.searchInProvider(query, dubbed);
    }
  }

  return null;
};

export const searchAutomaticMatchInProvider = async (
  listAnimeData: ListAnimeData,
  episode: number,
) => {
  const lang = (await STORE.get('source_flag')) as string;
  const dubbed = (await STORE.get('dubbed')) as boolean;

  // build custom titles
  const customTitle =
    animeCustomTitles[lang] &&
    animeCustomTitles[lang][listAnimeData.media?.id!];
  const animeTitles = getParsedAnimeTitles(listAnimeData.media);
  if (customTitle) animeTitles.unshift(customTitle.title);

  console.log(lang + ' ' + dubbed + ' ' + customTitle?.title);

  switch (lang) {
    case 'HIANIME': {
      const api = new HiAnimeAPI();
      return await api.searchMatchInProvider(
        animeTitles,
        customTitle ? customTitle.index : 0,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
    }
    case 'GOGOANIME': {
      const api = new GogoanimeApi();
      return await api.searchMatchInProvider(
        animeTitles,
        customTitle ? customTitle.index : 0,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
    }
    case 'ANIMEPARADISE': {
      const api = new AnimeParadiseAPI();
      return await api.searchMatchInProvider(
        animeTitles,
        customTitle ? customTitle.index : 0,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
    }
    case 'ANIMEHEAVEN': {
      const api = new AnimeHeavenAPI();
      return await api.searchMatchInProvider(
        animeTitles,
        customTitle ? customTitle.index : 0,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
    }
    case 'YUKI': {
      const api = new AniPlayAPI();
      return await api.searchMatchInProvider(
        animeTitles,
        customTitle ? customTitle.index : 0,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
    }
    case 'MAZE': {
      const api = new AniPlayAPI();
      return await api.searchMatchInProvider(
        animeTitles,
        customTitle ? customTitle.index : 0,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
    }
    case 'PAHE': {
      const api = new AniPlayAPI();
      return await api.searchMatchInProvider(
        animeTitles,
        customTitle ? customTitle.index : 0,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
    }
    case 'ANIMEUNITY': {
      const api = new AnimeUnityApi();
      return await api.searchMatchInProvider(
        animeTitles,
        customTitle ? customTitle.index : 0,
        dubbed,
        listAnimeData.media.startDate?.year ?? 0,
      );
    }
  }

  return null;
};

export const getSourceFromProvider = async (
  providerAnimeId: string,
  episode: number,
) => {
  const lang = (await STORE.get('source_flag')) as string;
  const dubbed = (await STORE.get('dubbed')) as boolean;

  switch (lang) {
    case 'HIANIME': {
      const api = new HiAnimeAPI();
      const source = await api.getEpisodeSource(
        providerAnimeId,
        episode,
        dubbed,
      );

      return source;
    }
    case 'GOGOANIME': {
      const api = new GogoanimeApi();
      const source = await api.getEpisodeSource(providerAnimeId, episode);

      return source;
    }
    case 'ANIMEPARADISE': {
      const api = new AnimeParadiseAPI();
      const source = await api.getEpisodeSource(providerAnimeId, episode);

      return source;
    }
    case 'ANIMEHEAVEN': {
      const api = new AnimeHeavenAPI();
      const source = await api.getEpisodeSource(providerAnimeId, episode);

      return source;
    }
    case 'YUKI': {
      const api = new AniPlayAPI();
      const source = await api.getEpisodeSource(
        providerAnimeId,
        episode,
        'yuki',
        dubbed,
      );

      return source;
    }
    case 'MAZE': {
      const api = new AniPlayAPI();
      const source = await api.getEpisodeSource(
        providerAnimeId,
        episode,
        'maze',
        dubbed,
      );

      return source;
    }
    case 'PAHE': {
      const api = new AniPlayAPI();
      const source = await api.getEpisodeSource(
        providerAnimeId,
        episode,
        'pahe',
        dubbed,
      );

      return source;
    }
    case 'ANIMEUNITY': {
      const api = new AnimeUnityApi();
      const source = await api.getEpisodeSource(providerAnimeId, episode);

      return source;
    }
  }

  return null;
};

export const apiRequest = async (url: string) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'x-api-key': process.env.SOFAMAXXING_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
