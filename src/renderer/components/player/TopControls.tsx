import 'react-activity/dist/Dots.css';

import { ISubtitle } from '@consumet/extensions';
import {
  faAngleLeft,
  faCompress,
  faExpand,
  faUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';

import { ListAnimeData } from '../../../types/anilistAPITypes';
import { EpisodeInfo } from '../../../types/types';
import VideoEpisodesChange from './VideoEpisodesChange';
import VideoSettings from './VideoSettings';

interface TopControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  hls?: Hls;
  listAnimeData: ListAnimeData;
  episodesInfo?: EpisodeInfo[];
  episodeNumber: number;
  episodeTitle: string;
  showPreviousEpisodeButton: boolean;
  showNextEpisodeButton: boolean;
  fullscreen: boolean;
  subtitleTracks?: ISubtitle[];
  onSubtitleTrack: (track: ISubtitle) => void;
  onFullScreentoggle: () => void;
  onPiPToggle: () => void;
  onChangeEpisode: (
    episode: number | null,
    reloadAtPreviousTime?: boolean,
  ) => Promise<boolean>;
  onExit: () => void;
  onClick?: (event: any) => void;
  onDblClick?: (event: any) => void;
  onDropdownToggle: (isDropdownOpen: boolean) => void;
}

const TopControls: React.FC<TopControlsProps> = ({
  videoRef,
  hls,
  listAnimeData,
  episodesInfo,
  episodeNumber,
  episodeTitle,
  showPreviousEpisodeButton,
  showNextEpisodeButton,
  fullscreen,
  onFullScreentoggle,
  onPiPToggle,
  onChangeEpisode,
  onExit,
  onClick,
  onDblClick,
  onDropdownToggle,
  subtitleTracks,
  onSubtitleTrack,
}) => {
  const settingsRef = useRef<HTMLDivElement>(null);

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showEpisodesChange, setShowEpisodesChange] = useState<boolean>(false);

  useEffect(() => {
    onDropdownToggle(showSettings || showEpisodesChange);
  }, [showSettings, showEpisodesChange]);

  const closeOthers = () => {
    setShowSettings(false);
    setShowEpisodesChange(false);
    if (videoRef.current) videoRef.current.focus();
  };

  return (
    <div className="up-controls" onClick={onClick} onDoubleClick={onDblClick}>
      <div className="left">
        <div className="info exit-video" onClick={onExit}>
          <span className="title">{listAnimeData.media.title?.english}</span>
          <span className="back">
            <FontAwesomeIcon className="i" icon={faAngleLeft} />
            <span className="episode">
              {`Ep. ${episodeNumber} - ${episodeTitle}`}
            </span>
          </span>
        </div>
      </div>
      <div className="center"></div>
      <div className="right">
        <VideoSettings
          show={showSettings}
          subtitleTracks={subtitleTracks?.filter(
            (value) =>
              value.lang &&
              value.lang !== 'Thumbnails' &&
              value.lang !== 'thumbnails',
          )}
          onSubtitleTrack={onSubtitleTrack}
          onShow={(show) => {
            closeOthers();
            setShowSettings(show);
          }}
          videoRef={videoRef}
          ref={settingsRef}
          hls={hls}
          onChangeEpisode={onChangeEpisode}
        />
        <VideoEpisodesChange
          show={showEpisodesChange}
          onShow={(show) => {
            closeOthers();
            setShowEpisodesChange(show);
          }}
          listAnimeData={listAnimeData}
          episodeNumber={episodeNumber}
          episodesInfo={episodesInfo}
          showPreviousEpisodeButton={showPreviousEpisodeButton}
          showNextEpisodeButton={showNextEpisodeButton}
          onChangeEpisode={onChangeEpisode}
        />
        <button className="b-player" onClick={onPiPToggle}>
          <div className="tooltip">
            <FontAwesomeIcon className="i" icon={faUpRightFromSquare} />
            <span className="tooltip-text">Picture-in-Picture</span>
          </div>
        </button>
        <button className="b-player fullscreen" onClick={onFullScreentoggle}>
          <div className="tooltip">
            <FontAwesomeIcon
              className="i"
              icon={fullscreen ? faCompress : faExpand}
            />
            {
              <span className="tooltip-text">
                {fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              </span>
            }
          </div>
        </button>
      </div>
    </div>
  );
};

export default TopControls;
