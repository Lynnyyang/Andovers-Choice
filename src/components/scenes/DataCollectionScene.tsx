import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HouseSample } from '@/types';
import { generateHouseData, calculateBalanceScore, calculateEfficiencyScore } from '@/utils/dataGeneration';
import { 
  MapPin, 
  DollarSign, 
  Home, 
  Calendar, 
  Users, 
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface DataCollectionSceneProps {
  budget: number;
  samples: HouseSample[];
  currentYear: number;
  onSampleAdd: (sample: HouseSample) => void;
  onYearToggle: () => void;
  onSceneComplete: (score: number) => void;
}

export const DataCollectionScene: React.FC<DataCollectionSceneProps> = ({
  budget,
  samples,
  currentYear,
  onSampleAdd,
  onYearToggle,
  onSceneComplete
}) => {
  const [selectedRegion, setSelectedRegion] = useState<'near' | 'far' | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalBudget = 3000;
  const sampleCost = 100;
  const samplesCollected = samples.length;
  const budgetUsed = totalBudget - budget;

  // Calculate group statistics
  const nearSamples = samples.filter(s => s.nearinc === 1);
  const farSamples = samples.filter(s => s.nearinc === 0);
  const samples1978 = samples.filter(s => s.y81 === 0);
  const samples1981 = samples.filter(s => s.y81 === 1);

  const balanceScore = calculateBalanceScore(samples);
  const efficiencyScore = calculateEfficiencyScore(samplesCollected, budget, totalBudget);
  const totalScore = Math.round((balanceScore * 0.6 + efficiencyScore * 0.4) * 20);

  const handleRegionClick = (region: 'near' | 'far') => {
    if (budget < sampleCost) return;
    
    setSelectedRegion(region);
    
    // Generate house sample
    const newSample = generateHouseData(
      region === 'near', 
      currentYear, 
      1
    )[0];
    
    onSampleAdd(newSample);
    
    // Show brief feedback
    setTimeout(() => setSelectedRegion(null), 500);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    onSceneComplete(totalScore);
  };

  const getRegionStats = (region: 'near' | 'far') => {
    const regionSamples = region === 'near' ? nearSamples : farSamples;
    if (regionSamples.length === 0) return null;
    
    const avgPrice = regionSamples.reduce((sum, s) => sum + s.price, 0) / regionSamples.length;
    return {
      count: regionSamples.length,
      avgPrice: Math.round(avgPrice),
      percentage: Math.round((regionSamples.length / samplesCollected) * 100)
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Scene Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">{currentYear}年数据收集</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gradient">
          数据搜集：战略性样本收集
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          在地图上点击收集房屋数据。合理分配预算，确保处理组和对照组的样本平衡，
          为后续的DID分析奠定坚实基础。
        </p>
      </div>

      {/* Budget and Controls */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="analysis-card">
          <div className="text-center space-y-2">
            <DollarSign className="w-8 h-8 text-success mx-auto" />
            <div className="text-2xl font-bold">${budget}</div>
            <div className="text-sm text-muted-foreground">剩余预算</div>
          </div>
        </Card>
        
        <Card className="analysis-card">
          <div className="text-center space-y-2">
            <Home className="w-8 h-8 text-primary mx-auto" />
            <div className="text-2xl font-bold">{samplesCollected}</div>
            <div className="text-sm text-muted-foreground">已收集样本</div>
          </div>
        </Card>
        
        <Card className="analysis-card">
          <div className="text-center space-y-2">
            <Target className="w-8 h-8 text-warning mx-auto" />
            <div className="text-2xl font-bold">{Math.round(balanceScore * 100)}%</div>
            <div className="text-sm text-muted-foreground">样本平衡度</div>
          </div>
        </Card>
        
        <Card className="analysis-card">
          <div className="text-center space-y-2">
            <TrendingUp className="w-8 h-8 text-accent mx-auto" />
            <div className="text-2xl font-bold">{totalScore}</div>
            <div className="text-sm text-muted-foreground">当前得分/20</div>
          </div>
        </Card>
      </div>

      {/* Year Toggle */}
      <div className="flex justify-center">
        <Button
          onClick={onYearToggle}
          className="btn-secondary"
        >
          切换到 {currentYear === 1978 ? '1981年' : '1978年'} 数据
        </Button>
      </div>

      {/* Interactive Map */}
      <Card className="analysis-card">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">北安德沃镇地图</h2>
          <p className="text-sm text-muted-foreground text-center">
            点击不同区域收集房屋数据 • 每个样本成本：${sampleCost}
          </p>
          
          <div className="relative bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg h-96 overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500"></div>
            </div>
            
            {/* Incinerator Location */}
            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-destructive rounded-full animate-pulse flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div className="text-xs text-center mt-1 text-destructive font-semibold">
                焚化炉
              </div>
            </div>
            
            {/* Near Region */}
            <button
              onClick={() => handleRegionClick('near')}
              disabled={budget < sampleCost}
              className={`
                absolute top-1/4 left-1/4 w-32 h-32 rounded-full border-2 border-dashed
                flex items-center justify-center text-center transition-all duration-300
                ${selectedRegion === 'near' ? 'bg-primary/30 border-primary scale-110' : 
                  budget < sampleCost ? 'border-muted-foreground/30 cursor-not-allowed' :
                  'border-warning hover:bg-warning/20 hover:border-warning cursor-pointer'}
              `}
            >
              <div className="space-y-1">
                <MapPin className="w-6 h-6 mx-auto" />
                <div className="text-xs font-semibold">处理组区域</div>
                <div className="text-xs">(焚化炉2英里内)</div>
                <div className="text-xs font-bold">{nearSamples.length} 样本</div>
              </div>
            </button>
            
            {/* Far Region */}
            <button
              onClick={() => handleRegionClick('far')}
              disabled={budget < sampleCost}
              className={`
                absolute top-1/4 right-1/4 w-32 h-32 rounded-full border-2 border-dashed
                flex items-center justify-center text-center transition-all duration-300
                ${selectedRegion === 'far' ? 'bg-primary/30 border-primary scale-110' : 
                  budget < sampleCost ? 'border-muted-foreground/30 cursor-not-allowed' :
                  'border-accent hover:bg-accent/20 hover:border-accent cursor-pointer'}
              `}
            >
              <div className="space-y-1">
                <MapPin className="w-6 h-6 mx-auto" />
                <div className="text-xs font-semibold">对照组区域</div>
                <div className="text-xs">(焚化炉2英里外)</div>
                <div className="text-xs font-bold">{farSamples.length} 样本</div>
              </div>
            </button>
            
            {/* Collected Samples Visualization */}
            {samples.map((sample, index) => (
              <div
                key={sample.id}
                className="absolute w-2 h-2 bg-primary rounded-full animate-bounce-in"
                style={{
                  left: `${(sample.x / 800) * 100}%`,
                  top: `${(sample.y / 400) * 100}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))}
          </div>
          
          {budget < sampleCost && (
            <div className="flex items-center justify-center gap-2 text-warning">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">预算不足，无法收集更多样本</span>
            </div>
          )}
        </div>
      </Card>

      {/* Sample Statistics */}
      {samplesCollected > 0 && (
        <Card className="analysis-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">样本统计</h3>
              <Button
                onClick={() => setShowStats(!showStats)}
                variant="outline"
                size="sm"
              >
                {showStats ? '隐藏' : '显示'} 详情
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-warning">处理组 (焚化炉附近)</h4>
                <div className="flex justify-between text-sm">
                  <span>样本数量:</span>
                  <span className="font-medium">{nearSamples.length}</span>
                </div>
                {getRegionStats('near') && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>平均房价:</span>
                      <span className="font-medium">${getRegionStats('near')?.avgPrice.toLocaleString()}</span>
                    </div>
                    <Progress value={getRegionStats('near')?.percentage || 0} className="h-2" />
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-accent">对照组 (焚化炉远处)</h4>
                <div className="flex justify-between text-sm">
                  <span>样本数量:</span>
                  <span className="font-medium">{farSamples.length}</span>
                </div>
                {getRegionStats('far') && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>平均房价:</span>
                      <span className="font-medium">${getRegionStats('far')?.avgPrice.toLocaleString()}</span>
                    </div>
                    <Progress value={getRegionStats('far')?.percentage || 0} className="h-2" />
                  </>
                )}
              </div>
            </div>
            
            {showStats && (
              <div className="animate-slide-up">
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <h4 className="font-semibold mb-2">时间分布</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>1978年样本:</span>
                        <span>{samples1978.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1981年样本:</span>
                        <span>{samples1981.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">评分标准</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>样本平衡性 (60%):</span>
                        <span>{Math.round(balanceScore * 12)}/12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>收集效率 (40%):</span>
                        <span>{Math.round(efficiencyScore * 8)}/8</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-border pt-1">
                        <span>总分:</span>
                        <span>{totalScore}/20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Completion Section */}
      {samplesCollected >= 4 && !isCompleted && (
        <Card className="analysis-card text-center animate-bounce-in">
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-success mx-auto" />
            <h3 className="text-xl font-bold">数据收集完成！</h3>
            <p className="text-muted-foreground">
              你已经收集了足够的样本进行DID分析。当前得分：{totalScore}/20分
            </p>
            <p className="text-sm">
              {balanceScore > 0.7 ? 
                "出色的样本平衡策略！" : 
                "考虑优化处理组和对照组的样本分布。"}
            </p>
            <Button onClick={handleComplete} className="btn-hero">
              进入初步分析阶段
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {isCompleted && (
        <Card className="analysis-card text-center">
          <div className="space-y-4">
            <div className="text-2xl font-bold text-success">数据收集阶段完成</div>
            <p className="text-muted-foreground">
              继续探索其他场景，深入学习DID分析方法！
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};