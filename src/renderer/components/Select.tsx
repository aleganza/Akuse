import './styles/Select.css';

import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';

type Value = any | null;

interface Option {
  label: string;
  value: Value;
}

interface SelectProps {
  options: Option[];
  selectedValue?: Value;
  onChange?: (value: Value) => void;
  className?: string;
  width?: number | string;
  zIndex?: number;
  selectedIndex?: number;
}

export const Select: React.FC<SelectProps> = ({
  options,
  selectedValue,
  onChange,
  className = '',
  width,
  zIndex = 1,
  selectedIndex = -1
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // const [selectedOption, setSelectedOption] = useState<Option>();

  const selectRef = useRef<HTMLDivElement>(null);
  let label: string = '';

  const handleSelect = (option: Option) => {
    if (onChange) {
      label = option.label;
      onChange(option.value);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  // let selectedOption;
  const selectedOption = selectedIndex === -1 ? options.find(
    (option) => option.value === selectedValue,
  ) : options[selectedIndex];
  label = selectedOption?.label ?? '';
  // if(selectedIndex === -1)
  //   setSelectedOption();
  // else
  //   setSelectedOption();

  return (
    <div
      ref={selectRef}
      className={`custom-select unselectable ${className} ${
        isOpen ? 'open-radius' : ''
      }`}
      style={{ minWidth: width, zIndex: zIndex }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="label">
        {label}
        <div className={`chevron ${isOpen ? 'down' : ''}`}>
          <FontAwesomeIcon className="i" icon={faChevronDown} />
        </div>
      </div>
      {isOpen && (
        <div className="options-group">
          {options.map((option) => (
            <div
              key={option.value}
              className={`option ${
                selectedValue === option.value ? 'active' : ''
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
