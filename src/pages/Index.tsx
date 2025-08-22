import React from 'react';
import { Navigation } from '@/components/Navigation';
import { SceneRenderer } from '@/components/SceneRenderer';
import { useGameState } from '@/hooks/useGameState';
import { HouseSample } from '@/types';

const Index = () => {
  const {
    gameState,
    updateScore,
    addScore,
    unlockSceneUpTo,
    setCurrentScene,
    addSample,
    toggleYear,
    getLearningDuration
  } = useGameState();

  const handleTaskComplete = (taskId: number, score: number) => {
    switch (taskId) {
      case 1:
        updateScore('task1', score);
        break;
      case 2:
        updateScore('task2', score);
        break;
      case 3:
        updateScore('task3', score);
        break;
    }
    addScore('interaction', 5); // Participation bonus
  };

  const handleSceneComplete = (score?: number) => {
    switch (gameState.currentScene) {
      case 'prologue':
        unlockSceneUpTo('data-collection');
        setCurrentScene('data-collection');
        break;
      case 'data-collection':
        if (score !== undefined) {
          updateScore('dataCollection', score);
        }
        unlockSceneUpTo('initial-analysis');
        setCurrentScene('initial-analysis');
        break;
      default:
        // Handle other scenes
        break;
    }
  };

  const handleSampleAdd = (sample: HouseSample) => {
    addSample(sample);
  };

  const handleYearToggle = () => {
    toggleYear();
  };

  const handleSceneChange = (sceneId: any) => {
    if (gameState.unlockedScenes.includes(sceneId)) {
      setCurrentScene(sceneId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <Navigation
        currentScene={gameState.currentScene}
        unlockedScenes={gameState.unlockedScenes}
        scores={gameState.scores}
        onSceneChange={handleSceneChange}
        learningDuration={getLearningDuration()}
      />

      {/* Main Content */}
      <main className="ml-nav p-content">
        <SceneRenderer
          currentScene={gameState.currentScene}
          gameState={gameState}
          onTaskComplete={handleTaskComplete}
          onSceneComplete={handleSceneComplete}
          onSampleAdd={handleSampleAdd}
          onYearToggle={handleYearToggle}
        />
      </main>
    </div>
  );
};

export default Index;
