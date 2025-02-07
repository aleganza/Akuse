import 'react-activity/dist/Dots.css';

import {
  faBookmark,
  faCircleCheck,
  faCircleDot,
  faClock,
} from '@fortawesome/free-regular-svg-icons';
import {
  faBookmark as faBookmarkSolid,
  faBan,
  faCheck,
  faChevronDown,
  faChevronUp,
  faFilm,
  faHourglass,
  faPlay,
  faRotate,
  faStopwatch,
  faXmark,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DOMPurify from 'dompurify';
import React, { useContext, useEffect, useRef, useState } from 'react';

import {
  deleteAnimeFromList,
  updateAnimeFromList,
} from '../../../modules/anilist/anilistApi';
import {
  getAvailableEpisodes,
  getEpisodes,
  getParsedFormat,
  getParsedStatus,
  getProgress,
  getTimeUntilAiring,
  parseDescription,
} from '../../../modules/utils';
import { ListAnimeData } from '../../../types/anilistAPITypes';
import {
  MediaListStatus,
  MediaStatus,
} from '../../../types/anilistGraphQLTypes';
import { AuthContext } from '../../App';
import { ButtonCircle, ButtonMain } from '../Buttons';
import { stat } from 'fs';
import Store from 'electron-store';

const store = new Store();

export const AnimeModalStatus: React.FC<{
  status: MediaStatus | undefined;
}> = ({ status }) => {
  const style = getComputedStyle(document.body);
  const parsedStatus = getParsedStatus(status);

  return (
    <>
      {status === 'FINISHED' && (
        <li>
          <FontAwesomeIcon
            className="i"
            icon={faCircleCheck}
            style={{ marginRight: 7 }}
          />
          {parsedStatus}
        </li>
      )}
      {status === 'RELEASING' && (
        <li style={{ color: style.getPropertyValue('--color-success') }}>
          <FontAwesomeIcon
            className="i"
            icon={faCircleDot}
            style={{ marginRight: 7 }}
          />
          {parsedStatus}
        </li>
      )}
      {status === 'NOT_YET_RELEASED' && (
        <li style={{ color: style.getPropertyValue('--color-alert') }}>
          <FontAwesomeIcon
            className="i"
            icon={faClock}
            style={{ marginRight: 7 }}
          />
          {parsedStatus}
        </li>
      )}
      {(status === 'CANCELLED' || status === 'HIATUS') && (
        <li style={{ color: style.getPropertyValue('--color-warning') }}>
          <FontAwesomeIcon
            className="i"
            icon={faBan}
            style={{ marginRight: 7 }}
          />
          {parsedStatus}
        </li>
      )}
    </>
  );
};

export const AnimeModalGenres: React.FC<{
  genres: string[];
}> = ({ genres }) => {
  return (
    <p className="additional-info">
      {'Genres: '}
      {genres?.map((genre, index) => (
        <span key={index}>
          {genre}
          {genres?.length! - 1 !== index && ', '}
        </span>
      ))}
    </p>
  );
};

export const AnimeModalOtherTitles: React.FC<{
  synonyms: string[];
}> = ({ synonyms }) => {
  return (
    <p className="additional-info">
      {synonyms.length !== 0 && 'Other titles: '}
      {synonyms?.map((title, index) => (
        <span key={index}>
          {title}
          {synonyms?.length! - 1 !== index && ', '}
        </span>
      ))}
    </p>
  );
};

export const AnimeModalEpisodes: React.FC<{
  listAnimeData: ListAnimeData;
}> = ({ listAnimeData }) => {
  const format = getParsedFormat(listAnimeData.media.format);
  const duration = listAnimeData.media.duration;
  const status = getParsedStatus(listAnimeData.media.status);
  const availableEpisodes = getAvailableEpisodes(listAnimeData.media);
  const episodes = getEpisodes(listAnimeData.media);

  return (
    <li>
      {format === 'Movie' ? (
        <>
          <FontAwesomeIcon
            className="i"
            icon={faStopwatch}
            style={{ marginRight: 7 }}
          />
          {duration} Minutes
        </>
      ) : (
        <>
          <FontAwesomeIcon
            className="i"
            icon={faFilm}
            style={{ marginRight: 7 }}
          />
          {availableEpisodes || '?'}{' '}
          {status === 'Releasing' && ` / ${episodes || '?'}`} Episodes
        </>
      )}
    </li>
  );
};

export const AnimeModalDescription: React.FC<{
  listAnimeData: ListAnimeData;
}> = ({ listAnimeData }) => {
  const descriptionRef = useRef<HTMLDivElement>(null);

  const [fullText, setFullText] = useState<boolean>(false);
  const [ellipsis, setEllpisis] = useState<boolean>(false);

  const handleToggleFullText = () => {
    setFullText(!fullText);
  };

  const isEllipsisActive = () =>
    descriptionRef.current?.scrollHeight! >
    descriptionRef.current?.clientHeight!;

  useEffect(() => {
    setTimeout(() => {
      isEllipsisActive();
    }, 100);
  });

  return (
    <>
      <div
        ref={descriptionRef}
        className={`description ${fullText ? '' : 'cropped'}`}
        onClick={handleToggleFullText}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(
            parseDescription(listAnimeData.media.description ?? ''),
          ),
        }}
      ></div>
      <span></span>
      <span
        // className="show-more show-element"
        className={`show-more ${ellipsis ? 'show-element' : ''}`}
        onClick={handleToggleFullText}
      >
        {fullText ? (
          <>
            <FontAwesomeIcon
              className="i"
              icon={faChevronUp}
              style={{ marginRight: 7 }}
            />
            Show less
          </>
        ) : (
          <>
            <FontAwesomeIcon
              className="i"
              icon={faChevronDown}
              style={{ marginRight: 7 }}
            />
            Show more
          </>
        )}
      </span>
    </>
  );
};

export const AnimeModalWatchButtons: React.FC<{
  listAnimeData: ListAnimeData;
  localProgress?: number;
  onPlay: (episode: number) => void;
  loading: boolean;
}> = ({ listAnimeData, localProgress, onPlay, loading = false }) => {
  const logged = useContext(AuthContext);

  const [progress, setProgress] = useState<number | undefined>(
    getProgress(listAnimeData.media),
  );

  const [listStatus, setListStatus] = useState<MediaListStatus | undefined>(
    listAnimeData.media.mediaListEntry?.status,
  );

  // const progress = getProgress(listAnimeData.media);
  const episodes = getEpisodes(listAnimeData.media);
  const availableEpisodes = getAvailableEpisodes(listAnimeData.media);
  const timeUntilAiring = getTimeUntilAiring(listAnimeData.media);

  useEffect(() => {
    if (localProgress) setProgress(localProgress);
  }, [localProgress]);

  const handleListStatusChange = (status: MediaListStatus | undefined) => {
    setListStatus(status);
  };

  return logged ? (
    <div className="watch-buttons">
      {listAnimeData.media.status !== 'NOT_YET_RELEASED' && (
        <>
          {progress === 0 && (
            <ButtonMain
              text="Watch now"
              icon={faPlay}
              tint="light"
              shadow
              onClick={() => onPlay(1)}
            />
          )}

          {progress === availableEpisodes && timeUntilAiring ? (
            <ButtonMain
              text={`${timeUntilAiring.days}d ${timeUntilAiring.hours}h ${timeUntilAiring.minutes}m`}
              icon={faHourglass}
              tint="light"
              shadow
              disabled
            />
          ) : (
            progress === episodes && (
              <ButtonMain
                text="Watch again"
                icon={faRotate}
                tint="light"
                shadow
                onClick={() => onPlay(1)}
              />
            )
          )}

          {progress !== 0 &&
            progress !== episodes &&
            progress !== availableEpisodes && (
              <ButtonMain
                text={`Resume from Ep. ${progress! + 1}`}
                icon={faPlay}
                tint="light"
                shadow
                onClick={() => onPlay(progress! + 1)}
              />
            )}
        </>
      )}

      {listStatus === 'CURRENT' || listStatus === 'REPEATING' ? (
        <RemoveButton
          listAnimeData={listAnimeData}
          listStatus={listStatus}
          onListStatusChange={handleListStatusChange}
        />
      ) : (
        <IsInListButton
          listAnimeData={listAnimeData}
          listStatus={listStatus}
          onListStatusChange={handleListStatusChange}
        />
      )}
    </div>
  ) : (
    <div className="watch-buttons">
      <ButtonMain
        text="Watch now"
        icon={faPlay}
        tint="light"
        shadow
        onClick={() => onPlay(1)}
      />
    </div>
  );
};

export const IsInListButton: React.FC<{
  listAnimeData: ListAnimeData;
  listStatus?: MediaListStatus | undefined;
  onListStatusChange: (status: MediaListStatus | undefined) => void;
}> = ({ listAnimeData, listStatus, onListStatusChange }) => {
  const [inList, setInList] = useState<boolean>(false);
  const [listId, setListId] = useState<number | undefined>(
    listAnimeData.media.mediaListEntry?.id,
  );

  const removeFromList = () => {
    deleteAnimeFromList(listId).then((deleted) => {
      if (deleted) {
        setInList(false);
        onListStatusChange(undefined);
      }
    });
  };

  const addToList = () => {
    updateAnimeFromList(listAnimeData.media.id, 'PLANNING').then((data) => {
      if (data) {
        setListId(data);
        setInList(true);
        onListStatusChange('PLANNING');
      }
    });
  };

  useEffect(() => {
    setInList(listStatus === 'PLANNING');
  }, []);

  return (
    <ButtonCircle
      icon={inList ? faBookmarkSolid : faBookmark}
      tint="empty"
      shadow
      tooltipText={inList ? 'Remove from list' : 'Add to list'}
      onClick={inList ? removeFromList : addToList}
    />
  );
};

export const RemoveButton: React.FC<{
  listAnimeData: ListAnimeData;
  listStatus?: MediaListStatus | undefined;
  onListStatusChange: (status: MediaListStatus | undefined) => void;
}> = ({ listAnimeData, listStatus, onListStatusChange }) => {
  const markAsCompleted = () => {
    updateAnimeFromList(listAnimeData.media.id, 'COMPLETED').then((data) => {
      if (data) {
        onListStatusChange('COMPLETED');
      }
    });
  };

  const markAsDropped = () => {
    updateAnimeFromList(listAnimeData.media.id, 'DROPPED').then((data) => {
      if (data) {
        onListStatusChange('DROPPED');
      }
    });
  };

  return (
    <ButtonCircle
      icon={faXmark}
      tint="empty"
      hoverButtons={[
        { icon: faCheck, text: 'Completed', action: markAsCompleted },
        { icon: faTrash, text: 'Dropped', action: markAsDropped },
      ]}
      shadow
    />
  );
};
