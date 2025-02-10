import {
  UnifiedMediaResult,
  UnifiedSources,
} from 'sofamaxxing/dist/models/unifiedTypes';


import ProviderCache from './cache';
import Gogoanime from '@consumet/extensions/dist/providers/anime/gogoanime';

const api = new Gogoanime();
const cache = new ProviderCache();

class GogoanimeApi {
  searchInProvider = async (
    query: string,
    dubbed: boolean,
  ): Promise<UnifiedMediaResult[] | null> => {
    try {
      const searchResults = await api.search(
        `${dubbed ? `${query} (Dub)` : query}`,
      );

      return searchResults.results.filter((result: any) =>
        dubbed
          ? (result.title as string).includes('(Dub)')
          : !(result.title as string).includes('(Dub)'),
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
    console.log('daje');
    try {
      // start searching
      for (const animeSearch of animeTitles) {
        console.log(animeSearch);
        // search anime (per dub too)
        const searchResults = await api.search(
          `${dubbed ? `${animeSearch} (Dub)` : animeSearch}`,
        );
        console.log('1');

        const filteredResults = searchResults.results.filter((result: any) =>
          dubbed
            ? (result.title as string).includes('(Dub)')
            : !(result.title as string).includes('(Dub)'),
        );
        console.log('2');

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
        console.log('3');

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
      const mediaInfo = await api.fetchAnimeInfo(animeId);

      const episodeId =
        mediaInfo?.episodes?.find((ep: any) => ep.number == episode)?.id ??
        null;

      if (episodeId) {
        const sources = await api.fetchEpisodeSources(episodeId);
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

export default GogoanimeApi;
