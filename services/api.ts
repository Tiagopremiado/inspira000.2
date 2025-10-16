import { supabase } from './supabaseClient';
import { User, Course, Role, Enrollment, Module, Lesson, Coupon, CTAccessCode, CTAccessCodeWithUserName, QuizAttempt, CourseWithProgress } from '../types';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

// --- FUNÇÕES AUXILIARES PARA TRANSFORMAÇÃO DE DADOS ---
// O banco de dados usa snake_case (ex: image_url), e o JavaScript usa camelCase (ex: imageUrl).
// Estas funções fazem a conversão para manter o código limpo.

const toUser = (dbUser: any, authUserEmail?: string): User => ({
  id: dbUser.id,
  name: dbUser.name,
  email: authUserEmail || dbUser.email, // O email do auth é a fonte da verdade
  role: dbUser.role,
  phone: dbUser.phone,
  isCTStudent: dbUser.is_ct_student,
});

const toCourse = (dbCourse: any): Course => ({
  id: dbCourse.id,
  title: dbCourse.title,
  description: dbCourse.description,
  price: dbCourse.price,
  imageUrl: dbCourse.image_url,
  modules: dbCourse.modules ? dbCourse.modules.map(toModule) : [],
});

const toModule = (dbModule: any): Module => ({
  id: dbModule.id,
  title: dbModule.title,
  lessons: dbModule.lessons ? dbModule.lessons.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(toLesson) : [],
});

const toLesson = (dbLesson: any): Lesson => ({
  id: dbLesson.id,
  title: dbLesson.title,
  content: dbLesson.content,
  videoUrl: dbLesson.video_url,
  attachments: dbLesson.attachments,
  quiz: dbLesson.quiz,
});

const toCoupon = (dbCoupon: any): Coupon => ({
    id: dbCoupon.id,
    code: dbCoupon.code,
    discountPercentage: dbCoupon.discount_percentage,
    expiresAt: dbCoupon.expires_at,
    isActive: dbCoupon.is_active,
    courseId: dbCoupon.course_id,
});

const toCTAccessCodeWithUserName = (dbCode: any): CTAccessCodeWithUserName => ({
    id: dbCode.id,
    code: dbCode.code,
    isUsed: dbCode.is_used,
    usedByUserId: dbCode.used_by_user_id,
    usedByUserName: dbCode.users?.name,
});


// --- API REAL COM SUPABASE ---

export const api = {
  // --- Autenticação e Sessão ---
  
  getSession: async (): Promise<User | null> => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) return null;
    
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
      
    if (profileError) {
        console.error("Error fetching session profile:", profileError);
        return null;
    }

    if (userProfile) {
        return toUser(userProfile, session.user.email);
    }
    
    console.warn('Session found, but user profile is missing. Attempting to create one.');
    // In a real app, we might create the profile here, but for simplicity, we'll let the login handle it.
    // This prevents creating profiles for users who just visited but didn't log in.
    return null;
  },
  
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  login: async (email: string, pass: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Login falhou, usuário não encontrado.');

    const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', authData.user.id).maybeSingle();
    if (userError) throw userError;
    
    if (!userData) throw new Error('Perfil do usuário não encontrado.');
      
    return toUser(userData, authData.user.email);
  },
  
  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  signUpUser: async(userData: Omit<User, 'id' | 'role' | 'isCTStudent'> & {password: string}): Promise<User> => {
    const { data, error } = await supabase.functions.invoke('create-user-by-admin', {
        body: {
            userData: {
                email: userData.email,
                password: userData.password,
            },
            profileData: {
                name: userData.name,
                phone: userData.phone,
                role: Role.ALUNO,
                is_ct_student: false
            }
        }
    });

    if (error) {
        console.error('Error invoking create-user function:', error);
        throw new Error(error.message || 'Falha ao criar o usuário. Verifique os dados e tente novamente.');
    }
    return toUser(data, userData.email);
  },

  // --- Gerenciamento de Cursos ---
  getCourses: async (): Promise<Course[]> => {
    const { data, error } = await supabase.from('courses').select('*, modules(*, lessons(*))').order('created_at');
    if (error) throw error;
    return data.map(toCourse);
  },
  
  getCourse: async (courseId: string): Promise<Course> => {
    const { data, error } = await supabase.from('courses').select('*, modules(*, lessons(*))').eq('id', courseId).single();
    if (error) throw error;
    return toCourse(data);
  },
  
   createCourse: async (courseData: Omit<Course, 'id' | 'modules'>): Promise<Course> => {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        image_url: courseData.imageUrl,
      })
      .select()
      .single();
    if (error) throw error;
    return toCourse(data);
  },

  updateCourse: async (courseId: string, updates: Partial<Course>): Promise<Course> => {
    const { data, error } = await supabase
      .from('courses')
      .update({
        title: updates.title,
        description: updates.description,
        price: updates.price,
        image_url: updates.imageUrl,
      })
      .eq('id', courseId)
      .select()
      .single();
    if (error) throw error;
    return toCourse(data);
  },
  
  deleteCourse: async (courseId: string): Promise<void> => {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) throw error;
  },

  // --- Gerenciamento de Alunos e Admins ---
  getStudents: async(): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*').eq('role', Role.ALUNO);
    if (error) throw error;
    return data.map(u => toUser(u, u.email));
  },

  getAdmins: async(): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*').eq('role', Role.PROGRAMADOR);
    if (error) throw error;
    return data.map(u => toUser(u, u.email));
  },
  
  createUser: async(userData: Omit<User, 'id' | 'role' | 'isCTStudent'> & {password: string}): Promise<User> => {
    const { data, error } = await supabase.functions.invoke('create-user-by-admin', {
        body: {
            userData: {
                email: userData.email,
                password: userData.password,
            },
            profileData: {
                name: userData.name,
                phone: userData.phone,
                role: Role.ALUNO,
                is_ct_student: false
            }
        }
    });

    if (error) {
        console.error('Error invoking create-user-by-admin function:', error);
        throw new Error(error.message || 'Falha ao criar o usuário. Verifique os dados e tente novamente.');
    }
    
    return toUser(data, userData.email);
  },

  deleteUser: async (userId: string): Promise<void> => {
      const { error } = await supabase.functions.invoke('delete-user-by-admin', { body: { userIdToDelete: userId } });
      if (error) {
          console.error("Error deleting user via function:", error);
          throw error;
      }
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<void> => {
      const { password, ...profileUpdates } = updates;
      if (password) {
           console.warn("Password update should be handled by an Edge Function.");
      }
      const { error } = await supabase.from('users').update({ name: profileUpdates.name, phone: profileUpdates.phone }).eq('id', userId);
      if (error) throw error;
  },

  createAdmin: async (userData: Omit<User, 'id' | 'role' | 'isCTStudent'> & { password: string }): Promise<User> => {
      const { data, error } = await supabase.functions.invoke('create-user-by-admin', {
          body: {
              userData: {
                  email: userData.email,
                  password: userData.password,
              },
              profileData: {
                  name: userData.name,
                  role: Role.PROGRAMADOR,
              }
          }
      });
      if (error) {
          console.error('Error invoking create-user-by-admin function for an admin:', error);
          throw new Error(error.message || 'Falha ao criar o administrador.');
      }
      return toUser(data, userData.email);
  },
    
  registerCTStudent: async (data: any): Promise<void> => {
      const { error } = await supabase.functions.invoke('register-ct-student', { body: data });
      if (error) throw new Error(error.message || 'Falha no cadastro de Aluno CT.');
  },

    // --- Student Progress & Enrollment ---
    getStudentCourses: async (userId: string): Promise<Course[]> => {
        const { data, error } = await supabase.from('enrollments').select('courses(*, modules(*, lessons(*)))').eq('user_id', userId);
        if (error) throw error;
        return data.map(item => toCourse(item.courses));
    },

    getStudentCoursesWithProgress: async (userId: string): Promise<CourseWithProgress[]> => {
        const { data: enrollments, error } = await supabase.from('enrollments').select('*, courses(*, modules(*, lessons(*)))').eq('user_id', userId);
        if (error) throw error;

        return enrollments.map(enrollment => {
            if(!enrollment.courses) return null;
            const course = toCourse(enrollment.courses);
            const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
            const completedLessons = enrollment.completed_lesson_ids?.length || 0;
            const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
            return { ...course, progress };
        }).filter((c): c is CourseWithProgress => c !== null);
    },

    enrollStudent: async (userId: string, courseId: string): Promise<void> => {
        const { error } = await supabase.from('enrollments').insert({ user_id: userId, course_id: courseId });
        if (error) throw error;
    },
    
    getStudentProgress: async (userId: string, courseId: string): Promise<string[]> => {
        const { data, error } = await supabase.from('enrollments').select('completed_lesson_ids').eq('user_id', userId).eq('course_id', courseId).maybeSingle();
        if (error) throw error;
        const completedIds = data?.completed_lesson_ids;
        if (Array.isArray(completedIds)) {
            return completedIds.filter((item): item is string => typeof item === 'string');
        }
        return [];
    },
    
    toggleLessonCompletion: async (userId: string, courseId: string, lessonId: string): Promise<string[]> => {
        const { data: enrollment, error: fetchError } = await supabase.from('enrollments').select('completed_lesson_ids').eq('user_id', userId).eq('course_id', courseId).single();
        if (fetchError) throw fetchError;

        const currentIds = enrollment?.completed_lesson_ids;
        const completedIds = new Set(
            Array.isArray(currentIds)
                ? currentIds.filter((item): item is string => typeof item === 'string')
                : []
        );

        if (completedIds.has(lessonId)) {
            completedIds.delete(lessonId);
        } else {
            completedIds.add(lessonId);
        }
        const updatedIds = Array.from(completedIds);
        const { error: updateError } = await supabase.from('enrollments').update({ completed_lesson_ids: updatedIds }).eq('user_id', userId).eq('course_id', courseId);
        if (updateError) throw updateError;
        return updatedIds;
    },

    getStudentPerformance: async (userId: string, courseId: string): Promise<{ averageScore: number }> => {
        const { data, error } = await supabase.from('enrollments').select('quiz_attempts').eq('user_id', userId).eq('course_id', courseId).single();
        if (error) throw error;
        const attempts: QuizAttempt[] = data.quiz_attempts || [];
        if (attempts.length === 0) return { averageScore: 0 };
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        return { averageScore: totalScore / attempts.length };
    },

    getStudentProgressOverview: async (): Promise<{ student: User; course: Course; progress: number; }[]> => {
        const { data, error } = await supabase.from('enrollments').select('users(*), courses(*, modules(*, lessons(*))), completed_lesson_ids');
        if (error) throw error;
        return data
            .filter(e => e.users && e.courses)
            .map(e => {
                const course = toCourse(e.courses);
                const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                const completedCount = e.completed_lesson_ids?.length || 0;
                const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
                const user = toUser(e.users, e.users.email); 
                return {
                    student: user,
                    course,
                    progress
                }
        });
    },

    submitQuiz: async (userId: string, courseId: string, lessonId: string, answers: { [questionId: string]: number }): Promise<{ score: number; passed: boolean; correctAnswers: { [qId: string]: number } }> => {
        const { data, error } = await supabase.functions.invoke('submit-quiz', { body: { courseId, lessonId, answers }});
        if (error) throw new Error(error.message || 'Falha ao enviar quiz.');
        const { error: updateError } = await supabase.rpc('add_quiz_attempt', {
            p_user_id: userId,
            p_course_id: courseId,
            p_attempt_data: {
                lessonId: lessonId,
                score: data.score,
                passed: data.passed,
                timestamp: new Date().toISOString()
            }
        })
        if(updateError) throw updateError
        return data;
    },

    // --- Module & Lesson Management ---
    addModule: async (courseId: string, moduleData: { title: string }): Promise<void> => {
        const { error } = await supabase.from('modules').insert({ ...moduleData, course_id: courseId });
        if (error) throw error;
    },
    updateModule: async (moduleId: string, moduleData: { title: string }): Promise<void> => {
        const { error } = await supabase.from('modules').update(moduleData).eq('id', moduleId);
        if (error) throw error;
    },
    deleteModule: async (moduleId: string): Promise<void> => {
        const { error } = await supabase.from('modules').delete().eq('id', moduleId);
        if (error) throw error;
    },
    addLesson: async (moduleId: string, lessonData: Partial<Lesson>): Promise<void> => {
        const { error } = await supabase.from('lessons').insert({
            module_id: moduleId,
            title: lessonData.title,
            content: lessonData.content,
            video_url: lessonData.videoUrl,
            attachments: lessonData.attachments,
            quiz: lessonData.quiz,
        });
        if (error) throw error;
    },
    updateLesson: async (lessonId: string, lessonData: Partial<Lesson>): Promise<void> => {
        const { error } = await supabase.from('lessons').update({
            title: lessonData.title,
            content: lessonData.content,
            video_url: lessonData.videoUrl,
            attachments: lessonData.attachments,
            quiz: lessonData.quiz,
        }).eq('id', lessonId);
        if (error) throw error;
    },
    deleteLesson: async (lessonId: string): Promise<void> => {
        const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
        if (error) throw error;
    },
    
    // --- Coupon Management ---
    getCoupons: async (): Promise<Coupon[]> => {
        const { data, error } = await supabase.from('coupons').select('*');
        if (error) throw error;
        return data.map(toCoupon);
    },
    createCoupon: async (couponData: Omit<Coupon, 'id'>): Promise<void> => {
        const { error } = await supabase.from('coupons').insert({
            code: couponData.code,
            discount_percentage: couponData.discountPercentage,
            expires_at: couponData.expiresAt,
            is_active: couponData.isActive,
            course_id: couponData.courseId,
        });
        if (error) throw error;
    },
    updateCoupon: async (couponId: string, updates: Partial<Coupon>): Promise<void> => {
        const dbUpdates: any = {};
        if (updates.code) dbUpdates.code = updates.code;
        if (updates.discountPercentage) dbUpdates.discount_percentage = updates.discountPercentage;
        if (updates.expiresAt) dbUpdates.expires_at = updates.expiresAt;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
        if (updates.courseId !== undefined) dbUpdates.course_id = updates.courseId;
        const { error } = await supabase.from('coupons').update(dbUpdates).eq('id', couponId);
        if (error) throw error;
    },
    deleteCoupon: async (couponId: string): Promise<void> => {
        const { error } = await supabase.from('coupons').delete().eq('id', couponId);
        if (error) throw error;
    },
    validateCoupon: async (code: string, courseId: string): Promise<{ discountPercentage: number }> => {
        const { data, error } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).maybeSingle();
        if (error || !data) throw new Error('Cupom inválido.');
        if (!data.is_active) throw new Error('Cupom não está mais ativo.');
        if (new Date(data.expires_at) < new Date()) throw new Error('Cupom expirado.');
        if (data.course_id && data.course_id !== courseId) throw new Error('Este cupom não é válido para este curso.');
        return { discountPercentage: data.discount_percentage };
    },
    
    // --- CT Code Management ---
    getCTAccessCodes: async (): Promise<CTAccessCodeWithUserName[]> => {
        const { data, error } = await supabase.from('ct_access_codes').select('*, users(name)');
        if (error) throw error;
        return data.map(toCTAccessCodeWithUserName);
    },
    generateCTAccessCode: async (): Promise<void> => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const { error } = await supabase.from('ct_access_codes').insert({ code });
        if (error) throw error;
    },
    updateCTAccessCodeStatus: async (codeId: string, isUsed: boolean): Promise<void> => {
        const updates: any = { is_used: isUsed };
        if (!isUsed) {
            updates.used_by_user_id = null; // Clear user if reactivating
        }
        const { error } = await supabase.from('ct_access_codes').update(updates).eq('id', codeId);
        if (error) throw error;
    },
    deleteCTAccessCode: async (codeId: string): Promise<void> => {
        const { error } = await supabase.from('ct_access_codes').delete().eq('id', codeId);
        if (error) throw error;
    },
};