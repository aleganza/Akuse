import { UnifiedMediaResult, UnifiedSources } from 'sofamaxxing.ts/dist/models/unifiedTypes';
import HiAnime from 'sofamaxxing.ts/dist/providers/HiAnime';

import ProviderCache from './cache';

const api = new HiAnime();
const cache = new ProviderCache();

class HiAnimeAPI {
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
    // start searching
    for (const animeSearch of animeTitles) {
      // search anime (per dub too)
      const searchResults = await api.search(animeSearch)

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
  };

  getEpisodeSource = async (
    animeId: string,
    episode: number,
    dubbed: boolean,
  ): Promise<UnifiedSources | null> => {
    const mediaInfo = await api.fetchInfo(animeId);
    console.log(mediaInfo)

    let episodeId =
      mediaInfo?.episodes?.find((ep: any) => ep.number == episode)?.id ?? null;

    if (episodeId) {
      console.log(episodeId)
      // if (dubbed) {
      //   episodeId = episodeId.replace('both', 'dub');
      // }

      const sources = await api.fetchSources(episodeId);
      console.log(sources)
      return sources as UnifiedSources;
    }

    // episode not found
    return null;
  };
}

export default HiAnimeAPI;
