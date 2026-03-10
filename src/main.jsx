import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initBlockly } from './blockly/initBlockly.js'

initBlockly()

createRoot(document.getElementById('root')).render(
  <App />
)
