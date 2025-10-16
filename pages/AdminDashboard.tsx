
import React, { useState } from 'react';
import { User } from '../types';
import CourseManagement from './admin/CourseManagement';
import StudentManagement from './admin/StudentManagement';
import AdminManagement from './admin/AdminManagement';
import OffersAndCouponsManagement from './admin/OffersAndCouponsManagement';
import CTCodeManagement from './admin/CTCodeManagement';
import StudentProgress from './admin/StudentProgress';
import { BookOpenIcon, UsersIcon, UserCircleIcon, TagIcon, KeyIcon, ChartBarIcon } from '../components/icons';

interface AdminDashboardProps {
  user: User;
  onCoursesUpdate: () => void;
}

type AdminTab = 'courses' | 'students' | 'admins' | 'progress' | 'offers' | 'ct_codes';

const TABS: { id: AdminTab; label: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'courses', label: 'Cursos', icon: BookOpenIcon },
    { id: 'students', label: 'Alunos', icon: UsersIcon },
    { id: 'admins', label: 'Admins', icon: UserCircleIcon },
    { id: 'progress', label: 'Progresso', icon: ChartBarIcon },
    { id: 'offers', label: 'Ofertas/Cupons', icon: TagIcon },
    { id: 'ct_codes', label: 'Códigos CT', icon: KeyIcon },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onCoursesUpdate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('courses');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <CourseManagement onCoursesUpdate={onCoursesUpdate} />;
      case 'students':
        return <StudentManagement />;
      case 'admins':
        return <AdminManagement />;
      case 'progress':
        return <StudentProgress />;
      case 'offers':
        return <OffersAndCouponsManagement />;
      case 'ct_codes':
        return <CTCodeManagement />;
      default:
        return <div>Selecione uma aba</div>;
    }
  };

  return (
    <div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Painel do Programador</h1>
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-1/5">
                <nav className="flex flex-row lg:flex-col gap-2 bg-white p-4 rounded-lg shadow-md">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-3 w-full text-left p-3 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <Icon className="w-5 h-5"/>
                                <span className="flex-1">{tab.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </aside>
            <main className="lg:w-4/5">
                <div className="bg-white p-6 rounded-lg shadow-md min-h-[60vh]">
                    {renderContent()}
                </div>
            </main>
        </div>
    </div>
  );
};

export default AdminDashboard;
