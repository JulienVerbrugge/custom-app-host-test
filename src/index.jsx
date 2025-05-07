import './styles/global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IframeExtension from './components/IframeExtension';
import IframeTokenDecode from './components/IframeTokenDecode';
import { ThemeProvider } from 'styled-components';
import { connectorTheme } from 'akeneo-design-system';

const HomePage = () => <div>Hello world</div>;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={connectorTheme}>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/iframe-extension" element={<IframeExtension />} />
        <Route path="/iframe-token-decode" element={<IframeTokenDecode />} />
      </Routes>
    </Router>
  </ThemeProvider>
);