
import React, { useState } from 'react';
import { api } from '../services/api';
import Spinner from '../components/Spinner';

interface CTStudentLoginPageProps {
  onRegisterSuccess: () => void;
  onBack: () => void;
}

const CTStudentLoginPage: React.FC<CTStudentLoginPageProps> = ({ onRegisterSuccess, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        ctCode: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        setIsLoading(true);
        try {
            await api.registerCTStudent(formData);
            onRegisterSuccess();
        } catch (err: any) {
            setError(err.message || 'Falha no cadastro. Verifique seu código de acesso e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Cadastro Aluno CT</h2>
                <p className="text-center text-gray-500 mb-8">Insira seus dados e o código de acesso fornecido.</p>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {Object.entries({
                        name: 'Nome Completo',
                        email: 'Email',
                        phone: 'Telefone',
                        password: 'Senha (mínimo 6 caracteres)',
                        confirmPassword: 'Confirmar Senha',
                        ctCode: 'Código de Acesso'
                    }).map(([key, label]) => (
                        <div key={key}>
                            <label htmlFor={key} className="block text-sm font-medium text-gray-700">{label}</label>
                            <input
                                id={key}
                                name={key}
                                type={key.includes('password') ? 'password' : (key === 'email' ? 'email' : 'text')}
                                value={formData[key as keyof typeof formData]}
                                onChange={handleChange}
                                required
                                minLength={key.includes('password') ? 6 : undefined}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    ))}
                    <div className="pt-2">
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                            {isLoading ? <Spinner size="sm" color="border-white" /> : 'Cadastrar'}
                        </button>
                    </div>
                </form>
                <p className="mt-8 text-center text-sm text-gray-600">
                    <button onClick={onBack} className="font-medium text-blue-600 hover:text-blue-500">
                        Voltar para a página inicial
                    </button>
                </p>
            </div>
        </div>
    );
};

export default CTStudentLoginPage;
