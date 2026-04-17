import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import Deployments from './pages/Deployments';
import Deploy from './pages/Deploy';
import Monitor from './pages/Monitor';
import Tasklist from './pages/Tasklist';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Deployments />} />
            <Route path="deploy" element={<Deploy />} />
            <Route path="monitor" element={<Monitor />} />
            <Route path="tasks" element={<Tasklist />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
