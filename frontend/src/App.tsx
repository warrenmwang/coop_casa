import './styles/app.css';
import CreateAccountForm from './components/CreateAccount';
import Home from './components/Home';
import About from './components/About';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from './components/Contact';
import Communities from './components/Communities';
import Map from './components/Map';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/createAccount" element={<CreateAccountForm />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/map" element={<Map />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<Contact />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
