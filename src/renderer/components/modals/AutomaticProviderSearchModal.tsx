import './styles/AutomaticProviderSearchModal.css';

import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Store from 'electron-store';
import { useEffect, useRef, useState } from 'react';
import { Dots } from 'react-activity';
import ReactDOM from 'react-dom';

import {
  searchAutomaticMatchInProvider,
  searchInProvider as searchInProviderApi,
} from '../../../modules/providers/api';
import { ListAnimeData } from '../../../types/anilistAPITypes';
import { LANGUAGE_OPTIONS, Provider, SelectElement } from '../../tabs/Tab4';
import { ModalPage, ModalPageShadow, ModalPageSizeableContent } from './Modal';
import {
  getProviderSearchMatch,
  setProviderSearchMatch,
} from '../../../modules/storeVariables';
import Select from '../Select';

const modalsRoot = document.getElementById('modals-root');
const STORE = new Store();

const AutomaticProviderSearchModal: React.FC<{
  show: boolean;
  listAnimeData?: ListAnimeData;
  episode?: number;
  onClose: () => void;
  onPlay: (providerAnimeId: string) => void;
}> = ({ show, listAnimeData, episode, onClose, onPlay }) => {
  const provider = STORE.get('source_flag') as Provider;
  const dubbed = STORE.get('dubbed') as boolean;

  const modalRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(provider);

  const handleLanguageChange = (value: any) => {
    STORE.set('source_flag', value);
    setSelectedLanguage(value);
    setResults([]);
    startAutomaticMatch(value);
  };

  const handlePlayClick = (providerResult: any) => {
    rememberChoice(providerResult);
    onPlay(providerResult.id);
    closeModal();
  };

  /**
   * when the user chooses a result,
   * cache and remember the choice
   *
   * @param providerResult
   */
  const rememberChoice = (providerResult: any) => {
    setProviderSearchMatch(
      listAnimeData!.media.id!,
      provider,
      dubbed,
      providerResult,
    );
  };

  const closeModal = () => {
    onClose();
    setTimeout(() => {
      setResults([]);
      setSelectedTitle('');
    }, 400);
  };

  const handleInputKeydown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.keyCode === 229) return;
    if (event.code === 'Enter' && !loading) searchInProvider();
  };

  const startAutomaticMatch = async (staticProvider?: any) => {
    const cachedResult = getProviderSearchMatch(
      listAnimeData!.media.id!,
      staticProvider ?? provider,
      dubbed,
    );
    console.log(staticProvider);
    console.log(provider);
    if (cachedResult !== null) {
      setResults([cachedResult]);
      return;
    }

    setResults([]);
    setLoading(true);

    const providerResult = await searchAutomaticMatchInProvider(
      listAnimeData!,
      episode!,
    );
    providerResult && setResults([providerResult]);

    setLoading(false);
    if (!providerResult)
      setFeedbackText(
        'Automatic title matching failed. Please try searching manually.',
      );
  };

  const searchInProvider = async () => {
    setResults([]);
    setLoading(true);

    const providerResults = await searchInProviderApi(selectedTitle);
    providerResults && setResults(providerResults);

    setLoading(false);
    if (!providerResults || providerResults.length === 0)
      setFeedbackText('No results found.');
  };

  // modal is opened
  useEffect(() => {
    if (show) {
      startAutomaticMatch();
    }
  }, [show]);

  return ReactDOM.createPortal(
    <>
      <ModalPageShadow show={show} zIndex={21} />
      <ModalPage
        show={show}
        modalRef={modalRef}
        closeModal={closeModal}
        zIndex={22}
      >
        <ModalPageSizeableContent
          width={400}
          closeModal={closeModal}
          title="Select source"
        >
          <div
            className="automatic-provider-search-content"
            onKeyDown={handleInputKeydown}
          >
            <span style={{ marginBottom: 5 }}>
              Auto-matches AniList titles to provider titles.
              <br />
              If incorrect or missing, use the search bar.
            </span>

            <div className="search-container">
              <input
                type="text"
                id="search-page-filter-title"
                placeholder="Search manually by title..."
                value={selectedTitle}
                onChange={(event: any) => setSelectedTitle(event.target.value)}
              />

              <button onClick={searchInProvider}>
                <FontAwesomeIcon className="i" icon={faSearch} />
              </button>
            </div>

            <Select
              zIndex={1000}
              options={LANGUAGE_OPTIONS}
              selectedValue={selectedLanguage}
              onChange={handleLanguageChange}
              width={180}
            />

            {results.length === 0 && !loading && (
              <span style={{ marginTop: 20 }}>{feedbackText}</span>
            )}

            {/* {results.length !== 0 ? (
              <span>
                {`Results from ${
                  LANGUAGE_OPTIONS.find((l) => l.value == provider)?.label
                }`}
              </span>
            ) : (
              <span>No matching results. Please try searching again.</span>
            )} */}

            {loading ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Dots />
              </div>
            ) : (
              results.length !== 0 && (
                <div className="cards-group">
                  {results.length !== 0 &&
                    results?.map((result, index) => (
                      <div
                        key={index}
                        className="card"
                        onClick={() => {
                          handlePlayClick(result);
                        }}
                      >
                        {result?.image && (
                          <img src={result?.image} alt="anime image" />
                        )}
                        <div className="right">
                          <p>
                            <strong>Title: </strong>
                            {result?.title}
                          </p>
                          <p>
                            <strong>Id: </strong>
                            {result?.id}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )
            )}
          </div>
        </ModalPageSizeableContent>
      </ModalPage>
    </>,
    modalsRoot!,
  );
};

export default AutomaticProviderSearchModal;
