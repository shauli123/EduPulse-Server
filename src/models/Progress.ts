import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    completedLessons: mongoose.Types.ObjectId[]; // List of completed lesson IDs
    quizScores: {
        quizId: mongoose.Types.ObjectId; // Or just a reference to a quiz if we store them
        score: number;
        date: Date;
    }[];
    currentTopicIndex: number;
    currentLessonIndex: number;
    masteryLevel: number; // 0-100
}

const ProgressSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: Schema.Types.ObjectId }], // Lesson IDs are subdocument IDs
    quizScores: [{
        quizId: { type: Schema.Types.ObjectId },
        score: { type: Number },
        date: { type: Date, default: Date.now },
    }],
    currentTopicIndex: { type: Number, default: 0 },
    currentLessonIndex: { type: Number, default: 0 },
    masteryLevel: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IProgress>('Progress', ProgressSchema);
