import { useState, useEffect, useCallback, useRef } from "react";
import "../App.css";

function CountUpPage() {
  const [count, setCount] = useState(0);
  const [tapTimes, setTapTimes] = useState([]); // เวลาของทุกการเคาะ
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // เวลาที่ผ่านไป (วินาที)
  const [isRunning, setIsRunning] = useState(false); // สถานะการจับเวลา
  const [rateHistory, setRateHistory] = useState([]); // ประวัติอัตราการนับสำหรับกราฟ
  const [currentRate, setCurrentRate] = useState(0); // อัตราการนับปัจจุบัน
  const [minutePaces, setMinutePaces] = useState([]); // อัตราเคาะทุก 1 นาที
  const [lastMinuteCount, setLastMinuteCount] = useState(0); // จำนวนเคาะ ณ นาทีก่อนหน้า
  const [fontColor, setFontColor] = useState(() => {
    return localStorage.getItem("countUpFontColor") || "#ffee00";
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem("countUpBackgroundColor") || "#666363";
  });
  const [showControls, setShowControls] = useState(false);
  
  const displayRef = useRef(null);
  const timerRef = useRef(null);
  const TARGET_RATE = 32; // ค่ากลาง 32 ครั้ง/นาที

  // คำนวณอัตราการนับจากช่วงเวลาระหว่างการเคาะ
  const calculateRateFromTaps = useCallback(() => {
    if (tapTimes.length < 2) return 0;
    
    // คำนวณจากเคาะแรกถึงเคาะสุดท้าย
    const firstTap = tapTimes[0];
    const lastTap = tapTimes[tapTimes.length - 1];
    const totalTimeSeconds = (lastTap - firstTap) / 1000;
    
    if (totalTimeSeconds <= 0) return 0;
    
    // จำนวนช่วง = จำนวนเคาะ - 1
    const intervals = tapTimes.length - 1;
    // อัตรา = จำนวนช่วง / เวลา(นาที)
    const rate = intervals / (totalTimeSeconds / 60);
    
    return rate;
  }, [tapTimes]);

  // Timer - อัพเดททุก 1 วินาที
  useEffect(() => {
    if (isRunning && tapTimes.length > 0) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - tapTimes[0]) / 1000);
        setElapsedSeconds(elapsed);
        
        // คำนวณและบันทึกอัตราการนับทุก 1 วินาที
        const rate = calculateRateFromTaps();
        setCurrentRate(rate);
        
        if (rate > 0) {
          setRateHistory(prev => [...prev, rate]);
        }
        
        // บันทึก pace ทุก 1 นาที
        const currentMinute = Math.floor(elapsed / 60);
        if (currentMinute > 0 && currentMinute > minutePaces.length) {
          // คำนวณจำนวนเคาะในนาทีที่ผ่านมา
          const tapsInLastMinute = count - lastMinuteCount;
          setMinutePaces(prev => [...prev, { pace: tapsInLastMinute, total: count }]);
          setLastMinuteCount(count);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, tapTimes, calculateRateFromTaps, count, minutePaces.length, lastMinuteCount]);

  // แปลงวินาทีเป็น mm:ss
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // บันทึกสีลง localStorage
  useEffect(() => {
    localStorage.setItem("countUpFontColor", fontColor);
  }, [fontColor]);

  useEffect(() => {
    localStorage.setItem("countUpBackgroundColor", backgroundColor);
  }, [backgroundColor]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    
    // เริ่มจับเวลาเมื่อเคาะครั้งแรก
    if (!isRunning) {
      setIsRunning(true);
    }
    
    // บันทึกเวลาเคาะและคำนวณอัตราทันที
    setTapTimes(prev => {
      const newTapTimes = [...prev, now];
      
      // คำนวณอัตราถ้ามีการเคาะมากกว่า 1 ครั้ง
      if (newTapTimes.length >= 2) {
        const firstTap = newTapTimes[0];
        const lastTap = newTapTimes[newTapTimes.length - 1];
        const totalTimeSeconds = (lastTap - firstTap) / 1000;
        if (totalTimeSeconds > 0) {
          const intervals = newTapTimes.length - 1;
          const rate = intervals / (totalTimeSeconds / 60);
          setCurrentRate(rate);
        }
      }
      return newTapTimes;
    });
    
    setCount(prev => prev + 1);
  }, [isRunning]);

  const handleReset = useCallback(() => {
    if (window.confirm("รีเซ็ตตัวนับและข้อมูลทั้งหมด?")) {
      setCount(0);
      setTapTimes([]);
      setElapsedSeconds(0);
      setIsRunning(false);
      setRateHistory([]);
      setCurrentRate(0);
      setMinutePaces([]);
      setLastMinuteCount(0);
    }
  }, []);

  const handlePauseResume = useCallback(() => {
    if (isRunning) {
      // หยุดจับเวลา
      setIsRunning(false);
    } else if (count > 0) {
      // ถ้ามีการเคาะแล้ว ให้เริ่มต่อ
      setIsRunning(true);
    }
  }, [isRunning, count]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space or Enter to tap
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleTap();
      }
      // 'R' to reset
      else if (e.code === "KeyR" && e.shiftKey) {
        e.preventDefault();
        handleReset();
      }
      // 'C' to toggle controls
      else if (e.code === "KeyC" && e.shiftKey) {
        e.preventDefault();
        setShowControls(prev => !prev);
      }
      // 'P' to pause/resume timer
      else if (e.code === "KeyP" && !e.shiftKey) {
        e.preventDefault();
        handlePauseResume();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTap, handleReset, handlePauseResume]);

  // Mouse click to tap
  const handleDisplayClick = useCallback((e) => {
    if (!showControls) {
      handleTap();
    }
  }, [showControls, handleTap]);

  // Determine size class for count display
  const getSizeClass = () => {
    const digitCount = count.toString().length;
    if (digitCount <= 1) return "single-digit";
    if (digitCount === 2) return "double-digit";
    if (digitCount === 3) return "triple-digit";
    return "multi-digit";
  };

  // ค่าแกน Y คงที่ 22-42
  const Y_MIN = 22;
  const Y_MAX = 42;

  // สร้าง SVG path สำหรับกราฟ
  const generateGraphPath = () => {
    if (rateHistory.length < 2) return "";
    
    const width = 100; // เปอร์เซ็นต์
    const height = 100;
    
    const points = rateHistory.map((rate, index) => {
      const x = (index / (rateHistory.length - 1)) * width;
      // จำกัดค่าให้อยู่ในช่วง Y_MIN - Y_MAX
      const clampedRate = Math.max(Y_MIN, Math.min(Y_MAX, rate));
      const y = height - ((clampedRate - Y_MIN) / (Y_MAX - Y_MIN)) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(" L ")}`;
  };

  // คำนวณตำแหน่ง Y ของเส้นค่ากลาง (32)
  const getTargetLineY = () => {
    return 100 - ((TARGET_RATE - Y_MIN) / (Y_MAX - Y_MIN)) * 100;
  };

  return (
    <div className="app-container">
      <div
        ref={displayRef}
        className="countdown-display"
        onClick={handleDisplayClick}
        style={{
          backgroundColor: backgroundColor,
          color: fontColor,
          cursor: showControls ? "default" : "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Graph */}
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* เส้นค่ากลาง 32 ครั้ง/นาที */}
          <line
            x1="0"
            y1={getTargetLineY()}
            x2="100"
            y2={getTargetLineY()}
            stroke={fontColor}
            strokeWidth="0.3"
            strokeDasharray="2,2"
            opacity="0.3"
          />
          {/* กราฟอัตราการนับ */}
          {rateHistory.length >= 2 && (
            <path
              d={generateGraphPath()}
              fill="none"
              stroke={fontColor}
              strokeWidth="0.5"
              opacity="0.25"
            />
          )}
        </svg>

        <div className={`current-number ${getSizeClass()}`} style={{ color: fontColor, position: "relative", zIndex: 1 }}>
          <span>{count}</span>
        </div>

        {/* Timer display - top left */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "30px",
            color: fontColor,
            opacity: 0.9,
            fontFamily: "monospace",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1rem", marginBottom: "5px" }}>เวลาที่รัน</div>
              <span style={{ fontSize: "3.5rem", fontWeight: "bold" }}>
                {formatTime(elapsedSeconds)}
              </span>
            </div>
            {isRunning && (
              <span style={{ 
                width: "15px", 
                height: "15px", 
                backgroundColor: "#00ff00", 
                borderRadius: "50%",
                boxShadow: "0 0 10px #00ff00",
              }} />
            )}
            {!isRunning && count > 0 && (
              <span style={{ 
                fontSize: "1rem",
                color: "#ff6600",
              }}>
                (หยุดชั่วคราว)
              </span>
            )}
          </div>
        </div>

        {/* Statistics display - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "30px",
            fontSize: "1.5rem",
            color: fontColor,
            opacity: 0.9,
            textAlign: "right",
            zIndex: 1,
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <strong>อัตราการนับ:</strong> {currentRate.toFixed(1)} ครั้ง/นาที
            {currentRate >= TARGET_RATE && (
              <span style={{ color: "#00ff00", marginLeft: "10px" }}>✓</span>
            )}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>เป้าหมาย:</strong> {TARGET_RATE} ครั้ง/นาที
          </div>
          <div>
            <strong>จำนวนเคาะทั้งหมด:</strong> {count} ครั้ง
          </div>
        </div>

        {/* Minute Paces - bottom left */}
        {minutePaces.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "30px",
              left: "30px",
              fontSize: "0.9rem",
              color: fontColor,
              opacity: 0.7,
              textAlign: "left",
              zIndex: 1,
              maxWidth: "200px",
            }}
          >
            <div style={{ marginBottom: "5px", fontSize: "1rem" }}>
              <strong>Pace ทุกนาที:</strong>
            </div>
            {minutePaces.map((item, index) => (
              <div key={index} style={{ 
                display: "flex", 
                justifyContent: "space-between",
                padding: "2px 0",
                color: item.pace >= TARGET_RATE ? "#00ff00" : fontColor,
              }}>
                <span>นาทีที่ {index + 1}:</span>
                <span style={{ marginLeft: "10px" }}>{item.pace} ครั้ง ({item.total})</span>
              </div>
            ))}
          </div>
        )}

        {count === 0 && (
          <div className="start-hint" style={{ zIndex: 1 }}>
            กดเคาะ: Space / Enter / Click
          </div>
        )}
      </div>

      {/* Control Panel Toggle Button */}
      <button
        className="control-toggle-button"
        onClick={() => setShowControls(!showControls)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          fontSize: "1rem",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          color: "#fff",
          border: "2px solid rgba(255, 255, 255, 0.5)",
          borderRadius: "8px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        {showControls ? "ซ่อนการตั้งค่า" : "แสดงการตั้งค่า"}
      </button>

      {/* Control Panel */}
      {showControls && (
        <div
          className="control-panel"
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            padding: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            borderRadius: "10px",
            zIndex: 1000,
            maxWidth: "350px",
            color: "#fff",
          }}
        >
          <h3 style={{ marginTop: 0 }}>การตั้งค่า</h3>

          <div style={{ marginBottom: "15px" }}>
            <label>
              สีตัวเลข:
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                style={{ marginLeft: "10px", cursor: "pointer" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              สีพื้นหลัง:
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                style={{ marginLeft: "10px", cursor: "pointer" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <button
              onClick={handleReset}
              style={{
                padding: "10px 20px",
                fontSize: "1rem",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              รีเซ็ต
            </button>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <button
              onClick={handlePauseResume}
              style={{
                padding: "10px 20px",
                fontSize: "1rem",
                backgroundColor: isRunning ? "#ffc107" : "#28a745",
                color: isRunning ? "#000" : "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              {isRunning ? "หยุดจับเวลา" : "เริ่มจับเวลาต่อ"}
            </button>
          </div>

          <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
            <p><strong>คีย์ลัด:</strong></p>
            <p>Space/Enter: เคาะนับ</p>
            <p>P: หยุด/เริ่มจับเวลา</p>
            <p>Shift+R: รีเซ็ต</p>
            <p>Shift+C: แสดง/ซ่อนการตั้งค่า</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CountUpPage;
