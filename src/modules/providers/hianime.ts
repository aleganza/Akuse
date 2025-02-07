import {
  UnifiedMediaResult,
  UnifiedSources,
} from 'sofamaxxing/dist/models/unifiedTypes';

import { SOFAMAXXING_URL } from '../../constants/utils';
import { apiRequest } from './api';
import ProviderCache from './cache';

const api = `${SOFAMAXXING_URL}/zoro`;
const cache = new ProviderCache();

class HiAnimeAPI {
  searchInProvider = async (
    query: string,
    dubbed: boolean,
  ): Promise<UnifiedMediaResult[] | null> => {
    const searchResults = await apiRequest(`${api}/${query}`);
    return searchResults.results;
  };

  /**
   *
   * @returns animeId from provider
   */
  searchMatchInProvider = async (
    animeTitles: string[],
    index: number,
    dubbed: boolean,
    releaseDate: number,
  ): Promise<UnifiedMediaResult | null> => {
    // start searching
    for (const animeSearch of animeTitles) {
      // search anime (per dub too)
      const searchResults = await apiRequest(`${api}/${animeSearch}`);

      // find the best result: first check for same name,
      // then check for same release date.
      // finally, update cache
      const animeResult = (cache.animeIds[animeSearch] =
        searchResults.results.filter(
          (result: any) =>
            result.title.toLowerCase().trim() ==
              animeSearch.toLowerCase().trim() ||
            result.releaseDate == releaseDate.toString(),
        )[index] ?? null);

      if (animeResult) return animeResult;
    }

    return null;
  };

  getEpisodeSource = async (
    animeId: string,
    episode: number,
    dubbed: boolean,
  ): Promise<UnifiedSources | null> => {
    const animeInfo = await apiRequest(`${api}/info/${animeId}`);

    const episodeId =
      (cache.episodes[animeId] = animeInfo?.episodes)?.find(
        (ep: any) => ep.number == episode,
      )?.id ?? null;

    if (episodeId) {
      let url = `${api}/episode/${episodeId}`;
      if (dubbed) {
        url = url.replace('both', 'dub');
      }

      const video = await apiRequest(url);
      return video as UnifiedSources;
    }

    // episode not found
    return null;
  };
}

export default HiAnimeAPI;
