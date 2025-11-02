import React, { useState } from 'react';
import { XIcon } from './Icons';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to AI Storyline Generator',
      content: 'Create world-class presentations in minutes with AI-powered intelligence.',
      image: '🎯',
    },
    {
      title: 'Choose Your Presentation Model',
      content: 'Select from consulting-grade frameworks like McKinsey Pyramid Principle, or use standard templates.',
      image: '📊',
    },
    {
      title: 'AI-Powered Generation',
      content: 'Our multi-provider AI system creates compelling storylines that tell your story perfectly.',
      image: '🤖',
    },
    {
      title: 'Customize & Export',
      content: 'Add your brand colors, select images, and export to PowerPoint or Google Slides.',
      image: '✨',
    },
  ];

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full shadow-2xl relative">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <div className="p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentStepData.image}</div>
            <h2 className="text-3xl font-bold mb-4 text-white">{currentStepData.title}</h2>
            <p className="text-xl text-gray-300">{currentStepData.content}</p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Previous
            </button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

