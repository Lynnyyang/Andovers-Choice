import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowRight, MapPin, Calendar, TrendingDown } from 'lucide-react';

interface PrologueSceneProps {
  onTaskComplete: (taskId: number, score: number) => void;
  onSceneComplete: () => void;
}

interface Task {
  id: number;
  question: string;
  type: 'single' | 'multiple';
  options: { id: string; text: string; correct?: boolean }[];
  explanation: string;
  maxScore: number;
  correctAnswers: string[];
}

const tasks: Task[] = [
  {
    id: 1,
    question: "在评估焚化炉建设对房价影响的研究中，核心挑战是什么？",
    type: 'single',
    options: [
      { id: 'A', text: '数据收集的技术难度', correct: false },
      { id: 'B', text: '建立可信的因果关系', correct: true },
      { id: 'C', text: '说服居民配合调研', correct: false },
      { id: 'D', text: '计算房价的平均值', correct: false }
    ],
    explanation: "正确！因果推断是经济学研究的核心挑战。我们不能简单比较焚化炉附近和远处的房价，因为这些区域可能本来就有差异。双重差分法正是为了解决这个问题而设计的。",
    maxScore: 10,
    correctAnswers: ['B']
  },
  {
    id: 2,
    question: "双重差分（DID）分析需要哪些核心变量？（多选题）",
    type: 'multiple',
    options: [
      { id: 'A', text: '房屋价格（因变量）', correct: true },
      { id: 'B', text: '是否靠近焚化炉（处理组标识）', correct: true },
      { id: 'C', text: '时间变量（政策前后）', correct: true },
      { id: 'D', text: '房屋年龄（控制变量）', correct: true },
      { id: 'E', text: '当天天气情况', correct: false }
    ],
    explanation: "完美！DID需要：(1)结果变量(房价)、(2)处理组标识(是否靠近焚化炉)、(3)时间维度(政策前后)、(4)控制变量(如房屋特征)。天气不是这个研究的关键变量。",
    maxScore: 15,
    correctAnswers: ['A', 'B', 'C', 'D']
  },
  {
    id: 3,
    question: "为了准确评估焚化炉对房价的影响，最佳的研究设计是？",
    type: 'single',
    options: [
      { id: 'A', text: '只比较不同区域的房价差异', correct: false },
      { id: 'B', text: '同时比较时间维度和空间维度的变化', correct: true },
      { id: 'C', text: '只比较焚化炉建设前后的时间变化', correct: false },
      { id: 'D', text: '随机选择样本进行调研', correct: false }
    ],
    explanation: "正确！这正是双重差分法的核心思想：同时利用时间和空间的变异来识别因果效应。单纯的时间比较或空间比较都无法排除其他混淆因素的影响。",
    maxScore: 15,
    correctAnswers: ['B']
  }
];

export const PrologueScene: React.FC<PrologueSceneProps> = ({
  onTaskComplete,
  onSceneComplete
}) => {
  const [currentTask, setCurrentTask] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [taskResults, setTaskResults] = useState<Array<{ completed: boolean; score: number }>>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const task = tasks[currentTask];
  const isLastTask = currentTask === tasks.length - 1;
  const allTasksCompleted = taskResults.length === tasks.length;

  const handleAnswerSelect = (answerId: string) => {
    if (task.type === 'single') {
      setSelectedAnswers([answerId]);
    } else {
      setSelectedAnswers(prev => 
        prev.includes(answerId) 
          ? prev.filter(id => id !== answerId)
          : [...prev, answerId]
      );
    }
  };

  const calculateScore = (selected: string[], correct: string[], maxScore: number) => {
    if (task.type === 'single') {
      return selected[0] === correct[0] ? maxScore : Math.floor(maxScore / 2);
    } else {
      // Multiple choice scoring
      const correctSelected = selected.filter(ans => correct.includes(ans)).length;
      const incorrectSelected = selected.filter(ans => !correct.includes(ans)).length;
      
      if (correctSelected === correct.length && incorrectSelected === 0) {
        return maxScore; // Perfect answer
      } else if (correctSelected === correct.length - 1 && incorrectSelected === 0) {
        return Math.floor(maxScore * 0.8); // Missing one correct
      } else if (correctSelected > 0 && incorrectSelected === 0) {
        return Math.floor(maxScore * 0.6); // Partial correct
      } else {
        return Math.floor(maxScore * 0.3); // Some errors
      }
    }
  };

  const handleSubmitAnswer = () => {
    const score = calculateScore(selectedAnswers, task.correctAnswers, task.maxScore);
    const newResult = { completed: true, score };
    
    setTaskResults(prev => [...prev, newResult]);
    onTaskComplete(task.id, score);
    setShowExplanation(true);
  };

  const handleNextTask = () => {
    if (isLastTask) {
      onSceneComplete();
    } else {
      setCurrentTask(prev => prev + 1);
      setSelectedAnswers([]);
      setShowExplanation(false);
    }
  };

  const isAnswerCorrect = (answerId: string) => {
    return task.correctAnswers.includes(answerId);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Scene Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">1978年 • 北安德沃镇</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gradient">
          委托任务：揭开政策的真实代价
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          作为一名经济学研究者，你被委托调查1981年北安德沃镇垃圾焚化炉建设对周边房价的影响。
          这不仅仅是一个数据分析任务，更是一场关于因果推断的智力挑战。
        </p>
      </div>

      {/* Story Context */}
      <Card className="analysis-card">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">研究背景</span>
            </div>
            <p className="text-sm text-muted-foreground">
              1981年，北安德沃市议会决定在镇中心建设垃圾焚化炉。
              这一决定引发了激烈争议，居民担心对环境和房价的负面影响。
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-warning">
              <TrendingDown className="w-5 h-5" />
              <span className="font-semibold">核心问题</span>
            </div>
            <p className="text-sm text-muted-foreground">
              焚化炉建设是否真的降低了周边房价？如果有影响，程度如何？
              我们需要建立科学的因果关系，而不仅仅是相关关系。
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">研究方法</span>
            </div>
            <p className="text-sm text-muted-foreground">
              双重差分法（DID）是评估政策效应的黄金标准。
              通过对比处理组和对照组在政策前后的变化差异来识别因果效应。
            </p>
          </div>
        </div>
      </Card>

      {/* Task Progress */}
      <div className="flex items-center justify-center gap-4">
        {tasks.map((_, index) => (
          <div
            key={index}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              index < currentTask ? 'bg-success text-success-foreground' :
              index === currentTask ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}
          >
            {index < taskResults.length ? <CheckCircle className="w-5 h-5" /> : index + 1}
          </div>
        ))}
      </div>

      {/* Current Task */}
      {!allTasksCompleted && (
        <Card className="analysis-card">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                任务 {task.id}: 理论基础测试
              </h2>
              <p className="text-lg">{task.question}</p>
              {task.type === 'multiple' && (
                <p className="text-sm text-warning mt-2">
                  * 多选题：可以选择多个答案
                </p>
              )}
            </div>

            <div className="space-y-3">
              {task.options.map(option => {
                const isSelected = selectedAnswers.includes(option.id);
                const isCorrect = isAnswerCorrect(option.id);
                
                let optionClass = 'choice-option';
                if (showExplanation) {
                  if (isCorrect) {
                    optionClass += ' correct';
                  } else if (isSelected && !isCorrect) {
                    optionClass += ' incorrect';
                  }
                } else if (isSelected) {
                  optionClass += ' selected';
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => !showExplanation && handleAnswerSelect(option.id)}
                    className={optionClass}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-semibold">
                        {option.id}
                      </span>
                      <span className="flex-1 text-left">{option.text}</span>
                      {showExplanation && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                      {showExplanation && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 animate-slide-up">
                <p className="text-accent font-semibold mb-2">解析：</p>
                <p className="text-sm">{task.explanation}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  得分：{taskResults[taskResults.length - 1]?.score || 0}/{task.maxScore}
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                第 {currentTask + 1} / {tasks.length} 题
              </div>
              
              {!showExplanation ? (
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswers.length === 0}
                  className="btn-hero"
                >
                  提交答案
                </Button>
              ) : (
                <Button 
                  onClick={handleNextTask}
                  className="btn-hero"
                >
                  {isLastTask ? '完成任务' : '下一题'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Task Summary */}
      {allTasksCompleted && (
        <Card className="analysis-card text-center animate-bounce-in">
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-success mx-auto" />
            <h2 className="text-2xl font-bold">理论基础测试完成！</h2>
            <p className="text-muted-foreground">
              总得分：{taskResults.reduce((sum, result) => sum + result.score, 0)}/40
            </p>
            <p className="text-sm">
              恭喜你完成了理论基础测试！现在你已经建立了因果推断的基本思维框架。
              接下来，我们将进入实战阶段，开始收集和分析真实数据。
            </p>
            <Button 
              onClick={onSceneComplete}
              className="btn-hero mt-4"
            >
              进入数据收集阶段
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};