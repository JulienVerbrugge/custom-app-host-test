import './styles/global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import IframeExtension from './components/IframeExtension';
import { ThemeProvider } from 'styled-components';
import { connectorTheme } from 'akeneo-design-system';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={connectorTheme}>
    <IframeExtension />
  </ThemeProvider>
);