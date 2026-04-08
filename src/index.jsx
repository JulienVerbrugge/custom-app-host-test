import './styles/global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IframeExtension from './components/IframeExtension';
import { ThemeProvider } from 'styled-components';
import { color, connectorTheme } from 'akeneo-design-system';

const HomePage = () => (
  <div>
    Hello <span style={{ color: "#58316f"}}world ></span>
    <br />
    <a href="/iframe-extension">Iframe Extension</a>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={connectorTheme}>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/iframe-extension" element={<IframeExtension />} />
      </Routes>
    </Router>
  </ThemeProvider>
);