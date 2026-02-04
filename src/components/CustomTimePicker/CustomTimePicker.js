import React, { useState, useEffect, useRef } from 'react';
import './CustomTimePicker.css';

const CustomTimePicker = ({ title = "Start Time", initialTime = "12:00", onConfirm, onCancel }) => {
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [period, setPeriod] = useState('AM');
  
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // Parse initial time
  useEffect(() => {
    if (initialTime) {
      const match = initialTime.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        
        // Convert 24-hour to 12-hour format
        if (hour === 0) {
          hour = 12;
          setPeriod('AM');
        } else if (hour < 12) {
          setPeriod('AM');
        } else if (hour === 12) {
          setPeriod('PM');
        } else {
          hour = hour - 12;
          setPeriod('PM');
        }
        
        setSelectedHour(hour);
        setSelectedMinute(minute);
      }
    }
  }, [initialTime]);

  // Generate hours 1-12
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minutes 00-59
  const minutes = Array.from({ length: 60 }, (_, i) => i);

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

  useEffect(() => {
    // Scroll to selected hour on mount
    if (hourScrollRef.current) {
      const itemHeight = 40;
      const index = hours.indexOf(selectedHour);
      hourScrollRef.current.scrollTop = index * itemHeight;
    }
  }, []);

  useEffect(() => {
    // Scroll to selected minute on mount
    if (minuteScrollRef.current) {
      const itemHeight = 40;
      minuteScrollRef.current.scrollTop = selectedMinute * itemHeight;
    }
  }, []);

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
    <div className="custom-time-picker-overlay">
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
