
import React, { useState, useEffect, useCallback } from 'react';
import { CTAccessCodeWithUserName } from '../../types';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';
import { PlusIcon, TrashIcon } from '../../components/icons';

const CTCodeManagement: React.FC = () => {
    const [codes, setCodes] = useState<CTAccessCodeWithUserName[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCodes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getCTAccessCodes();
            setCodes(data);
        } catch (error) {
            console.error("Failed to fetch CT codes", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    const handleGenerate = async () => {
        await api.generateCTAccessCode();
        fetchCodes();
    };

    const handleDelete = async (codeId: string) => {
        if (window.confirm('Tem certeza?')) {
            await api.deleteCTAccessCode(codeId);
            fetchCodes();
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Códigos de Acesso CT</h2>
                <button onClick={handleGenerate} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5"/>
                    Gerar Código
                </button>
            </div>
            {isLoading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usado Por</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {codes.map(c => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-gray-700">{c.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.isUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {c.isUsed ? 'Utilizado' : 'Disponível'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{c.usedByUserName || '---'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CTCodeManagement;
