
import React, { useState, useEffect, useCallback } from 'react';
import { User, Course } from '../../types';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/icons';
import CreateStudentForm from './CreateStudentForm';
import EditStudentForm from './EditStudentForm';

const EnrollStudentForm: React.FC<{ student: User, onEnrolled: () => void, onCancel: () => void }> = ({ student, onEnrolled, onCancel }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [studentCourses, setStudentCourses] = useState<string[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [allCourses, enrolled] = await Promise.all([
                api.getCourses(),
                api.getStudentCourses(student.id)
            ]);
            setCourses(allCourses);
            setStudentCourses(enrolled.map(c => c.id));
            setIsLoading(false);
        };
        fetchData();
    }, [student.id]);

    const handleEnroll = async () => {
        if (!selectedCourseId) return;
        await api.enrollStudent(student.id, selectedCourseId);
        onEnrolled();
    };

    const availableCourses = courses.filter(c => !studentCourses.includes(c.id));

    return (
        <div>
            {isLoading ? <Spinner /> : (
                <>
                    <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className="w-full border p-2 rounded">
                        <option value="">Selecione um curso</option>
                        {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <div className="flex justify-end gap-4 pt-4">
                        <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button onClick={handleEnroll} disabled={!selectedCourseId} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                            Matricular
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};


const StudentManagement: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState<'create' | 'edit' | 'enroll' | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getStudents();
            setStudents(data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleOpenModal = (type: 'create' | 'edit' | 'enroll', student: User | null = null) => {
        setSelectedStudent(student);
        setModal(type);
    };

    const handleCloseModal = () => {
        setModal(null);
        setSelectedStudent(null);
        fetchStudents();
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
            await api.deleteUser(userId);
            fetchStudents();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Alunos</h2>
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5"/>
                    Novo Aluno
                </button>
            </div>
            {isLoading ? <div className="flex justify-center"><Spinner /></div> : (
                 <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {student.isCTStudent && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Aluno CT</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-4">
                                            <button onClick={() => handleOpenModal('enroll', student)} className="text-green-600 hover:text-green-900">Matricular</button>
                                            <button onClick={() => handleOpenModal('edit', student)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={modal === 'create'} onClose={handleCloseModal} title="Novo Aluno">
                <CreateStudentForm onSave={handleCloseModal} onCancel={handleCloseModal} />
            </Modal>
            {selectedStudent && (
                <>
                    <Modal isOpen={modal === 'edit'} onClose={handleCloseModal} title="Editar Aluno">
                        <EditStudentForm student={selectedStudent} onSave={handleCloseModal} onCancel={handleCloseModal} />
                    </Modal>
                    <Modal isOpen={modal === 'enroll'} onClose={handleCloseModal} title={`Matricular ${selectedStudent.name}`}>
                        <EnrollStudentForm student={selectedStudent} onEnrolled={handleCloseModal} onCancel={handleCloseModal} />
                    </Modal>
                </>
            )}
        </div>
    );
};

export default StudentManagement;
