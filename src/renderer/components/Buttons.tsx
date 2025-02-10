import './styles/Buttons.css';
import 'react-activity/dist/Dots.css';

import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import Dots from 'react-activity/dist/Dots';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tint?: 'primary' | 'light' | 'dark' | 'warning' | 'empty';
  shadow?: boolean;
  disabled?: boolean;
}

interface ButtonMainProps extends ButtonProps {
  text: string | number;
  icon?: IconDefinition;
}

export const ButtonLoading = () => {
  return (
    <button className="bm light disabled">
      <Dots />
    </button>
  );
};

export const ButtonMain: React.FC<ButtonMainProps> = ({
  text,
  icon = null,
  tint = 'primary',
  shadow = false,
  disabled = false,
  ...rest
}) => {
  return (
    <button
      className={`bm primary ${tint} ${shadow ? 'shadow' : ''} ${disabled ? 'disabled' : ''}`}
      {...rest}
    >
      {icon && (
        <FontAwesomeIcon className="i" icon={icon} style={{ marginRight: 8 }} />
      )}
      {text}
    </button>
  );
};

type HoverButton = {
  icon: IconDefinition;
  text: string;
  action: () => void;
};

interface ButtonCircleProps extends ButtonProps {
  icon: IconDefinition;
  small?: boolean;
  tooltipText?: string;
  hoverButtons?: HoverButton[];
}

export const ButtonCircle: React.FC<ButtonCircleProps> = ({
  icon,
  tint = 'primary',
  shadow = false,
  small = false,
  disabled = false,
  tooltipText,
  hoverButtons,
  ...rest
}) => {
  const [showHoverButtons, setShowHoverButtons] = useState<boolean>(false);

  const handleShowHoverButtons = () => {
    setShowHoverButtons(true);
    console.log('ciao');
  };

  const handleHideHoverButtons = () => {
    setShowHoverButtons(false);
  };

  return (
    <div className="circle-button-container">
      {hoverButtons && (
        <div className="hover-buttons">
          {hoverButtons?.map((value, index) => (
            <ButtonCircle
              key={index}
              icon={value.icon}
              tint="empty"
              shadow
              tooltipText={value.text}
              onClick={value.action}
            />
          ))}
        </div>
      )}
      <button
        className={`bc ${tint} ${shadow ? 'shadow' : ''} ${small ? 'small' : ''} ${disabled ? 'disabled' : ''}`}
        {...rest}
      >
        <div className="tooltip">
          <FontAwesomeIcon className="i" icon={icon} />
          {tooltipText && <span className="tooltip-text">{tooltipText}</span>}
        </div>
      </button>
    </div>
  );
};
