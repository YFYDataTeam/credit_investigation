import React from 'react';
import { createRoot } from 'react-dom/client';

// it will read the index.jsx in default
import App from './MainPage';

const root = createRoot(document.getElementById('app'));

root.render(<App />);
