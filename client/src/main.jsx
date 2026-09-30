import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import store from './redux/store.js'
import { Provider } from 'react-redux'
import { installAuthInterceptor } from './lib/axiosAuth.js'

// A stale session cookie must log the user out rather than silently
// emptying every page. Installed before the first render so no request
// can slip past it.
installAuthInterceptor()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
    <Toaster />
  </StrictMode>,
)