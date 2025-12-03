import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'student' | 'teacher';
    xp: number;
    level: number;
    streak: number;
    lastLogin: Date;
    preferences: {
        learningStyle: 'visual' | 'text' | 'interactive';
        difficulty: 'easy' | 'medium' | 'hard';
    };
    createdAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], default: 'student' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now },
    preferences: {
        learningStyle: { type: String, enum: ['visual', 'text', 'interactive'], default: 'text' },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    },
}, { timestamps: true });

UserSchema.pre('save', async function () {
    const user = this as unknown as IUser;
    if (!user.isModified('passwordHash')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    const user = this as unknown as IUser;
    return await bcrypt.compare(enteredPassword, user.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);
