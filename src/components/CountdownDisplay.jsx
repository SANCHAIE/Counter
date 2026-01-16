import React, { useEffect, useState, useCallback } from "react";
import bgGradImage from "../assets/BgLogo1.png";
import buuLogo from "../assets/buu-logo.png";

const CountdownDisplay = ({
  currentValue,
  isCountingDown,
  showNextSetHint,
  fontColor,
  backgroundColor,
  displayMode = "normal",
  mouseClickEnabled = true,
  countdownRate = 0,
  elapsedSeconds = 0,
  setName = "",
  setIndex = 0,
  totalValue = 0,
  eventTitle = "",
  countdownSets = [],
  overlayOpacity = 0.75,
}) => {
  const [sizeClass, setSizeClass] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Toggle clock visibility with Shift+C
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && e.key.toLowerCase() === "c" && displayMode === "work-image") {
        setShowClock((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayMode]);

  // Update current time every second when clock is shown
  useEffect(() => {
    if (!showClock) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [showClock]);

  useEffect(() => {
    // Determine digit count and set appropriate size class
    const digitCount = currentValue.toString().length;

    if (digitCount <= 1) {
      setSizeClass("single-digit");
    } else if (digitCount === 2) {
      setSizeClass("double-digit");
    } else if (digitCount === 3) {
      setSizeClass("triple-digit");
    } else {
      setSizeClass("multi-digit");
    }
  }, [currentValue]);

  // Custom styles for the display based on selected colors
  const customStyles = {
    backgroundColor:
      displayMode === "black-screen" ? "#000000" : backgroundColor,
    color: fontColor,
    // Set cursor style based on whether mouse clicks are enabled
    cursor: mouseClickEnabled ? "pointer" : "default",
  };

  // Work image display mode - fullscreen overlay with logo, title, and clock
  if (displayMode === "work-image") {
    return (
      <div
        className="countdown-display"
        style={{
          ...customStyles,
          backgroundColor: "#000000",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div
          className="work-image-container"
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {imageError ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "#888888",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "15px" }}>
                Unable to load external image
              </div>
              <div style={{ fontSize: "1rem" }}>
                Please check your internet connection
              </div>
            </div>
          ) : (
            <>
              <img
                src={bgGradImage}
                alt="Banner"
                onError={() => setImageError(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  filter: "brightness(0.99)",
                  willChange: "transform",
                }}
              />
              {/* Dark overlay for additional dimming */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  pointerEvents: "none",
                  willChange: "transform",
                }}
              />
              {/* Fullscreen overlay with logo, title, and clock - always shown, clock can be toggled with Shift+C */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: `rgba(30, 30, 30, ${overlayOpacity})`,
                  WebkitBackdropFilter: "blur(8px)",
                  backdropFilter: "blur(8px)",
                  zIndex: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "30px",
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
              >
                {/* Logo */}
                <img
                  src={buuLogo}
                  alt="BUU Logo"
                  style={{
                    height: "193px",
                    width: "auto",
                    objectFit: "contain",
                    marginBottom: "10px",
                  }}
                />
                {/* Title */}
                <div
                  style={{
                    fontFamily: "'Sarabun', 'sans-serif'",
                    fontSize: showClock ? "3.68rem" : "4.42rem",
                    fontWeight: "bold",
                    color: "#C9A227",
                    textAlign: "center",
                    letterSpacing: "0.05em",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    transition: "font-size 0.3s ease",
                  }}
                >
                  <div>พิธีพระราชทานปริญญาบัตร</div>
                  <div>มหาวิทยาลัยบูรพา</div>
                </div>
                {/* Clock - toggle with Shift+C */}
                {showClock && (
                  <div
                    style={{
                      fontSize: "12rem",
                      fontWeight: "bold",
                      color: "#C9A227",
                      textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
                      letterSpacing: "0.1em",
                      marginTop: "-20px",
                    }}
                  >
                    {currentTime.toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-display" style={customStyles}>
      {displayMode === "normal" && (
        <div
          className={`current-number ${sizeClass}`}
          style={{ color: fontColor }}
        >
          <span>{currentValue}</span>
        </div>
      )}

      {isCountingDown && countdownRate > 0 && currentValue > 0 && displayMode === "normal" && (() => {
        // Calculate estimated time remaining
        const estimatedSecondsRemaining = Math.round((currentValue / countdownRate) * 60);
        const hours = Math.floor(estimatedSecondsRemaining / 3600);
        const minutes = Math.floor((estimatedSecondsRemaining % 3600) / 60);
        const seconds = estimatedSecondsRemaining % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const receivedCount = totalValue - currentValue;
        
        return (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "1rem",
              color: "#7a7a7a",
              textAlign: "center",
            }}
          >
            รับแล้ว <span style={{ color: "#a0a0a0" }}>{receivedCount}</span> คน | อัตรารับ <span style={{ color: "#a0a0a0" }}>{Math.round(countdownRate)}</span> คน/นาที เหลือเวลา <span style={{ color: "#a0a0a0" }}>{timeString}</span>
          </div>
        );
      })()}

      {displayMode === "normal" && (countdownSets.length > 0 || eventTitle) && (
        <div
          style={{
            position: "fixed",
            top: "25px",
            left: "25px",
            padding: "12px 24px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "8px",
            zIndex: 101,
            opacity: isCountingDown ? 0.4 : 0.8,
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <img
              src={buuLogo}
              alt="BUU Logo"
              style={{
                height: "3rem",
                width: "auto",
                objectFit: "contain",
              }}
            />
            {eventTitle && (
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  color: "#FFD700",
                  borderRight: countdownSets.length > 0 ? `2px solid #FFD70040` : "none",
                  paddingRight: countdownSets.length > 0 ? "15px" : "0",
                }}
              >
                {eventTitle}
              </div>
            )}
            {countdownSets.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                {countdownSets
                  .filter((set, index) => index >= setIndex)
                  .map((set, index) => {
                    const actualIndex = index + setIndex;
                    return (
                      <div
                        key={actualIndex}
                        style={{
                          fontSize: actualIndex === setIndex ? "1.56rem" : "1.3rem",
                          fontWeight: actualIndex === setIndex ? "700" : "500",
                          color: actualIndex === setIndex ? "#FFD700" : "#999999",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "all 0.3s ease",
                          backgroundColor: actualIndex === setIndex ? "rgba(255, 255, 255, 0.15)" : "transparent",
                          padding: actualIndex === setIndex ? "8px 16px" : "8px 0",
                          borderRadius: actualIndex === setIndex ? "8px" : "0",
                        }}
                      >
                        <span>{set.name} :</span>
                        
                        <span style={{ fontSize: actualIndex === setIndex ? "1.68rem" : "1.4rem", fontWeight: "700" }}>
                          {set.startValue}
                        </span>
                        <span style={{ fontSize: actualIndex === setIndex ? "1.2rem" : "1rem" }}>คน</span>
                        
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {!isCountingDown && currentValue > 0 && displayMode === "normal" && (
        <div className="start-hint">
          {mouseClickEnabled
            ? "Press Enter/Space or Click"
            : "Press Enter or Space"}
        </div>
      )}

      {showNextSetHint && displayMode === "normal" && (
        <div className="next-set-hint">Press Shift+N to go to the next set</div>
      )}

      {totalValue > 0 && displayMode === "normal" && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "6px",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            zIndex: 50,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(currentValue / totalValue) * 100}%`,
              backgroundColor: fontColor,
              opacity: 0.4,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CountdownDisplay;
