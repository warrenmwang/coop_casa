import './styles/app.css';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Dashboard from './components/pages/Dashboard';
import Contact from './components/pages/Contact';
import Communities from './components/pages/Communities';
import Map from './components/pages/Map';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsOfService from './components/pages/TermsOfService';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthWrapper from './auth/AuthWrapper';

function App() {
  return (
    <AuthWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/map" element={<Map />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/tos" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </AuthWrapper>
  );
}

export default App;
