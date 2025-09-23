import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';
import MindMusicBox from './MindMusicBox';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MindMusicBox />
     <App />
  </StrictMode>,
)
