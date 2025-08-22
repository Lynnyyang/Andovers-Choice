import React from 'react';
import { SceneId, SceneConfig } from '@/types';
import { 
  BookOpen, 
  Database, 
  BarChart3, 
  TrendingUp, 
  Microscope,
  Gavel,
  Trophy,
  Award,
  Clock,
  Lock
} from 'lucide-react';

interface NavigationProps {
  currentScene: SceneId;
  unlockedScenes: SceneId[];
  scores: any;
  onSceneChange: (sceneId: SceneId) => void;
  learningDuration: string;
}

const sceneConfigs: SceneConfig[] = [
  {
    id: 'prologue',
    title: '委托任务',
    subtitle: '建立因果推断思维',
    icon: 'BookOpen',
    locked: false,
    completed: false
  },
  {
    id: 'data-collection',
    title: '数据搜集',
    subtitle: '战略性样本收集',
    icon: 'Database',
    locked: true,
    completed: false
  },
  {
    id: 'initial-analysis',
    title: '初步分析',
    subtitle: '描述性统计探索',
    icon: 'BarChart3',
    locked: true,
    completed: false
  },
  {
    id: 'did-breakthrough',
    title: 'DID突破',
    subtitle: '平行趋势判断',
    icon: 'TrendingUp',
    locked: true,
    completed: false
  },
  {
    id: 'model-refinement',
    title: '模型解剖',
    subtitle: '深度理解DID结构',
    icon: 'Microscope',
    locked: true,
    completed: false
  },
  {
    id: 'final-judgment',
    title: '最终裁决',
    subtitle: '政策效应评估',
    icon: 'Gavel',
    locked: true,
    completed: false
  },
  {
    id: 'final-summary',
    title: '学习总结',
    subtitle: '回顾学习成果',
    icon: 'Trophy',
    locked: true,
    completed: false
  },
  {
    id: 'certificate',
    title: '学习证书',
    subtitle: '获得认证',
    icon: 'Award',
    locked: true,
    completed: false
  }
];

const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
  const icons = {
    BookOpen,
    Database,
    BarChart3,
    TrendingUp,
    Microscope,
    Gavel,
    Trophy,
    Award
  };
  
  const Icon = icons[iconName as keyof typeof icons] || BookOpen;
  return <Icon className={className} />;
};

export const Navigation: React.FC<NavigationProps> = ({
  currentScene,
  unlockedScenes,
  scores,
  onSceneChange,
  learningDuration
}) => {
  const getSceneScore = (sceneId: SceneId) => {
    switch (sceneId) {
      case 'prologue':
        return scores.task1 + scores.task2 + scores.task3;
      case 'data-collection':
        return scores.dataCollection;
      case 'initial-analysis':
      case 'did-breakthrough':
      case 'model-refinement':
      case 'final-judgment':
        return scores.interaction;
      default:
        return 0;
    }
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-nav bg-gradient-to-b from-card to-secondary border-r border-border overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gradient mb-2">
            北安德沃的抉择
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            DID分析实战教程
          </p>
          
          {/* Progress Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>学习时长: {learningDuration}</span>
            </div>
            
            <div className="score-badge">
              总分: {scores.total}/100
            </div>
            
            {/* Progress Bar */}
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(unlockedScenes.length / sceneConfigs.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              已解锁 {unlockedScenes.length}/{sceneConfigs.length} 个场景
            </p>
          </div>
        </div>

        {/* Scene Navigation */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-4">学习场景</h2>
          
          {sceneConfigs.map((scene, index) => {
            const isUnlocked = unlockedScenes.includes(scene.id);
            const isActive = currentScene === scene.id;
            const sceneScore = getSceneScore(scene.id);
            
            return (
              <button
                key={scene.id}
                onClick={() => isUnlocked && onSceneChange(scene.id)}
                className={`
                  nav-item w-full text-left
                  ${isActive ? 'active' : ''}
                  ${!isUnlocked ? 'locked' : ''}
                `}
                disabled={!isUnlocked}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="relative">
                    {isUnlocked ? (
                      <IconComponent iconName={scene.icon} className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{scene.title}</h3>
                      {sceneScore > 0 && (
                        <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">
                          {sceneScore}分
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-80 truncate">{scene.subtitle}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Score Breakdown */}
        <div className="mt-8 p-4 bg-secondary rounded-lg">
          <h3 className="font-semibold mb-3">评分详情</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>理论测试:</span>
              <span className="font-medium">{scores.task1 + scores.task2 + scores.task3}/40</span>
            </div>
            <div className="flex justify-between">
              <span>数据搜集:</span>
              <span className="font-medium">{scores.dataCollection}/20</span>
            </div>
            <div className="flex justify-between">
              <span>分析精度:</span>
              <span className="font-medium">{scores.analysis}/25</span>
            </div>
            <div className="flex justify-between">
              <span>交互学习:</span>
              <span className="font-medium">{scores.interaction}/15</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};