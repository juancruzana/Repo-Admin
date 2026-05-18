import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { AppRouter } from './router/AppRouter';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <AppRouter />
        </main>
      </div>
    </BrowserRouter>
  );
}
