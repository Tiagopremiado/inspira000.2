
import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelectCourse: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelectCourse }) => {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(course.price);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      <img src={course.imageUrl || 'https://picsum.photos/400/225'} alt={course.title} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm flex-grow">{course.description.substring(0, 100)}...</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-extrabold text-blue-600">{formattedPrice}</span>
          <button
            onClick={() => onSelectCourse(course)}
            className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            Ver Curso
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
