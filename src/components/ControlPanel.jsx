// src/components/ControlPanel.jsx
import React, { useState } from "react";
import Footer from "./Footer";
import ColorCustomizationMenu from "./ColorCustomizationMenu";

const ControlPanel = ({
  visible,
  onAddSet,
  onResetAll,
  onResetCurrent,
  countdownSets,
  isCountingDown,
  setIsCountingDown,
  onEditSet,
  onRemoveSet,
  currentSetIndex,
  onSelectSet,
  fontColor,
  setFontColor,
  backgroundColor,
  setBackgroundColor,
  mouseClickEnabled,
  setMouseClickEnabled,
  eventTitle,
  setEventTitle,
  overlayOpacity,
  setOverlayOpacity,
}) => {
  const [newSetValue, setNewSetValue] = useState("");
  const [newSetName, setNewSetName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editName, setEditName] = useState("");

  const handleAddSet = () => {
    if (isCountingDown) return; // Prevent adding sets while counting down

    const value = parseInt(newSetValue);
    if (!isNaN(value) && value > 0) {
      onAddSet(value, newSetName);
      setNewSetValue("");
      setNewSetName("");
    }
  };

  const handleStartStop = () => {
    setIsCountingDown(!isCountingDown);
  };

  const startEditingSet = (index, currentValue, currentName) => {
    if (isCountingDown) return; // Prevent editing while counting down

    setEditingIndex(index);
    setEditValue(currentValue.toString());
    setEditName(currentName || "");
  };

  const saveEdit = (index) => {
    if (isCountingDown) return; // Prevent saving edits while counting down

    const value = parseInt(editValue);
    if (!isNaN(value) && value > 0) {
      onEditSet(index, value, editName);
      setEditingIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isCountingDown) {
      handleAddSet();
    }
  };

  return (
    <div className={`control-panel ${visible ? "visible" : "hidden"}`}>
      <div className="control-section">
        <h3>Event Title</h3>
        <div className="input-group">
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="e.g. พิธีพระราชทานปริญญาบัตร ปีการศึกษา 2567"
            disabled={isCountingDown}
          />
        </div>
      </div>

      <div className="control-section">
        <h3>Add Countdown Set</h3>
        <div className="input-group">
          <input
            type="text"
            value={newSetName}
            onChange={(e) => setNewSetName(e.target.value)}
            placeholder="Set name (optional)"
            disabled={isCountingDown}
          />
          <input
            type="number"
            min="1"
            value={newSetValue}
            onChange={(e) => setNewSetValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Starting value"
            disabled={isCountingDown}
          />
          <button
            onClick={handleAddSet}
            disabled={isCountingDown}
            className={isCountingDown ? "disabled-btn" : ""}
          >
            Add
          </button>
        </div>
      </div>

      <div className="control-section">
        <h3>Manage Sets</h3>
        {countdownSets.length === 0 ? (
          <p>No countdown sets added yet</p>
        ) : (
          <ul className="sets-list">
            {countdownSets.map((set, index) => (
              <li
                key={index}
                className={`${index === currentSetIndex ? "current-set" : ""} ${
                  isCountingDown ? "counting-set" : ""
                }`}
                onClick={() => !isCountingDown && onSelectSet(index)}
              >
                {editingIndex === index ? (
                  <div className="edit-set-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Set name (optional)"
                      disabled={isCountingDown}
                    />
                    <input
                      type="number"
                      min="1"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      disabled={isCountingDown}
                    />
                    <div className="edit-buttons">
                      <button
                        onClick={() => saveEdit(index)}
                        className={`save-btn ${
                          isCountingDown ? "disabled-btn" : ""
                        }`}
                        disabled={isCountingDown}
                      >
                        Save
                      </button>
                      <button onClick={cancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="set-item">
                    <div className="set-details">
                      <div className="set-icon">{index + 1}</div>
                      <div className="set-values">
                        <div className="set-name">
                          {set.name || `Set ${index + 1}`}
                        </div>
                        <div className="set-progress">
                          {set.currentValue} / {set.startValue}
                        </div>
                      </div>
                    </div>
                    <div className="set-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingSet(index, set.startValue, set.name);
                        }}
                        className={`icon-btn edit-btn ${
                          isCountingDown ? "disabled-btn" : ""
                        }`}
                        title="Edit set"
                        disabled={isCountingDown}
                      >
                        ✎
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isCountingDown) onRemoveSet(index);
                        }}
                        className={`icon-btn delete-btn ${
                          isCountingDown ? "disabled-btn" : ""
                        }`}
                        title="Remove set"
                        disabled={isCountingDown}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="control-section">
        <div className="button-group">
          {countdownSets.length > 0 && (
            <button onClick={handleStartStop} className="primary-btn">
              {isCountingDown ? "Pause" : "Start"}
            </button>
          )}
          <button
            onClick={onResetCurrent}
            className={isCountingDown ? "disabled-btn" : ""}
            disabled={isCountingDown}
          >
            Reset Set
          </button>
          <button
            onClick={onResetAll}
            className={isCountingDown ? "disabled-btn" : ""}
            disabled={isCountingDown}
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Interaction Options */}
      <div className="control-section">
        <h3>Interaction Options</h3>

        {/* Mouse Click Toggle */}
        <div className="mode-selection" style={{ marginBottom: "15px" }}>
          <div
            className={`mode-option ${mouseClickEnabled ? "selected" : ""}`}
            onClick={() => setMouseClickEnabled(true)}
          >
            Mouse Click Enabled
          </div>
          <div
            className={`mode-option ${!mouseClickEnabled ? "selected" : ""}`}
            onClick={() => setMouseClickEnabled(false)}
          >
            Mouse Click Disabled
          </div>
        </div>

        {/* Overlay Opacity Slider */}
        <div style={{ marginTop: "15px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#ccc" }}>
            ความโปร่งใสหน้าจอพัก: {Math.round(overlayOpacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>
      </div>

      {/* Color Customization Menu */}
      <ColorCustomizationMenu
        isCountingDown={isCountingDown}
        fontColor={fontColor}
        setFontColor={setFontColor}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />

      <div className="instructions">
        <h3>Instructions</h3>
        <ul>
          <li>
            Press <kbd>Enter</kbd> or <kbd>Space</kbd> to decrease number
          </li>
          <li>
            Press <kbd>Esc</kbd> to toggle controls
          </li>
          <li>
            Press <kbd>Shift+R</kbd> to reset current set
          </li>
          <li>
            Press <kbd>Shift+N</kbd> to move to next set when current set
            reaches 0
          </li>
          {mouseClickEnabled && (
            <li>Click on the display area to decrease when counting</li>
          )}
          <li>Move mouse to the right edge to show controls</li>
        </ul>
      </div>

      <Footer isCountingDown={false} />
    </div>
  );
};

export default ControlPanel;
