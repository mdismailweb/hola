import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './CustomTimePicker.css';

const CustomTimePicker = ({ title = "Start Time", initialTime = "12:00", onConfirm, onCancel }) => {
  const { isDarkMode } = useTheme();
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [period, setPeriod] = useState('AM');

  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // Generate hours 1-12
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate minutes 00-59
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Parse initial time and scroll to position
  useEffect(() => {
    let targetHour = selectedHour;
    let targetMinute = selectedMinute;

    if (initialTime) {
      const match = initialTime.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = parseInt(match[2]);

        let h12 = hour;
        let p = 'AM';

        // Convert 24-hour to 12-hour format
        if (hour === 0) {
          h12 = 12;
          p = 'AM';
        } else if (hour < 12) {
          p = 'AM';
        } else if (hour === 12) {
          p = 'PM';
        } else {
          h12 = hour - 12;
          p = 'PM';
        }

        setSelectedHour(h12);
        setSelectedMinute(minute);
        setPeriod(p);

        targetHour = h12;
        targetMinute = minute;
      }
    }

    // Scroll to positions (calculated or defaults) after render
    setTimeout(() => {
      if (hourScrollRef.current) {
        const hIndex = hours.indexOf(targetHour);
        if (hIndex !== -1) {
          hourScrollRef.current.scrollTop = hIndex * 40;
        }
      }
      if (minuteScrollRef.current) {
        minuteScrollRef.current.scrollTop = targetMinute * 40;
      }
    }, 50);
  }, [initialTime]);

  const handleScroll = (ref, items, setValue, selectedValue) => {
    const container = ref.current;
    if (!container) return;

    const itemHeight = 40; // Height of each item
    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const value = items[index];

    if (value !== undefined && value !== selectedValue) {
      setValue(value);
    }
  };


  const handleDone = () => {
    // Convert to 24-hour format
    let hour24 = selectedHour;
    if (period === 'AM') {
      if (selectedHour === 12) hour24 = 0;
    } else {
      if (selectedHour !== 12) hour24 = selectedHour + 12;
    }

    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onConfirm(timeString);
  };

  const displayTime = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${period}`;

  return (
    <div className={`custom-time-picker-overlay ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="custom-time-picker-modal">
        <div className="time-picker-header">
          <h5>{title}</h5>
          <button className="close-btn" onClick={onCancel}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="time-display">
          {displayTime}
        </div>

        <div className="time-selector-container">
          <div className="time-selector-wrapper">
            {/* Hour Selector */}
            <div className="time-column">
              <div
                className="scroll-container"
                ref={hourScrollRef}
                onScroll={() => handleScroll(hourScrollRef, hours, setSelectedHour, selectedHour)}
              >
                <div className="scroll-padding"></div>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={`time-item ${hour === selectedHour ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedHour(hour);
                      if (hourScrollRef.current) {
                        const itemHeight = 40;
                        const index = hours.indexOf(hour);
                        hourScrollRef.current.scrollTo({
                          top: index * itemHeight,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  >
                    {hour}
                  </div>
                ))}
                <div className="scroll-padding"></div>
              </div>
            </div>

            {/* Minute Selector */}
            <div className="time-column">
              <div
                className="scroll-container"
                ref={minuteScrollRef}
                onScroll={() => handleScroll(minuteScrollRef, minutes, setSelectedMinute, selectedMinute)}
              >
                <div className="scroll-padding"></div>
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    className={`time-item ${minute === selectedMinute ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedMinute(minute);
                      if (minuteScrollRef.current) {
                        const itemHeight = 40;
                        minuteScrollRef.current.scrollTo({
                          top: minute * itemHeight,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
                <div className="scroll-padding"></div>
              </div>
            </div>
          </div>

          <div className="selection-indicator"></div>
        </div>

        {/* AM/PM Toggle */}
        <div className="period-toggle">
          <button
            className={`period-btn ${period === 'AM' ? 'active' : ''}`}
            onClick={() => setPeriod('AM')}
          >
            AM
          </button>
          <button
            className={`period-btn ${period === 'PM' ? 'active' : ''}`}
            onClick={() => setPeriod('PM')}
          >
            PM
          </button>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="done-btn" onClick={handleDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTimePicker;
