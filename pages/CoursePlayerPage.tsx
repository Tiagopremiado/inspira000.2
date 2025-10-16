
import React, { useState, useEffect, useCallback } from 'react';
import { User, Course, Module, Lesson, Quiz, Question } from '../types';
import { api } from '../services/api';
import { CheckCircleIcon, CircleIcon, ChevronDownIcon, ChevronUpIcon } from '../components/icons';
import Spinner from '../components/Spinner';

interface CoursePlayerPageProps {
  user: User;
  course: Course;
  onBack: () => void;
  onCourseComplete: (course: Course, performance: number) => void;
}

const QuizComponent: React.FC<{ lesson: Lesson, onQuizSubmit: (answers: { [qId: string]: number }) => Promise<void>, isLoading: boolean }> = ({ lesson, onQuizSubmit, isLoading }) => {
    const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
    const quiz = lesson.quiz;

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return <p className="text-gray-500">Esta aula não possui quiz.</p>;
    }

    const handleAnswer = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onQuizSubmit(answers);
    };

    const allAnswered = quiz.questions.every(q => answers[q.id] !== undefined);

    return (
        <form onSubmit={handleSubmit} className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Quiz Rápido</h3>
            {quiz.questions.map((q, qIndex) => (
                <div key={q.id} className="mb-6">
                    <p className="font-semibold mb-2">{qIndex + 1}. {q.text}</p>
                    <div className="space-y-2">
                        {q.options.map((option, oIndex) => (
                            <label key={oIndex} className="flex items-center p-3 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-100 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-500">
                                <input
                                    type="radio"
                                    name={q.id}
                                    checked={answers[q.id] === oIndex}
                                    onChange={() => handleAnswer(q.id, oIndex)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-3 text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
            <button
                type="submit"
                disabled={!allAnswered || isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
                {isLoading ? <span className="flex items-center justify-center"><Spinner size="sm" color="border-white" /> Enviando...</span> : 'Enviar Respostas'}
            </button>
        </form>
    );
};


const CoursePlayerPage: React.FC<CoursePlayerPageProps> = ({ user, course, onBack, onCourseComplete }) => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(course.modules[0]?.id || null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(course.modules[0]?.lessons[0] || null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number, passed: boolean, correctAnswers: { [qId: string]: number }} | null>(null);

  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  const checkCompletion = useCallback(() => {
    if (completedLessons.size === totalLessons && totalLessons > 0) {
      api.getStudentPerformance(user.id, course.id).then(performance => {
        onCourseComplete(course, performance.averageScore);
      });
    }
  }, [completedLessons.size, totalLessons, user.id, course, onCourseComplete]);

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true);
      try {
        const completedIds = await api.getStudentProgress(user.id, course.id);
        setCompletedLessons(new Set(completedIds));
      } catch (error) {
        console.error("Failed to fetch progress", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [user.id, course.id]);

  useEffect(() => {
    checkCompletion();
  }, [completedLessons, checkCompletion]);

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setQuizResult(null); // Reset quiz result when changing lesson
  };

  const handleToggleLessonComplete = async () => {
    if (!activeLesson) return;
    const updatedIds = await api.toggleLessonCompletion(user.id, course.id, activeLesson.id);
    setCompletedLessons(new Set(updatedIds));
  };

  const handleQuizSubmit = async (answers: { [qId: string]: number }) => {
      if (!activeLesson) return;
      setIsSubmittingQuiz(true);
      setQuizResult(null);
      try {
          const result = await api.submitQuiz(user.id, course.id, activeLesson.id, answers);
          setQuizResult(result);
          if (result.passed) {
              // Mark lesson as complete automatically if quiz is passed
              if (!completedLessons.has(activeLesson.id)) {
                  handleToggleLessonComplete();
              }
          }
      } catch (err: any) {
          alert(`Erro ao enviar quiz: ${err.message}`);
      } finally {
          setIsSubmittingQuiz(false);
      }
  }

  const isLessonCompleted = activeLesson ? completedLessons.has(activeLesson.id) : false;

  return (
    <div>
      <button onClick={onBack} className="text-blue-600 hover:underline mb-4">&larr; Voltar para o painel</button>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-1/3 bg-white p-4 rounded-lg shadow-md h-full lg:max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{course.title}</h2>
          {course.modules.map(module => (
            <div key={module.id} className="mb-2 border-b last:border-b-0">
              <button
                onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)}
                className="w-full flex justify-between items-center p-3 text-left font-semibold text-gray-700 hover:bg-gray-100"
              >
                <span>{module.title}</span>
                {activeModuleId === module.id ? <ChevronUpIcon className="w-5 h-5"/> : <ChevronDownIcon className="w-5 h-5"/>}
              </button>
              {activeModuleId === module.id && (
                <ul className="pl-4 py-2">
                  {module.lessons.map(lesson => (
                    <li key={lesson.id} onClick={() => handleSelectLesson(lesson)} className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${activeLesson?.id === lesson.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                      {completedLessons.has(lesson.id) ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <CircleIcon className="w-5 h-5 text-gray-400"/>}
                      <span className="text-sm">{lesson.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
          {isLoading ? <Spinner /> : activeLesson ? (
            <div>
              <h1 className="text-3xl font-bold mb-4">{activeLesson.title}</h1>
              {activeLesson.videoUrl && (
                <div className="aspect-video mb-4">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
              
              {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-bold mb-2">Materiais para Download</h3>
                    <ul>
                        {activeLesson.attachments.map(att => (
                            <li key={att.name}><a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{att.name}</a></li>
                        ))}
                    </ul>
                </div>
              )}

              <button
                onClick={handleToggleLessonComplete}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${isLessonCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {isLessonCompleted ? '✓ Marcado como Concluído' : 'Marcar como Concluído'}
              </button>
              
              {activeLesson.quiz && (
                <QuizComponent lesson={activeLesson} onQuizSubmit={handleQuizSubmit} isLoading={isSubmittingQuiz} />
              )}
              
              {quizResult && (
                  <div className={`mt-4 p-4 rounded-lg ${quizResult.passed ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border`}>
                    <h4 className={`font-bold ${quizResult.passed ? 'text-green-800' : 'text-red-800'}`}>Resultado do Quiz</h4>
                    <p>Sua pontuação: {quizResult.score.toFixed(1)}%</p>
                    <p>{quizResult.passed ? 'Parabéns, você passou!' : 'Você não atingiu a pontuação mínima. Tente novamente!'}</p>
                  </div>
              )}

            </div>
          ) : (
            <div className="text-center text-gray-500 py-20">
              <p>Selecione uma aula para começar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
