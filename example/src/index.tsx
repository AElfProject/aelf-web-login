import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function Usage() {
  return <div></div>;
}

function App() {
  return <Usage></Usage>;
}
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
