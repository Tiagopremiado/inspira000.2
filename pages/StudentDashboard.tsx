
import React, { useState, useEffect } from 'react';
import { User, Course, CourseWithProgress } from '../types';
import { api } from '../services/api';
import Spinner from '../components/Spinner';
import NotesWidget from '../components/NotesWidget';

interface StudentDashboardProps {
  user: User;
  onSelectCourse: (course: Course) => void;
  onBrowseCourses: () => void;
}

const CourseProgressCard: React.FC<{course: CourseWithProgress, onSelectCourse: (c: Course) => void}> = ({ course, onSelectCourse }) => (
    <div 
        onClick={() => onSelectCourse(course)}
        className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer flex flex-col sm:flex-row"
    >
        <img src={course.imageUrl} alt={course.title} className="w-full sm:w-1/3 h-40 sm:h-full object-cover"/>
        <div className="p-5 flex flex-col justify-between flex-grow">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1 text-sm text-gray-600">
                    <span>Progresso</span>
                    <span>{Math.round(course.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
            </div>
        </div>
    </div>
);


const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onSelectCourse, onBrowseCourses }) => {
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const courses = await api.getStudentCoursesWithProgress(user.id);
        setEnrolledCourses(courses);
      } catch (err) {
        setError('Não foi possível carregar seus cursos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user.id]);

  const inProgressCourses = enrolledCourses.filter(c => c.progress < 100);
  const completedCourses = enrolledCourses.filter(c => c.progress >= 100);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
        <span className="ml-4 text-gray-500">Carregando seus cursos...</span>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg">{error}</div>
  }

  return (
    <div className="space-y-12">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Meu Painel</h1>
            <p className="text-lg text-gray-600">Continue de onde parou e acompanhe seu progresso.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 {enrolledCourses.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">Você ainda não se matriculou em nenhum curso.</h3>
                        <p className="text-gray-600 mt-2 mb-6">Explore nosso catálogo e comece a aprender hoje mesmo!</p>
                        <button
                            onClick={onBrowseCourses}
                            className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300"
                        >
                            Ver Cursos
                        </button>
                    </div>
                 ) : (
                    <>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Meus Cursos</h2>
                            {inProgressCourses.length > 0 ? (
                                <div className="space-y-6">
                                    {inProgressCourses.map(course => <CourseProgressCard key={course.id} course={course} onSelectCourse={onSelectCourse} />)}
                                </div>
                            ) : (
                                <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm">Nenhum curso em andamento.</p>
                            )}
                        </section>

                        {completedCourses.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Cursos Concluídos</h2>
                                <div className="space-y-6">
                                    {completedCourses.map(course => <CourseProgressCard key={course.id} course={course} onSelectCourse={onSelectCourse} />)}
                                </div>
                            </section>
                        )}
                    </>
                 )}
            </div>
            
            <div className="lg:col-span-1">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">Bloco de Anotações</h2>
                 <NotesWidget />
            </div>
        </div>
    </div>
  );
};

export default StudentDashboard;
