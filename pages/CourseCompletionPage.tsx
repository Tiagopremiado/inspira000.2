
import React from 'react';
import { User, Course } from '../types';

interface CourseCompletionPageProps {
  user: User;
  course: Course;
  performance: number;
  onBack: () => void;
}

const CourseCompletionPage: React.FC<CourseCompletionPageProps> = ({ user, course, performance, onBack }) => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-2xl bg-white p-10 rounded-xl shadow-lg text-center">
        <div className="mb-6">
          <svg className="mx-auto h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Parabéns, {user.name.split(' ')[0]}!</h1>
        <p className="text-lg text-gray-600 mb-4">
          Você concluiu com sucesso o curso <span className="font-bold text-blue-600">"{course.title}"</span>.
        </p>
        
        <div className="bg-gray-100 p-6 rounded-lg my-6">
            <h3 className="text-lg font-semibold text-gray-700">Seu Desempenho</h3>
            <p className="text-4xl font-bold text-blue-600 my-2">{performance.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Média de acertos nos quizzes.</p>
        </div>
        
        <div className="text-left bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Como solicitar seu certificado:</h4>
            <p className="text-sm text-blue-700">
                Para receber seu certificado de conclusão, por favor, entre em contato com nosso suporte através do email <a href="mailto:certificados@inspira.com" className="font-bold underline">certificados@inspira.com</a>, informando seu nome completo e o curso concluído.
            </p>
        </div>

        <button
          onClick={onBack}
          className="mt-8 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para o Painel
        </button>
      </div>
    </div>
  );
};

export default CourseCompletionPage;
