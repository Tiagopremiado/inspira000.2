
import React, { useState, useEffect, useCallback } from 'react';
import { Course } from '../../types';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons';
import CourseContentManager from './CourseContentManager';

const CourseForm: React.FC<{ course?: Course | null, onSave: () => void, onCancel: () => void }> = ({ course, onSave, onCancel }) => {
    const [title, setTitle] = useState(course?.title || '');
    const [description, setDescription] = useState(course?.description || '');
    const [price, setPrice] = useState(course?.price || 0);
    const [imageUrl, setImageUrl] = useState(course?.imageUrl || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const courseData = { title, description, price, imageUrl };
            if (course) {
                await api.updateCourse(course.id, courseData);
            } else {
                await api.createCourse(courseData);
            }
            onSave();
        } catch (error) {
            console.error('Failed to save course', error);
            alert('Erro ao salvar curso.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Preço (BRL)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"/>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
};

const CourseManagement: React.FC<{ onCoursesUpdate: () => void }> = ({ onCoursesUpdate }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [managingContentCourse, setManagingContentCourse] = useState<Course | null>(null);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getCourses();
            setCourses(data);
            onCoursesUpdate();
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setIsLoading(false);
        }
    }, [onCoursesUpdate]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleCreate = () => {
        setEditingCourse(null);
        setIsModalOpen(true);
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };
    
    const handleManageContent = (course: Course) => {
        setManagingContentCourse(course);
    }

    const handleDelete = async (courseId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
            try {
                await api.deleteCourse(courseId);
                fetchCourses();
            } catch (error) {
                console.error("Failed to delete course", error);
                alert('Erro ao excluir curso.');
            }
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
        fetchCourses();
    };

    if (managingContentCourse) {
        return <CourseContentManager courseId={managingContentCourse.id} onBack={() => { setManagingContentCourse(null); fetchCourses(); }} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Cursos</h2>
                <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5"/>
                    Novo Curso
                </button>
            </div>
            {isLoading ? (
                <div className="flex justify-center"><Spinner /></div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                        <div className="text-sm text-gray-500">{course.modules.length} módulos</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(course.price)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-4">
                                            <button onClick={() => handleManageContent(course)} className="text-indigo-600 hover:text-indigo-900">Gerenciar Conteúdo</button>
                                            <button onClick={() => handleEdit(course)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCourse ? 'Editar Curso' : 'Novo Curso'}>
                <CourseForm course={editingCourse} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default CourseManagement;
