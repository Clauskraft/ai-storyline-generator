import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Slide, LoadingState, BrandKit } from '../types';
import { StorylineSlide } from '../services/geminiService';

// ===========================
// CONTEXT TYPES
// ===========================

export interface ContextInfo {
  text: string | null;
  source: string;
  audience: string;
  goal: string;
}

export interface GenerationOptions {
  aspectRatio: string;
  useThinkingMode: boolean;
  presentationModel: 'standard' | 'mcclaus-kinski' | 'custom';
}

interface AppState {
  // Current step in the wizard
  currentStep: number;

  // Content state
  rawText: string;
  contextInfo: ContextInfo;
  generationOptions: GenerationOptions;

  // Generated content
  storyline: StorylineSlide[] | null;
  finalSlides: Slide[] | null;

  // Brand customization
  brandKit: BrandKit;

  // UI state
  loadingState: LoadingState;
  error: string | null;

  // Project persistence
  isProjectSaved: boolean;
  hasSavedProject: boolean;
}

interface AppContextType extends AppState {
  // Navigation actions
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  restart: () => void;

  // Content actions
  setRawText: (text: string) => void;
  setContextInfo: (info: ContextInfo) => void;
  setGenerationOptions: (options: GenerationOptions) => void;
  setStoryline: (storyline: StorylineSlide[] | null) => void;
  setFinalSlides: (slides: Slide[] | null) => void;

  // Brand actions
  setBrandKit: (kit: BrandKit) => void;

  // UI actions
  setLoadingState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Project actions
  saveProject: () => void;
  loadProject: () => void;

  // Batch updates (optimization)
  updateMultiple: (updates: Partial<AppState>) => void;
}

// ===========================
// DEFAULT VALUES
// ===========================

const defaultBrandKit: BrandKit = {
  primaryColor: '#14b8a6',
  secondaryColor: '#6366f1',
  font: 'Arial',
  toneOfVoice: 'Professional and engaging',
};

const defaultContextInfo: ContextInfo = {
  text: null,
  source: 'None',
  audience: '',
  goal: ''
};

const defaultGenerationOptions: GenerationOptions = {
  aspectRatio: '16:9',
  useThinkingMode: false,
  presentationModel: 'standard'
};

const defaultState: AppState = {
  currentStep: 0,
  rawText: '',
  contextInfo: defaultContextInfo,
  generationOptions: defaultGenerationOptions,
  storyline: null,
  finalSlides: null,
  brandKit: defaultBrandKit,
  loadingState: { isLoading: false, message: '' },
  error: null,
  isProjectSaved: false,
  hasSavedProject: false,
};

// ===========================
// CONTEXT CREATION
// ===========================

const AppContext = createContext<AppContextType | undefined>(undefined);

// ===========================
// PROVIDER COMPONENT
// ===========================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>(defaultState);

  // Check for saved project on mount
  useEffect(() => {
    const savedProject = localStorage.getItem('ai-storyline-project');
    if (savedProject) {
      setState(prev => ({ ...prev, hasSavedProject: true }));
    }
  }, []);

  // Update CSS variables when brand kit changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', state.brandKit.primaryColor);
    root.style.setProperty('--color-secondary', state.brandKit.secondaryColor);
  }, [state.brandKit]);

  // ===========================
  // NAVIGATION ACTIONS
  // ===========================

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 3),
      error: null
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
      error: null
    }));
  }, []);

  const restart = useCallback(() => {
    setState({
      ...defaultState,
      brandKit: state.brandKit, // Preserve brand kit on restart
      hasSavedProject: state.hasSavedProject
    });
  }, [state.brandKit, state.hasSavedProject]);

  // ===========================
  // CONTENT ACTIONS
  // ===========================

  const setRawText = useCallback((text: string) => {
    setState(prev => ({ ...prev, rawText: text }));
  }, []);

  const setContextInfo = useCallback((info: ContextInfo) => {
    setState(prev => ({ ...prev, contextInfo: info }));
  }, []);

  const setGenerationOptions = useCallback((options: GenerationOptions) => {
    setState(prev => ({ ...prev, generationOptions: options }));
  }, []);

  const setStoryline = useCallback((storyline: StorylineSlide[] | null) => {
    setState(prev => ({ ...prev, storyline }));
  }, []);

  const setFinalSlides = useCallback((slides: Slide[] | null) => {
    setState(prev => ({ ...prev, finalSlides: slides }));
  }, []);

  // ===========================
  // BRAND ACTIONS
  // ===========================

  const setBrandKit = useCallback((kit: BrandKit) => {
    setState(prev => ({ ...prev, brandKit: kit }));
  }, []);

  // ===========================
  // UI ACTIONS
  // ===========================

  const setLoadingState = useCallback((loadingState: LoadingState) => {
    setState(prev => ({ ...prev, loadingState }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ===========================
  // PROJECT ACTIONS
  // ===========================

  const saveProject = useCallback(() => {
    const projectState = {
      rawText: state.rawText,
      contextInfo: state.contextInfo,
      generationOptions: state.generationOptions,
      storyline: state.storyline,
      finalSlides: state.finalSlides,
      brandKit: state.brandKit,
      currentStep: state.currentStep,
    };

    localStorage.setItem('ai-storyline-project', JSON.stringify(projectState));

    setState(prev => ({ ...prev, isProjectSaved: true, hasSavedProject: true }));

    // Reset save confirmation after 2 seconds
    setTimeout(() => {
      setState(prev => ({ ...prev, isProjectSaved: false }));
    }, 2000);
  }, [state]);

  const loadProject = useCallback(() => {
    const savedStateString = localStorage.getItem('ai-storyline-project');
    if (!savedStateString) return;

    try {
      const savedState = JSON.parse(savedStateString);

      setState(prev => ({
        ...prev,
        rawText: savedState.rawText || '',
        contextInfo: savedState.contextInfo || defaultContextInfo,
        generationOptions: savedState.generationOptions || defaultGenerationOptions,
        storyline: savedState.storyline || null,
        finalSlides: savedState.finalSlides || null,
        brandKit: savedState.brandKit || defaultBrandKit,
        currentStep: savedState.currentStep || 1,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to load project:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load saved project. It may be corrupted.'
      }));
    }
  }, []);

  // ===========================
  // BATCH UPDATE (OPTIMIZATION)
  // ===========================

  const updateMultiple = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // ===========================
  // CONTEXT VALUE
  // ===========================

  const value: AppContextType = {
    // State
    ...state,

    // Actions
    goToStep,
    nextStep,
    previousStep,
    restart,
    setRawText,
    setContextInfo,
    setGenerationOptions,
    setStoryline,
    setFinalSlides,
    setBrandKit,
    setLoadingState,
    setError,
    clearError,
    saveProject,
    loadProject,
    updateMultiple,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ===========================
// CUSTOM HOOKS
// ===========================

/**
 * Main hook to access app context
 * Throws error if used outside AppProvider
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

/**
 * Hook to access only navigation state and actions
 */
export function useNavigation() {
  const { currentStep, goToStep, nextStep, previousStep, restart } = useAppContext();
  return { currentStep, goToStep, nextStep, previousStep, restart };
}

/**
 * Hook to access only content state and actions
 */
export function useContent() {
  const {
    rawText,
    contextInfo,
    generationOptions,
    storyline,
    finalSlides,
    setRawText,
    setContextInfo,
    setGenerationOptions,
    setStoryline,
    setFinalSlides,
  } = useAppContext();

  return {
    rawText,
    contextInfo,
    generationOptions,
    storyline,
    finalSlides,
    setRawText,
    setContextInfo,
    setGenerationOptions,
    setStoryline,
    setFinalSlides,
  };
}

/**
 * Hook to access only brand kit state and actions
 */
export function useBrandKit() {
  const { brandKit, setBrandKit } = useAppContext();
  return { brandKit, setBrandKit };
}

/**
 * Hook to access only UI state and actions
 */
export function useUI() {
  const { loadingState, error, setLoadingState, setError, clearError } = useAppContext();
  return { loadingState, error, setLoadingState, setError, clearError };
}

/**
 * Hook to access only project actions
 */
export function useProject() {
  const { saveProject, loadProject, isProjectSaved, hasSavedProject } = useAppContext();
  return { saveProject, loadProject, isProjectSaved, hasSavedProject };
}

export default AppContext;
