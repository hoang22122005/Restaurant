import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => (
  <BrowserRouter>
    <SiteProvider>
      <AppRoutes />
    </SiteProvider>
  </BrowserRouter>
);

export default App;
