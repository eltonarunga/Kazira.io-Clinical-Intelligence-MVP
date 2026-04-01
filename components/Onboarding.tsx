import React from 'react';
import { OnboardingStep } from '../types';
import Button from './Button';

interface OnboardingProps {
  currentStep: OnboardingStep;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ currentStep, onNext, onPrev, onClose }) => {
  if (currentStep === 'HIDDEN') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
      <div className="bg-surface p-8 rounded-2xl max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">Welcome to Kazira</h2>
        <p className="text-ink3 mb-8">Step: {currentStep}</p>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={onClose}>Skip</Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onPrev} disabled={currentStep === 'WELCOME'}>Back</Button>
            <Button variant="primary" onClick={onNext}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
