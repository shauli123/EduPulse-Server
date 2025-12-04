export interface UserPreferences {
    learningStyle: 'text' | 'video' | 'interactive' | 'mixed';
    difficulty: 'easy' | 'medium' | 'hard';
    learningAnalysis: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher';
    xp: number;
    level: number;
    streak: number;
    preferences?: UserPreferences;
    created_at?: Date;
    updated_at?: Date;
}
