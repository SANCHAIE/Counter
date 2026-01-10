import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Navigation() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Show navigation when mouse is in top-left corner (within 100px from top and left)
      if (e.clientX < 100 && e.clientY < 100) {
        setIsVisible(true);
      } else if (e.clientX > 300 || e.clientY > 150) {
        // Hide when mouse moves away
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const navStyle = {
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 1000,
    display: "flex",
    gap: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: "10px 15px",
    borderRadius: "10px",
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateX(0)" : "translateX(-120%)",
    transition: "all 0.3s ease",
    pointerEvents: isVisible ? "auto" : "none",
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#ffee00" : "#fff",
    textDecoration: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    backgroundColor: location.pathname === path ? "rgba(255, 238, 0, 0.2)" : "transparent",
    border: location.pathname === path ? "2px solid #ffee00" : "2px solid transparent",
    fontSize: "1rem",
    fontWeight: location.pathname === path ? "bold" : "normal",
    transition: "all 0.3s ease",
  });

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle("/")}>
        นับถอยหลัง
      </Link>
      <Link to="/countup" style={linkStyle("/countup")}>
        นับขึ้น
      </Link>
    </nav>
  );
}

export default Navigation;
