import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#EAEAEA',
            border: '1px solid #1C1C1C',
            borderRadius: '12px',
            fontSize: '0.875rem',
          },
        }}
      />
    </Provider>
  </React.StrictMode>,
)
