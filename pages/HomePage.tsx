
import React from 'react';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';

interface HomePageProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onNavigateToCTLogin: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ courses, onSelectCourse, onNavigateToCTLogin }) => {
  return (
    <div>
      <div className="text-center bg-white p-10 rounded-lg shadow-md mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Transforme seu Potencial em Realidade
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore nossos cursos e dê o próximo passo na sua carreira. Conhecimento de ponta, com os melhores instrutores do mercado.
        </p>
         <p className="mt-4 text-md text-gray-600">
            É um aluno CT?{' '}
            <button onClick={onNavigateToCTLogin} className="text-blue-600 font-semibold hover:underline">
                Acesse por aqui
            </button>
        </p>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-blue-600 pl-4">Nossos Cursos</h2>
      
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} onSelectCourse={onSelectCourse} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-gray-500">Nenhum curso disponível no momento.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
