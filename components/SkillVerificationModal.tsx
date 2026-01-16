
import React, { useState, useEffect } from 'react';
import { QuizQuestion, Skill } from '../types';
import { generateSkillQuiz } from '../services/geminiService';
import { XIcon, CheckIcon, AlertTriangleIcon } from './icons';

interface SkillVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    skill: Skill;
    onVerify: (skillId: string) => Promise<void>;
}

const SkillVerificationModal: React.FC<SkillVerificationModalProps> = ({ isOpen, onClose, skill, onVerify }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentStep, setCurrentStep] = useState(0); // 0: Intro, 1: Quiz, 2: Result
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);

    // Reset when modal opens
    useEffect(() => {
        if(isOpen) {
            setQuestions([]);
            setCurrentStep(0);
            setUserAnswers([]);
            setScore(0);
        }
    }, [isOpen]);

    const handleStart = async () => {
        setLoading(true);
        try {
            const quiz = await generateSkillQuiz(skill.name, skill.level);
            setQuestions(quiz);
            setCurrentStep(1);
        } catch (e) {
            alert("Failed to generate quiz. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = [...userAnswers, optionIndex];
        setUserAnswers(newAnswers);
        
        if (newAnswers.length === questions.length) {
            // Calculate score
            let correct = 0;
            newAnswers.forEach((ans, idx) => {
                if (ans === questions[idx].correctIndex) correct++;
            });
            setScore(correct);
            setCurrentStep(2);
            
            // Pass if 4/5 or 5/5
            if (correct >= 4) {
                onVerify(skill.id);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700 animate-pop-in">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Verify Skill: {skill.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-8">
                    {currentStep === 0 && (
                        <div className="text-center">
                            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to prove your skills?</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                You will be asked 5 multiple-choice questions about <strong>{skill.name}</strong> at the <strong>{skill.level}</strong> level. 
                                You need at least 4 correct answers to get the verified badge.
                            </p>
                            <button 
                                onClick={handleStart} 
                                disabled={loading}
                                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
                            >
                                {loading ? 'Generating Quiz...' : 'Start Quiz'}
                            </button>
                        </div>
                    )}

                    {currentStep === 1 && questions.length > 0 && (
                        <div>
                            <div className="mb-4 flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                                <span>Question {userAnswers.length + 1} of {questions.length}</span>
                            </div>
                            
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                {questions[userAnswers.length].question}
                            </h3>

                            <div className="space-y-3">
                                {questions[userAnswers.length].options.map((option, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-gray-700 dark:text-gray-200 font-medium"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="text-center">
                            {score >= 4 ? (
                                <>
                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pop-in">
                                        <CheckIcon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Congratulations!</h3>
                                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                        You passed with a score of <span className="font-bold text-green-600">{score}/5</span>. <br/>
                                        The verified badge has been added to your profile.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="bg-red-100 dark:bg-red-900/30 text-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pop-in">
                                        <AlertTriangleIcon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Not quite there yet.</h3>
                                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                        You scored <span className="font-bold text-red-600">{score}/5</span>. You need 4/5 to verify. <br/>
                                        Review the topic and try again later!
                                    </p>
                                </>
                            )}
                            <button 
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillVerificationModal;
