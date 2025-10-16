
import React, { useState, useEffect, useCallback } from 'react';
import { User, Course, Role } from './types';
import { api } from './services/api';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CoursePlayerPage from './pages/CoursePlayerPage';
import CheckoutPage from './pages/CheckoutPage';
import CourseCompletionPage from './pages/CourseCompletionPage';
import CTStudentLoginPage from './pages/CTStudentLoginPage';

type Page = 'home' | 'login' | 'signup' | 'ct_student_login' | 'dashboard' | 'course_player' | 'checkout' | 'completion';

const App: React.FC = () => {
    // State variables
    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [completedCourseInfo, setCompletedCourseInfo] = useState<{ course: Course, performance: number } | null>(null);

    // Fetch courses
    const fetchCourses = useCallback(async () => {
        try {
            const coursesData = await api.getCourses();
            setCourses(coursesData);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    }, []);

    // Session management
    useEffect(() => {
        const checkSession = async () => {
            const sessionUser = await api.getSession();
            setUser(sessionUser);
            if (sessionUser) {
                setCurrentPage('dashboard');
            }
            setIsLoading(false);
        };
        checkSession();
        fetchCourses();

        const { data: { subscription } } = api.onAuthStateChange((_event, session) => {
             // Let's refetch the full user profile whenever auth state changes.
             api.getSession().then(sessionUser => {
                setUser(sessionUser);
                if (!sessionUser && currentPage !== 'home' && currentPage !== 'signup' && currentPage !== 'ct_student_login') {
                    setCurrentPage('login');
                }
             });
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchCourses, currentPage]);

    // Handlers
    const handleLogout = async () => {
        await api.logout();
        setUser(null);
        setCurrentPage('home');
        setSelectedCourse(null);
    };
    
    const handleLoginSuccess = (loggedInUser: User) => {
        setUser(loggedInUser);
        setCurrentPage('dashboard');
    };

    const handleSelectCourseForPurchase = (course: Course) => {
        if (!user) {
            alert('Você precisa fazer login para se matricular em um curso.');
            setCurrentPage('login');
        } else {
            setSelectedCourse(course);
            setCurrentPage('checkout');
        }
    };

    const handleSelectCourseForViewing = (course: Course) => {
        setSelectedCourse(course);
        setCurrentPage('course_player');
    }

    const handleCourseComplete = (course: Course, performance: number) => {
        setCompletedCourseInfo({ course, performance });
        setCurrentPage('completion');
    };

    const navigateTo = (page: Page) => {
        // Reset transient state when navigating
        if (page !== 'course_player') setSelectedCourse(null);
        if (page !== 'completion') setCompletedCourseInfo(null);
        setCurrentPage(page);
    }
    
    // Render logic
    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-20 text-gray-500 font-semibold">Carregando plataforma...</div>;
        }

        if (user && currentPage === 'dashboard') {
            if (user.role === Role.PROGRAMADOR) {
                return <AdminDashboard user={user} onCoursesUpdate={fetchCourses} />;
            }
            return <StudentDashboard user={user} onSelectCourse={handleSelectCourseForViewing} onBrowseCourses={() => navigateTo('home')} />;
        }
        
        if (currentPage === 'course_player' && user && selectedCourse) {
            return <CoursePlayerPage user={user} course={selectedCourse} onBack={() => navigateTo('dashboard')} onCourseComplete={handleCourseComplete} />;
        }

        if (currentPage === 'checkout' && user && selectedCourse) {
            return <CheckoutPage user={user} course={selectedCourse} onBack={() => navigateTo('home')} />;
        }

        if (currentPage === 'completion' && user && completedCourseInfo) {
            return <CourseCompletionPage user={user} course={completedCourseInfo.course} performance={completedCourseInfo.performance} onBack={() => navigateTo('dashboard')} />;
        }

        switch (currentPage) {
            case 'login':
                return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToSignUp={() => navigateTo('signup')} />;
            case 'signup':
                return <SignUpPage onSignUpSuccess={() => { alert('Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar a conta e faça o login.'); navigateTo('login'); }} onNavigateToLogin={() => navigateTo('login')} />;
            case 'ct_student_login':
                 return <CTStudentLoginPage onRegisterSuccess={() => { alert('Cadastro de aluno CT realizado com sucesso! Faça seu login para continuar.'); navigateTo('login'); }} onBack={() => navigateTo('home')} />;
            case 'home':
            default:
                return <HomePage courses={courses} onSelectCourse={handleSelectCourseForPurchase} onNavigateToCTLogin={() => navigateTo('ct_student_login')}/>;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <Header
                user={user}
                onLogout={handleLogout}
                onNavigateToLogin={() => navigateTo('login')}
                onNavigateHome={() => navigateTo(user ? 'dashboard' : 'home')}
            />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
