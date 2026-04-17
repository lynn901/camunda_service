import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Models } from './pages/Models';
import { Instances } from './pages/Instances';
import { History } from './pages/History';
import { Workers } from './pages/Workers';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/models" element={<Models />} />
          <Route path="/instances" element={<Instances />} />
          <Route path="/history" element={<History />} />
          <Route path="/workers" element={<Workers />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
