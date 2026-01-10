import React, { useEffect, useState } from "react";
import bgGradImage from "../assets/bg-grad.png";

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
}) => {
  const [sizeClass, setSizeClass] = useState("");
  const [imageError, setImageError] = useState(false);

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

  // Work image display mode - using external URL with fullscreen styling
  if (displayMode === "work-image") {
    return (
      <div
        className="countdown-display"
        style={{
          ...customStyles,
          backgroundColor: "#000000", // Pure black background
          position: "fixed", // Changed to fixed positioning
          top: 0,
          left: 0,
          width: "100vw", // Use viewport width
          height: "100vh", // Use viewport height
          margin: 0,
          padding: 0,
          overflow: "hidden", // Prevent scrolling
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
                  filter: "brightness(0.9)", // Reduce brightness to 90%
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
                  backgroundColor: "rgba(0, 0, 0, 0.2)", // 20% black overlay
                  pointerEvents: "none",
                }}
              />
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
        
        return (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "1rem",
              color: "#5a5a5a",
              textAlign: "center",
            }}
          >
            {Math.round(countdownRate)} # {timeString}
          </div>
        );
      })()}

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
    </div>
  );
};

export default CountdownDisplay;
