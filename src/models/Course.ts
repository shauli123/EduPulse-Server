import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
    title: string;
    content: string; // Markdown or HTML
    videoUrl?: string;
    duration: number; // in minutes
    difficulty: 'easy' | 'medium' | 'hard';
    order: number;
}

export interface ICourse extends Document {
    title: string;
    description: string;
    subject: string;
    gradeLevel: number;
    topics: {
        title: string;
        lessons: ILesson[];
    }[];
    isPublic: boolean;
    createdBy: mongoose.Types.ObjectId;
}

const LessonSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    videoUrl: { type: String },
    duration: { type: Number, default: 10 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    order: { type: Number, required: true },
});

const CourseSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true },
    gradeLevel: { type: Number, required: true },
    topics: [{
        title: { type: String, required: true },
        lessons: [LessonSchema],
    }],
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
