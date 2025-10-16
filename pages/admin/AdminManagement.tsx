
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { PlusIcon, TrashIcon } from '../../components/icons';
import CreateAdminForm from './CreateAdminForm';

const AdminManagement: React.FC = () => {
    const [admins, setAdmins] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const fetchAdmins = useCallback(async () => {
        setIsLoading(true);
        try {
            const [data, sessionUser] = await Promise.all([
                api.getAdmins(),
                api.getSession()
            ]);
            setAdmins(data);
            setCurrentUser(sessionUser);
        } catch (error) {
            console.error("Failed to fetch admins", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const handleSave = () => {
        setIsModalOpen(false);
        fetchAdmins();
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (userId === currentUser?.id) {
            alert("Você não pode excluir sua própria conta.");
            return;
        }
        if (window.confirm(`Tem certeza que deseja excluir o administrador ${userName}?`)) {
            await api.deleteUser(userId);
            fetchAdmins();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Admins</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5"/>
                    Novo Admin
                </button>
            </div>
            {isLoading ? <div className="flex justify-center"><Spinner /></div> : (
                 <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map(admin => (
                                <tr key={admin.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleDelete(admin.id, admin.name)} 
                                            disabled={admin.id === currentUser?.id}
                                            className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Administrador">
                <CreateAdminForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default AdminManagement;
