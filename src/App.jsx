import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import CountdownPage from "./components/CountdownPage";
import CountUpPage from "./components/CountUpPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CountdownPage />} />
        <Route path="/countup" element={<CountUpPage />} />
      </Routes>
    </Router>
  );
}

export default App;
