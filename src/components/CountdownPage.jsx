import { useState, useEffect, useCallback, useRef } from "react";
import "../App.css";
import CountdownDisplay from "./CountdownDisplay";
import ControlPanel from "./ControlPanel";
import workImg from "../assets/work.png";

function CountdownPage() {
  // Load color preferences from localStorage or use NEW DEFAULT VALUES
  const [fontColor, setFontColor] = useState(() => {
    return localStorage.getItem("countdownFontColor") || "#ffee00"; // New default: bright yellow
  });

  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem("countdownBackgroundColor") || "#666363"; // New default: medium gray
  });

  const [countdownSets, setCountdownSets] = useState(() => {
    // Load from localStorage on initial render
    const savedSets = localStorage.getItem("countdownSets");
    return savedSets ? JSON.parse(savedSets) : [];
  });

  const [currentSetIndex, setCurrentSetIndex] = useState(() => {
    // Load current set index from localStorage
    const savedIndex = localStorage.getItem("currentSetIndex");
    return savedIndex ? parseInt(savedIndex) : 0;
  });

  const [showControls, setShowControls] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(() => {
    // Load counting state from localStorage
    const savedState = localStorage.getItem("isCountingDown");
    return savedState ? JSON.parse(savedState) : false;
  });

  // Add new state for showing the "next set" hint
  const [showNextSetHint, setShowNextSetHint] = useState(false);
  const [reachedZero, setReachedZero] = useState(false);

  // Track if a key or mouse button is currently being held down
  const [isKeyHeld, setIsKeyHeld] = useState(false);
  const [isMouseHeld, setIsMouseHeld] = useState(false);

  // New state for control panel indicator
  const [showControlIndicator, setShowControlIndicator] = useState(false);

  // New state for display modes
  const [displayMode, setDisplayMode] = useState("normal"); // "normal", "black-screen", "work-image"

  // New state for mouse click enablement
  const [mouseClickEnabled, setMouseClickEnabled] = useState(() => {
    const savedState = localStorage.getItem("mouseClickEnabled");
    return savedState ? JSON.parse(savedState) : true; // Default to enabled
  });

  // State for tracking countdown rate (counts per minute)
  const [countdownTimes, setCountdownTimes] = useState([]); // timestamps of each countdown
  const [countdownRate, setCountdownRate] = useState(0); // current rate
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // elapsed time since start
  const timerIntervalRef = useRef(null);

  // Reference to the display area for click handling
  const displayRef = useRef(null);

  // Save color settings to localStorage
  useEffect(() => {
    localStorage.setItem("countdownFontColor", fontColor);
  }, [fontColor]);

  useEffect(() => {
    localStorage.setItem("countdownBackgroundColor", backgroundColor);
  }, [backgroundColor]);

  // Save mouse click setting to localStorage
  useEffect(() => {
    localStorage.setItem(
      "mouseClickEnabled",
      JSON.stringify(mouseClickEnabled)
    );
  }, [mouseClickEnabled]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("countdownSets", JSON.stringify(countdownSets));
  }, [countdownSets]);

  useEffect(() => {
    localStorage.setItem("currentSetIndex", currentSetIndex.toString());
  }, [currentSetIndex]);

  useEffect(() => {
    localStorage.setItem("isCountingDown", JSON.stringify(isCountingDown));
  }, [isCountingDown]);

  // Timer to track elapsed time and calculate rate
  useEffect(() => {
    if (isCountingDown && countdownTimes.length > 0) {
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - countdownTimes[0]) / 1000);
        setElapsedSeconds(elapsed);
        
        // Calculate rate from countdown times
        if (countdownTimes.length >= 2) {
          const firstTime = countdownTimes[0];
          const lastTime = countdownTimes[countdownTimes.length - 1];
          const timeElapsedSeconds = (lastTime - firstTime) / 1000;
          
          if (timeElapsedSeconds > 0) {
            const intervals = countdownTimes.length - 1;
            const rate = intervals / (timeElapsedSeconds / 60);
            setCountdownRate(rate);
          }
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isCountingDown, countdownTimes]);

  // Show control indicator periodically if controls are hidden
  useEffect(() => {
    if (!showControls && !isCountingDown) {
      // Show the indicator every 30 seconds for 5 seconds
      const indicatorInterval = setInterval(() => {
        setShowControlIndicator(true);

        // Hide it after 5 seconds
        setTimeout(() => {
          setShowControlIndicator(false);
        }, 5000);
      }, 30000);

      // Also show it initially for new users
      if (countdownSets.length === 0) {
        setShowControlIndicator(true);
        setTimeout(() => {
          setShowControlIndicator(false);
        }, 5000);
      }

      return () => {
        clearInterval(indicatorInterval);
      };
    } else {
      setShowControlIndicator(false);
    }
  }, [showControls, isCountingDown, countdownSets.length]);

  // Check if current set has reached zero to show the next set hint
  useEffect(() => {
    if (
      countdownSets.length > 0 &&
      currentSetIndex < countdownSets.length &&
      countdownSets[currentSetIndex].currentValue === 0 &&
      isCountingDown
    ) {
      // Show "Press Shift+N to go to the next set" hint
      setShowNextSetHint(true);
      setReachedZero(true);

      // Automatically pause counting
      setIsCountingDown(false);
    } else if (
      countdownSets.length > 0 &&
      currentSetIndex < countdownSets.length &&
      countdownSets[currentSetIndex].currentValue > 0
    ) {
      // Reset flags when value is greater than 0
      setShowNextSetHint(false);
      setReachedZero(false);
    }
  }, [countdownSets, currentSetIndex, isCountingDown]);

  const addCountdownSet = (startValue) => {
    setCountdownSets([
      ...countdownSets,
      { startValue, currentValue: startValue },
    ]);
  };

  const resetAllSets = () => {
    setCountdownSets(
      countdownSets.map((set) => ({ ...set, currentValue: set.startValue }))
    );
    setIsCountingDown(false);
    setCountdownTimes([]);
    setCountdownRate(0);
    setElapsedSeconds(0);
  };

  const resetCurrentSet = () => {
    if (countdownSets.length === 0) return;

    setCountdownSets((prevSets) => {
      const newSets = [...prevSets];
      newSets[currentSetIndex] = {
        ...newSets[currentSetIndex],
        currentValue: newSets[currentSetIndex].startValue,
      };
      return newSets;
    });
    setIsCountingDown(false);
    setCountdownTimes([]);
    setCountdownRate(0);
    setElapsedSeconds(0);
  };

  const decrementCurrentSet = useCallback(() => {
    if (countdownSets.length === 0 || !isCountingDown) return;

    // Track countdown timestamp
    const now = Date.now();
    
    setCountdownTimes(prev => [...prev, now]);

    setCountdownSets((prevSets) => {
      const newSets = [...prevSets];
      // Only decrement if the current value is greater than zero
      if (newSets[currentSetIndex].currentValue > 0) {
        newSets[currentSetIndex] = {
          ...newSets[currentSetIndex],
          currentValue: newSets[currentSetIndex].currentValue - 1,
        };
      }
      return newSets;
    });
  }, [countdownSets, currentSetIndex, isCountingDown]);

  // Move to the next set
  const moveToNextSet = useCallback(() => {
    if (countdownSets.length <= 1) return;

    // Calculate the next index with wraparound
    const nextIndex = (currentSetIndex + 1) % countdownSets.length;
    setCurrentSetIndex(nextIndex);

    // Start the countdown for the new set
    setIsCountingDown(true);
  }, [countdownSets.length, currentSetIndex]);

  // Handle keyboard events for counting
  useEffect(() => {
    // These keys will trigger the countdown
    const countKeys = ["Enter", " ", "Space"];

    const handleKeyDown = (e) => {
      // Handle Shift+1 to show black screen (no numbers)
      if ((e.key === "1" || e.key === "!") && e.shiftKey) {
        e.preventDefault();
        console.log("Shift+1 pressed, toggling black screen mode");
        setDisplayMode((prev) =>
          prev === "black-screen" ? "normal" : "black-screen"
        );
        return;
      }

      // Handle Shift+2 to show work image
      if ((e.key === "2" || e.key === "@") && e.shiftKey) {
        e.preventDefault();
        console.log(workImg);
        console.log("Shift+2 pressed, toggling work-image mode");
        setDisplayMode((prev) =>
          prev === "work-image" ? "normal" : "work-image"
        );
        return;
      }

      // Handle Shift+N key for next set navigation when current set is at 0
      if (e.key === "N" && e.shiftKey && reachedZero) {
        e.preventDefault();
        moveToNextSet();
        return;
      }

      // Handle Shift+R key for resetting current set
      if (e.key === "R" && e.shiftKey) {
        e.preventDefault();
        resetCurrentSet();
        return;
      }

      // Check if it's one of our count keys
      if (countKeys.includes(e.code) || countKeys.includes(e.key)) {
        e.preventDefault(); // Prevent page scrolling on spacebar

        // Only process if the key wasn't already being held down
        if (!isKeyHeld) {
          setIsKeyHeld(true);

          if (!isCountingDown && countdownSets.length > 0) {
            // Start countdown and add first timestamp
            const now = Date.now();
            setCountdownTimes([now]);
            setIsCountingDown(true);
          } else if (isCountingDown) {
            // Single press mode - manually decrement on each press
            decrementCurrentSet();
          }
        }
      } else if (e.key === "Escape") {
        setShowControls((prev) => !prev);
      }
    };

    const handleKeyUp = (e) => {
      // Reset key held state when the key is released
      if (countKeys.includes(e.code) || countKeys.includes(e.key)) {
        setIsKeyHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    decrementCurrentSet,
    isCountingDown,
    countdownSets.length,
    currentSetIndex,
    isKeyHeld,
    moveToNextSet,
    reachedZero,
    resetCurrentSet,
  ]);

  // Handle mouse movement to show/hide controls
  const handleMouseMove = (e) => {
    // Show controls when mouse is near the right edge of the screen
    const edgeThreshold = 50;
    const { clientX } = e;
    const { innerWidth } = window;

    if (clientX >= innerWidth - edgeThreshold) {
      setShowControls(true);
    } else if (showControls && clientX < innerWidth - 350) {
      // Hide controls when mouse moves away from the panel
      setShowControls(false);
    }
  };

  // Handle mouse clicks on the display
  const handleDisplayMouseDown = () => {
    if (showControls) {
      // If controls are visible, don't trigger countdown actions
      return;
    }

    // Only process if mouse clicks are enabled and the mouse wasn't already being held down
    if (mouseClickEnabled && !isMouseHeld) {
      setIsMouseHeld(true);

      if (!isCountingDown && countdownSets.length > 0) {
        // Start countdown and add first timestamp
        const now = Date.now();
        setCountdownTimes([now]);
        setIsCountingDown(true);
      } else if (isCountingDown) {
        // Single press mode - manually decrement on each click
        decrementCurrentSet();
      }
    }
  };

  // Reset mouse held state on mouse up
  const handleDisplayMouseUp = () => {
    setIsMouseHeld(false);
  };

  // Change current set manually
  const changeCurrentSet = (index) => {
    setCurrentSetIndex(index);
  };

  const currentValue = countdownSets[currentSetIndex]?.currentValue ?? 0;

  return (
    <div className="app-container" onMouseMove={handleMouseMove}>
      {/* Control panel indicator */}
      <div
        className={`control-panel-indicator ${
          showControlIndicator ? "visible" : "hidden"
        }`}
      />

      <div
        className="display-container"
        onMouseDown={handleDisplayMouseDown}
        onMouseUp={handleDisplayMouseUp}
        onMouseLeave={handleDisplayMouseUp}
        ref={displayRef}
      >
        <CountdownDisplay
          currentValue={currentValue}
          isCountingDown={isCountingDown}
          showNextSetHint={showNextSetHint}
          fontColor={fontColor}
          backgroundColor={backgroundColor}
          displayMode={displayMode}
          mouseClickEnabled={mouseClickEnabled}
          countdownRate={countdownRate}
          elapsedSeconds={elapsedSeconds}
        />

        <ControlPanel
          visible={showControls || false}
          onAddSet={addCountdownSet}
          onResetAll={resetAllSets}
          onResetCurrent={resetCurrentSet}
          countdownSets={countdownSets}
          isCountingDown={isCountingDown}
          setIsCountingDown={setIsCountingDown}
          onEditSet={(index, newValue) => {
            setCountdownSets((prevSets) => {
              const newSets = [...prevSets];
              newSets[index] = {
                startValue: newValue,
                currentValue: isCountingDown
                  ? newSets[index].currentValue
                  : newValue,
              };
              return newSets;
            });
          }}
          onRemoveSet={(index) => {
            setCountdownSets((prevSets) => {
              const newSets = [...prevSets];
              newSets.splice(index, 1);
              if (currentSetIndex >= newSets.length) {
                setCurrentSetIndex(Math.max(0, newSets.length - 1));
              }
              return newSets;
            });
          }}
          currentSetIndex={currentSetIndex}
          onSelectSet={changeCurrentSet}
          fontColor={fontColor}
          setFontColor={setFontColor}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
          mouseClickEnabled={mouseClickEnabled}
          setMouseClickEnabled={setMouseClickEnabled}
        />
      </div>
    </div>
  );
}

export default CountdownPage;
