import './styles/app.css';

import AuthWrapper from './auth/AuthWrapper';
import RouteRenderer from './components/structure/RouteRenderer';

function App() {
  return (
    <AuthWrapper>
      <RouteRenderer />
    </AuthWrapper>
  );
}

export default App;
