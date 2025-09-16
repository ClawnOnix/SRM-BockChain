import React, { useState } from 'react';
import { UserIcon, LockIcon, ArrowRightIcon } from 'lucide-react';
import { Logo } from './Logo';
import { useNavigate } from 'react-router-dom';
export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error de autenticación');
        setLoading(false);
        return;
      }
  const user = await res.json();
  localStorage.setItem('user', JSON.stringify(user));
  if (user.ID_Usuario) {
    localStorage.setItem('user_id', String(user.ID_Usuario));
  }
  setLoading(false);
  // Role-based redirect
  if (user.Rol === 'medico') navigate('/dashboard');
  else if (user.Rol === 'paciente') navigate('/patient-dashboard');
  else if (user.Rol === 'farmacia') navigate('/pharmacy-dashboard');
  else if (user.Rol === 'regulador') navigate('/regulator-dashboard');
  else navigate('/');
    } catch (err) {
      setError('Error de red o servidor');
      setLoading(false);
    }
  };
  return <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            Iniciar Sesión
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="username" name="username" type="text" required value={username} onChange={e => setUsername(e.target.value)} className="bg-[#0f172a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent" placeholder="Ingrese su usuario" />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-[#0f172a] text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ade80] focus:border-transparent" placeholder="Ingrese su contraseña" />
                  </div>
                </div>
              </div>
              {error && <div className="text-red-400 text-sm text-center">{error}</div>}
              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-[#4ade80] hover:bg-[#22c55e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ade80] transition-colors disabled:opacity-50">
                  {loading ? 'Ingresando...' : 'Ingresar'}
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
              </div>
            </form>
        </div>
      </div>
      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>SRM-Blockchain © 2023</p>
        <p className="mt-1">Cumple con HIPAA y GDPR</p>
      </footer>
    </div>;
}