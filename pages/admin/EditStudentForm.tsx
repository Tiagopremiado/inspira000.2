
import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';

interface EditStudentFormProps {
    student: User;
    onSave: () => void;
    onCancel: () => void;
}

const EditStudentForm: React.FC<EditStudentFormProps> = ({ student, onSave, onCancel }) => {
    const [name, setName] = useState(student.name);
    const [phone, setPhone] = useState(student.phone || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await api.updateUser(student.id, { name, phone });
            onSave();
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar aluno.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={student.email} disabled className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                    {isLoading ? <Spinner size="sm" /> : 'Salvar Alterações'}
                </button>
            </div>
        </form>
    );
};

export default EditStudentForm;
