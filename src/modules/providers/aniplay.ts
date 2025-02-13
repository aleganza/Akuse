import {
  UnifiedMediaResult,
  UnifiedSources,
} from 'sofamaxxing.ts/dist/models/unifiedTypes';
import AniPlay from 'sofamaxxing.ts/dist/providers/AniPlay';

import ProviderCache from './cache';

const api = new AniPlay();
const cache = new ProviderCache();

class AniPlayAPI {
  searchInProvider = async (
    query: string,
    dubbed: boolean,
  ): Promise<UnifiedMediaResult[] | null> => {
    try {
      const searchResults = await api.search(query);
      return searchResults.results;
    } catch (error) {
      console.log(error);
      return null;
    }
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
    try {
      // start searching
      for (const animeSearch of animeTitles) {
        // search anime (per dub too)
        const searchResults = await api.search(animeSearch);

        // find the best result: first check for same name,
        // then check for same release date.
        // finally, update cache
        const animeResult =
          searchResults.results.filter(
            (result: any) =>
              result.title.toLowerCase().trim() ==
                animeSearch.toLowerCase().trim() ||
              result.releaseDate == releaseDate.toString(),
          )[index] ?? null;

        if (animeResult) return animeResult;
      }

      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  getEpisodeSource = async (
    animeId: string,
    episode: number,
    host: 'maze' | 'pahe' | 'yuki',
    dubbed: boolean,
  ): Promise<UnifiedSources | null> => {
    try {
      const mediaInfo = await api.fetchInfo(animeId);

      const episodeId =
        mediaInfo?.episodes?.find((ep: any) => ep.number == episode)?.id ??
        null;

      if (episodeId) {
        const sources = await api.fetchSources(
          episodeId,
          host,
          dubbed ? 'dub' : 'sub',
        );
        return sources as UnifiedSources;
      }

      // episode not found
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
}

export default AniPlayAPI;
