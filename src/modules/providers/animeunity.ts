import {
  UnifiedMediaResult,
  UnifiedSources,
} from 'sofamaxxing.ts/dist/models/unifiedTypes';
import AnimeUnity from 'sofamaxxing.ts/dist/providers/AnimeUnity';

import ProviderCache from './cache';

const api = new AnimeUnity();
const cache = new ProviderCache();

class AnimeUnityApi {
  searchInProvider = async (
    query: string,
    dubbed: boolean,
  ): Promise<UnifiedMediaResult[] | null> => {
    try {
      const searchResults = await api.search(
        `${dubbed ? `${query} (ITA)` : query}`,
      );

      return searchResults.results.filter((result: any) =>
        dubbed
          ? (result.title as string).includes('(ITA)')
          : !(result.title as string).includes('(ITA)'),
      );
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
        const searchResults = await api.search(
          `${dubbed ? `${animeSearch} (ITA)` : animeSearch}`,
        );

        const filteredResults = searchResults.results.filter((result: any) =>
          dubbed
            ? (result.title as string).includes('(ITA)')
            : !(result.title as string).includes('(ITA)'),
        );

        // find the best result: first check for same name,
        // then check for same release date.
        // finally, update cache
        const animeResult =
          filteredResults.filter(
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
  ): Promise<UnifiedSources | null> => {
    try {
      const mediaInfo = await api.fetchInfo(
        animeId,
        episode > 120 ? Math.floor(episode / 120) + 1 : 1,
      );

      const episodeId =
        mediaInfo?.episodes?.find((ep: any) => ep.number == episode)?.id ??
        null;

      if (episodeId) {
        const sources = await api.fetchSources(episodeId);
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

export default AnimeUnityApi;
