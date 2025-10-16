
import React, { useState, useEffect, useCallback } from 'react';
import { Course, Module, Lesson, Question, Quiz } from '../../types';
import { api } from '../../services/api';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '../../components/icons';

// --- FORMS ---

const ModuleForm: React.FC<{ module?: Module, onSave: (title: string) => Promise<void>, onCancel: () => void }> = ({ module, onSave, onCancel }) => {
    const [title, setTitle] = useState(module?.title || '');
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(title);
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border p-2 rounded" placeholder="Título do Módulo"/>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    )
}

const LessonForm: React.FC<{ lesson?: Lesson, onSave: (lessonData: Partial<Lesson>) => Promise<void>, onCancel: () => void }> = ({ lesson, onSave, onCancel }) => {
    const [lessonData, setLessonData] = useState<Partial<Lesson>>(lesson || { title: '', content: '', videoUrl: '', quiz: { questions: [] } });
    const [isSaving, setIsSaving] = useState(false);
    
    const handleChange = (field: keyof Lesson, value: any) => {
        setLessonData(prev => ({...prev, [field]: value}));
    }

    const handleQuizChange = (qIndex: number, field: keyof Question, value: any) => {
        const newQuestions = [...(lessonData.quiz?.questions || [])];
        (newQuestions[qIndex] as any)[field] = value;
        handleChange('quiz', { questions: newQuestions });
    }
    
    const addQuestion = () => {
        const newQuestion: Question = { id: `q-${Date.now()}`, text: '', options: ['', ''], correctOptionIndex: 0 };
        handleChange('quiz', { questions: [...(lessonData.quiz?.questions || []), newQuestion] });
    }

    const removeQuestion = (qIndex: number) => {
        const newQuestions = (lessonData.quiz?.questions || []).filter((_, i) => i !== qIndex);
        handleChange('quiz', { questions: newQuestions });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(lessonData);
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={lessonData.title} onChange={e => handleChange('title', e.target.value)} required placeholder="Título da Aula" className="w-full border p-2 rounded"/>
            <textarea value={lessonData.content} onChange={e => handleChange('content', e.target.value)} rows={5} placeholder="Conteúdo da Aula (HTML)" className="w-full border p-2 rounded"/>
            <input type="text" value={lessonData.videoUrl} onChange={e => handleChange('videoUrl', e.target.value)} placeholder="URL do Vídeo (Vimeo, YouTube)" className="w-full border p-2 rounded"/>
            
            <div className="border p-4 rounded-md">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold">Quiz</h4>
                    <button type="button" onClick={addQuestion} className="text-blue-600 text-sm font-semibold">Adicionar Pergunta</button>
                </div>
                {(lessonData.quiz?.questions || []).map((q, qIndex) => (
                    <div key={q.id} className="border-t mt-4 pt-4">
                        <input type="text" value={q.text} onChange={e => handleQuizChange(qIndex, 'text', e.target.value)} placeholder={`Pergunta ${qIndex + 1}`} className="w-full border p-2 rounded mb-2"/>
                        {q.options.map((opt, oIndex) => (
                           <div key={oIndex} className="flex items-center gap-2 mb-1">
                                <input type="radio" name={`correct-${q.id}`} checked={q.correctOptionIndex === oIndex} onChange={() => handleQuizChange(qIndex, 'correctOptionIndex', oIndex)}/>
                                <input type="text" value={opt} onChange={e => {
                                    const newOpts = [...q.options];
                                    newOpts[oIndex] = e.target.value;
                                    handleQuizChange(qIndex, 'options', newOpts);
                                }} placeholder={`Opção ${oIndex + 1}`} className="w-full border p-1 rounded text-sm"/>
                           </div>
                        ))}
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="text-red-500 text-xs mt-2">Remover Pergunta</button>
                    </div>
                ))}
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

// --- MAIN COMPONENT ---

interface CourseContentManagerProps {
    courseId: string;
    onBack: () => void;
}

const CourseContentManager: React.FC<CourseContentManagerProps> = ({ courseId, onBack }) => {
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [openModuleId, setOpenModuleId] = useState<string | null>(null);
    const [modalState, setModalState] = useState<{ type: 'module' | 'lesson', data?: any, context?: any } | null>(null);

    const fetchCourse = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await api.getCourse(courseId);
            setCourse(data);
            if (data.modules.length > 0 && !openModuleId) {
                setOpenModuleId(data.modules[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch course details", error);
        } finally {
            setIsLoading(false);
        }
    }, [courseId, openModuleId]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleSaveModule = async (title: string) => {
        try {
            if (modalState?.data) { // Editing
                await api.updateModule(modalState.data.id, { title });
            } else { // Creating
                await api.addModule(courseId, { title });
            }
            setModalState(null);
            fetchCourse();
        } catch (error) {
            alert('Erro ao salvar módulo');
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (window.confirm('Tem certeza? Todas as aulas deste módulo serão perdidas.')) {
            await api.deleteModule(moduleId);
            fetchCourse();
        }
    };
    
    const handleSaveLesson = async (lessonData: Partial<Lesson>) => {
        try {
            if (modalState?.data) { // Editing
                await api.updateLesson(lessonData.id!, lessonData);
            } else { // Creating
                await api.addLesson(modalState?.context.moduleId, lessonData);
            }
            setModalState(null);
            fetchCourse();
        } catch (error) {
            alert('Erro ao salvar aula');
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (window.confirm('Tem certeza?')) {
            await api.deleteLesson(lessonId);
            fetchCourse();
        }
    };

    if (isLoading) return <div className="flex justify-center"><Spinner /></div>;
    if (!course) return <p>Curso não encontrado.</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button onClick={onBack} className="text-blue-600 hover:underline mb-2">&larr; Voltar para Cursos</button>
                    <h2 className="text-2xl font-bold text-gray-800">{course.title} - Conteúdo</h2>
                </div>
                <button onClick={() => setModalState({ type: 'module' })} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5"/>
                    Novo Módulo
                </button>
            </div>

            <div className="space-y-4">
                {course.modules.map(module => (
                    <div key={module.id} className="bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}>
                            <h3 className="font-bold text-lg">{module.title}</h3>
                            <div className="flex items-center gap-4">
                                <button onClick={e => { e.stopPropagation(); setModalState({ type: 'module', data: module }); }} className="text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={e => { e.stopPropagation(); handleDeleteModule(module.id); }} className="text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                {openModuleId === module.id ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                            </div>
                        </div>
                        {openModuleId === module.id && (
                            <div className="p-4 border-t">
                                {module.lessons.map(lesson => (
                                    <div key={lesson.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                                        <span>{lesson.title}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setModalState({ type: 'lesson', data: lesson, context: { moduleId: module.id } })} className="text-blue-600"><EditIcon className="w-4 h-4"/></button>
                                            <button onClick={() => handleDeleteLesson(lesson.id)} className="text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => setModalState({ type: 'lesson', context: { moduleId: module.id } })} className="text-sm text-blue-600 font-semibold mt-4">
                                    + Adicionar Aula
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {modalState && (
                <Modal isOpen={!!modalState} onClose={() => setModalState(null)} title={modalState.type === 'module' ? (modalState.data ? 'Editar Módulo' : 'Novo Módulo') : (modalState.data ? 'Editar Aula' : 'Nova Aula')} size={modalState.type === 'lesson' ? 'xl' : 'md'}>
                    {modalState.type === 'module' && <ModuleForm module={modalState.data} onSave={handleSaveModule} onCancel={() => setModalState(null)} />}
                    {modalState.type === 'lesson' && <LessonForm lesson={modalState.data} onSave={handleSaveLesson} onCancel={() => setModalState(null)} />}
                </Modal>
            )}
        </div>
    );
};

export default CourseContentManager;
