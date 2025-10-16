
import React, { useState, useEffect, useCallback } from 'react';
import { Coupon, Course } from '../../types';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons';

const CouponForm: React.FC<{ coupon?: Coupon | null, courses: Course[], onSave: () => void, onCancel: () => void }> = ({ coupon, courses, onSave, onCancel }) => {
    const [code, setCode] = useState(coupon?.code || '');
    const [discount, setDiscount] = useState(coupon?.discountPercentage || 0);
    const [expiresAt, setExpiresAt] = useState(coupon?.expiresAt.substring(0, 10) || '');
    const [isActive, setIsActive] = useState(coupon?.isActive ?? true);
    const [courseId, setCourseId] = useState(coupon?.courseId || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const couponData = { code: code.toUpperCase(), discountPercentage: discount, expiresAt, isActive, courseId: courseId || undefined };
            if (coupon) {
                await api.updateCoupon(coupon.id, couponData);
            } else {
                await api.createCoupon(couponData);
            }
            onSave();
        } catch (error) {
            alert('Erro ao salvar cupom');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="Código do Cupom" className="w-full border p-2 rounded" />
            <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} required placeholder="Porcentagem de Desconto" className="w-full border p-2 rounded" />
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required className="w-full border p-2 rounded" />
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Todos os Cursos</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                Ativo
            </label>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
};

const OffersAndCouponsManagement: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [couponsData, coursesData] = await Promise.all([api.getCoupons(), api.getCourses()]);
            setCoupons(couponsData);
            setCourses(coursesData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    const handleDelete = async (couponId: string) => {
        if (window.confirm('Tem certeza?')) {
            await api.deleteCoupon(couponId);
            fetchData();
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
        fetchData();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Ofertas e Cupons</h2>
                <button onClick={() => { setEditingCoupon(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5"/>
                    Novo Cupom
                </button>
            </div>
            {isLoading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coupons.map(c => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{c.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{c.discountPercentage}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(c.expiresAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {c.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-4">
                                            <button onClick={() => handleEdit(c)}><EditIcon className="w-5 h-5 text-blue-600 hover:text-blue-900"/></button>
                                            <button onClick={() => handleDelete(c.id)}><TrashIcon className="w-5 h-5 text-red-600 hover:text-red-900"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}>
                <CouponForm coupon={editingCoupon} courses={courses} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default OffersAndCouponsManagement;
