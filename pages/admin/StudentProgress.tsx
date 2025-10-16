
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Course } from '../../types';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';

interface ProgressData {
    student: User;
    course: Course;
    progress: number;
}

const StudentProgress: React.FC = () => {
    const [progressData, setProgressData] = useState<ProgressData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStudent, setFilterStudent] = useState('');
    const [filterCourse, setFilterCourse] = useState('');
    
    const uniqueStudents = useMemo(() => Array.from(new Set(progressData.map(p => p.student.name))).sort(), [progressData]);
    const uniqueCourses = useMemo(() => Array.from(new Set(progressData.map(p => p.course.title))).sort(), [progressData]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getStudentProgressOverview();
            setProgressData(data);
        } catch (error) {
            console.error("Failed to fetch student progress", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = progressData.filter(item => 
        (filterStudent ? item.student.name === filterStudent : true) &&
        (filterCourse ? item.course.title === filterCourse : true)
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Progresso dos Alunos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <select onChange={e => setFilterStudent(e.target.value)} value={filterStudent} className="w-full border p-2 rounded">
                    <option value="">Todos os Alunos</option>
                    {uniqueStudents.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                <select onChange={e => setFilterCourse(e.target.value)} value={filterCourse} className="w-full border p-2 rounded">
                    <option value="">Todos os Cursos</option>
                     {uniqueCourses.map(title => <option key={title} value={title}>{title}</option>)}
                </select>
            </div>
            {isLoading ? <div className="flex justify-center"><Spinner /></div> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.map((item, index) => (
                                <tr key={`${item.student.id}-${item.course.id}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.student.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.course.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                                            </div>
                                            <span>{Math.round(item.progress)}%</span>
                                        </div>
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

export default StudentProgress;
