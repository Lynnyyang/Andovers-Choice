import { useState, useCallback, useEffect } from 'react';
import { GameState, SceneId, HouseSample, RegressionResult } from '@/types';

const initialGameState: GameState = {
  currentScene: 'prologue',
  startTime: new Date(),
  scores: {
    task1: 0,
    task2: 0,
    task3: 0,
    dataCollection: 0,
    analysis: 0,
    interaction: 0,
    total: 0
  },
  completedTasks: 0,
  unlockedScenes: ['prologue'],
  budget: 3000,
  samples: [],
  currentYear: 1978,
  regressionHistory: [],
  finalModel: null,
  addedVariables: [],
  usedLogPrice: false
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const updateScore = useCallback((category: keyof GameState['scores'], points: number) => {
    setGameState(prev => {
      const newScores = { ...prev.scores, [category]: points };
      newScores.total = Object.values(newScores).reduce((sum, score) => sum + score, 0);
      return { ...prev, scores: newScores };
    });
  }, []);

  const addScore = useCallback((category: keyof GameState['scores'], points: number) => {
    setGameState(prev => {
      const newScores = { 
        ...prev.scores, 
        [category]: prev.scores[category] + points 
      };
      newScores.total = Object.values(newScores).reduce((sum, score) => sum + score, 0);
      return { ...prev, scores: newScores };
    });
  }, []);

  const unlockScene = useCallback((sceneId: SceneId) => {
    setGameState(prev => ({
      ...prev,
      unlockedScenes: prev.unlockedScenes.includes(sceneId) 
        ? prev.unlockedScenes 
        : [...prev.unlockedScenes, sceneId]
    }));
  }, []);

  const unlockSceneUpTo = useCallback((targetScene: SceneId) => {
    const allScenes: SceneId[] = [
      'prologue', 
      'data-collection', 
      'initial-analysis', 
      'did-breakthrough', 
      'model-refinement', 
      'final-judgment', 
      'final-summary', 
      'certificate'
    ];
    
    const targetIndex = allScenes.indexOf(targetScene);
    const scenesToUnlock = allScenes.slice(0, targetIndex + 1);
    
    setGameState(prev => ({
      ...prev,
      unlockedScenes: [...new Set([...prev.unlockedScenes, ...scenesToUnlock])]
    }));
  }, []);

  const setCurrentScene = useCallback((sceneId: SceneId) => {
    setGameState(prev => ({
      ...prev,
      currentScene: sceneId
    }));
  }, []);

  const addSample = useCallback((sample: HouseSample) => {
    setGameState(prev => ({
      ...prev,
      samples: [...prev.samples, sample],
      budget: prev.budget - 100
    }));
  }, []);

  const addRegressionResult = useCallback((result: RegressionResult) => {
    setGameState(prev => ({
      ...prev,
      regressionHistory: [...prev.regressionHistory, result]
    }));
  }, []);

  const setFinalModel = useCallback((model: RegressionResult) => {
    setGameState(prev => ({
      ...prev,
      finalModel: model
    }));
  }, []);

  const toggleYear = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentYear: prev.currentYear === 1978 ? 1981 : 1978
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({ ...initialGameState, startTime: new Date() });
  }, []);

  // Calculate grade based on total score
  const getGrade = useCallback(() => {
    const total = gameState.scores.total;
    if (total >= 85) return { grade: 'A', emoji: '🏆', label: '优秀' };
    if (total >= 70) return { grade: 'B', emoji: '🥈', label: '良好' };
    if (total >= 60) return { grade: 'C', emoji: '🥉', label: '合格' };
    return { grade: 'D', emoji: '📚', label: '需要提高' };
  }, [gameState.scores.total]);

  // Calculate learning duration
  const getLearningDuration = useCallback(() => {
    const now = new Date();
    const diff = now.getTime() - gameState.startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    }
    return `${minutes}分钟`;
  }, [gameState.startTime]);

  return {
    gameState,
    updateScore,
    addScore,
    unlockScene,
    unlockSceneUpTo,
    setCurrentScene,
    addSample,
    addRegressionResult,
    setFinalModel,
    toggleYear,
    resetGame,
    getGrade,
    getLearningDuration
  };
};