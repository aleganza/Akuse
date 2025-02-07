import { UnifiedMediaResult, UnifiedSources } from 'sofamaxxing/dist/models/unifiedTypes';
import Gogoanime from 'sofamaxxing/dist/providers/Gogoanime';

import ProviderCache from './cache';

const api = new Gogoanime();
const cache = new ProviderCache();

class GogoanimeApi {
  searchInProvider = async (
    query: string,
    dubbed: boolean,
  ): Promise<UnifiedMediaResult[] | null> => {
    const searchResults = await api.search(
      `${dubbed ? `${query} (Dub)` : query}`,
    );

    return searchResults.results.filter((result: any) =>
      dubbed
        ? (result.title as string).includes('(Dub)')
        : !(result.title as string).includes('(Dub)'),
    );
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
      const searchResults = await api.search(
        `${dubbed ? `${animeSearch} (Dub)` : animeSearch}`,
      );

      const filteredResults = searchResults.results.filter((result: any) =>
        dubbed
          ? (result.title as string).includes('(Dub)')
          : !(result.title as string).includes('(Dub)'),
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
  };

  getEpisodeSource = async (
    animeId: string,
    episode: number,
  ): Promise<UnifiedSources | null> => {
    const mediaInfo = await api.fetchInfo(animeId);

    const episodeId =
      mediaInfo?.episodes?.find((ep: any) => ep.number == episode)?.id ?? null;

    if (episodeId) {
      const sources = await api.fetchSources(episodeId);
      return sources as UnifiedSources;
    }

    // episode not found
    return null;
  };
}

export default GogoanimeApi;
