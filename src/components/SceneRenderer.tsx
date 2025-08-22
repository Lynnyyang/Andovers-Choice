import React from 'react';
import { SceneId } from '@/types';
import { PrologueScene } from './scenes/PrologueScene';
import { DataCollectionScene } from './scenes/DataCollectionScene';
// Import other scenes when created
// import { InitialAnalysisScene } from './scenes/InitialAnalysisScene';
// import { DIDBreakthroughScene } from './scenes/DIDBreakthroughScene';
// import { ModelRefinementScene } from './scenes/ModelRefinementScene';
// import { FinalJudgmentScene } from './scenes/FinalJudgmentScene';
// import { FinalSummaryScene } from './scenes/FinalSummaryScene';
// import { CertificateScene } from './scenes/CertificateScene';

interface SceneRendererProps {
  currentScene: SceneId;
  gameState: any;
  onTaskComplete: (taskId: number, score: number) => void;
  onSceneComplete: (score?: number) => void;
  onSampleAdd: (sample: any) => void;
  onYearToggle: () => void;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  currentScene,
  gameState,
  onTaskComplete,
  onSceneComplete,
  onSampleAdd,
  onYearToggle
}) => {
  const renderScene = () => {
    switch (currentScene) {
      case 'prologue':
        return (
          <PrologueScene
            onTaskComplete={onTaskComplete}
            onSceneComplete={() => onSceneComplete()}
          />
        );
        
      case 'data-collection':
        return (
          <DataCollectionScene
            budget={gameState.budget}
            samples={gameState.samples}
            currentYear={gameState.currentYear}
            onSampleAdd={onSampleAdd}
            onYearToggle={onYearToggle}
            onSceneComplete={(score) => onSceneComplete(score)}
          />
        );
        
      case 'initial-analysis':
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4">初步分析</h1>
            <p className="text-xl text-muted-foreground">
              即将推出：描述性统计和简单回归分析
            </p>
          </div>
        );
        
      case 'did-breakthrough':
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4">DID突破</h1>
            <p className="text-xl text-muted-foreground">
              即将推出：平行趋势假设和DID逻辑
            </p>
          </div>
        );
        
      case 'model-refinement':
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4">模型解剖</h1>
            <p className="text-xl text-muted-foreground">
              即将推出：深度理解DID回归模型
            </p>
          </div>
        );
        
      case 'final-judgment':
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4">最终裁决</h1>
            <p className="text-xl text-muted-foreground">
              即将推出：政策效应评估和建议
            </p>
          </div>
        );
        
      case 'final-summary':
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4">学习总结</h1>
            <p className="text-xl text-muted-foreground">
              即将推出：全面回顾学习成果
            </p>
          </div>
        );
        
      case 'certificate':
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4">学习证书</h1>
            <p className="text-xl text-muted-foreground">
              即将推出：个性化学习证书生成
            </p>
          </div>
        );
        
      default:
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <h1 className="text-4xl font-bold text-destructive mb-4">场景未找到</h1>
            <p className="text-xl text-muted-foreground">
              请选择一个有效的学习场景
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {renderScene()}
    </div>
  );
};