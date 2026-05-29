import { useNavigate } from 'react-router-dom';

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">403</p>
        <h1 className="text-xl font-bold text-gray-900 mt-4">Acceso denegado</h1>
        <p className="text-gray-500 text-sm mt-2">
          No tenés permisos para ver esta página.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};
