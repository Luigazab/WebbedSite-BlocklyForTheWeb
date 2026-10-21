import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installChunkRecovery } from './lib/chunkRecovery'

installChunkRecovery()

createRoot(document.getElementById('root')).render(
  <App />
)
