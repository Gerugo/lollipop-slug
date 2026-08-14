import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Lollipop Slug] React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center font-candy select-none">
          <div className="text-4xl mb-4">🍭⚠️</div>
          <h1 className="text-2xl font-bungee text-candy-pink mb-2">¡Ups! Ocurrió un error al cargar</h1>
          <p className="text-sm text-slate-300 max-w-md mb-6">
            {this.state.error?.message || 'Error inesperado al inicializar los componentes.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 candy-button-pink rounded-2xl font-bungee text-sm text-white"
          >
            REINICIAR JUEGO
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
