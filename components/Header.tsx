
import React from 'react';
import { User } from '../types';
import { LogoIcon } from './icons';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onNavigateToLogin: () => void;
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigateToLogin, onNavigateHome }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={onNavigateHome}
        >
          <LogoIcon className="h-8 w-8 text-blue-600" />
          <span className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
            INSPIRA
            <span className="text-blue-600">.CURSOS</span>
          </span>
        </div>
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden sm:inline text-gray-600">
                Olá, <span className="font-semibold">{user.name.split(' ')[0]}</span>
              </span>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300 text-sm font-medium"
              >
                Sair
              </button>
            </>
          ) : (
            <button
              onClick={onNavigateToLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 text-sm font-medium"
            >
              Entrar
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
