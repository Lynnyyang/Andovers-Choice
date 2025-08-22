import { DataGenerationProcess, HouseSample } from '@/types';

// Data Generation Process (DGP) for the study
export const DGP: DataGenerationProcess = {
  intercept: 105000,   // Base house price in dollars
  y81: 10000,          // Time effect (1981 vs 1978)
  nearinc: -20000,     // Location effect (near incinerator)
  interaction: -15000, // Policy effect (DID coefficient δ₁)
  age: -500,           // House age effect
  area: 50,            // Area effect (per sq ft)
  rooms: 2000          // Room count effect
};

// Generate random house data based on DGP
export const generateHouseData = (
  nearIncinerator: boolean,
  year: number,
  count: number = 1
): HouseSample[] => {
  const samples: HouseSample[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate house characteristics
    const age = Math.floor(Math.random() * 30) + 5; // 5-35 years old
    const area = Math.floor(Math.random() * 1000) + 800; // 800-1800 sq ft
    const rooms = Math.floor(Math.random() * 4) + 2; // 2-5 rooms
    
    // Convert year and location to dummy variables
    const y81 = year === 1981 ? 1 : 0;
    const nearinc = nearIncinerator ? 1 : 0;
    
    // Calculate price using DGP formula
    const errorTerm = (Math.random() - 0.5) * 10000; // Random error ±5000
    const price = 
      DGP.intercept +
      DGP.y81 * y81 +
      DGP.nearinc * nearinc +
      DGP.interaction * y81 * nearinc +
      DGP.age * (-age) +
      DGP.area * (area - 1000) / 1000 * 50 + // Normalize area effect
      DGP.rooms * (rooms - 3) + // Normalize room effect
      errorTerm;
    
    // Generate map coordinates
    const baseX = nearIncinerator ? 300 : 500;
    const baseY = 300;
    const x = baseX + (Math.random() - 0.5) * 200;
    const y = baseY + (Math.random() - 0.5) * 200;
    
    samples.push({
      id: `house_${Date.now()}_${i}`,
      price: Math.round(Math.max(price, 50000)), // Ensure minimum price
      logPrice: Math.log(Math.max(price, 50000)),
      nearinc,
      y81,
      age,
      area,
      rooms,
      x,
      y,
      year
    });
  }
  
  return samples;
};

// Calculate simple regression for a single variable
export const calculateSimpleRegression = (
  data: HouseSample[],
  dependentVar: 'price' | 'logPrice',
  independentVar: keyof HouseSample
) => {
  const n = data.length;
  if (n < 2) throw new Error('Insufficient data for regression');
  
  const y = data.map(d => dependentVar === 'price' ? d.price : d.logPrice);
  const x = data.map(d => Number(d[independentVar]));
  
  // Calculate means
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate slope and intercept
  const numerator = x.reduce((sum, val, i) => sum + (val - meanX) * (y[i] - meanY), 0);
  const denominator = x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0);
  
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;
  
  // Calculate R-squared
  const yPred = x.map(val => intercept + slope * val);
  const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
  const rSquared = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  
  return {
    coefficients: [intercept, slope],
    variables: ['Constant', String(independentVar)],
    rSquared,
    sampleSize: n
  };
};

// Calculate multiple regression (simplified for DID model)
export const calculateDIDRegression = (
  data: HouseSample[],
  dependentVar: 'price' | 'logPrice' = 'price',
  includeControls: string[] = []
) => {
  const n = data.length;
  if (n < 4) throw new Error('Insufficient data for DID regression');
  
  // Core DID variables: constant, y81, nearinc, y81*nearinc
  const variables = ['Constant', 'y81', 'nearinc', 'y81*nearinc', ...includeControls];
  
  // For simplicity, calculate group means for DID
  const groups = {
    control_1978: data.filter(d => d.nearinc === 0 && d.y81 === 0),
    control_1981: data.filter(d => d.nearinc === 0 && d.y81 === 1),
    treatment_1978: data.filter(d => d.nearinc === 1 && d.y81 === 0),
    treatment_1981: data.filter(d => d.nearinc === 1 && d.y81 === 1)
  };
  
  const getMean = (group: HouseSample[]) => {
    if (group.length === 0) return 0;
    const values = group.map(d => dependentVar === 'price' ? d.price : d.logPrice);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };
  
  const means = {
    control_1978: getMean(groups.control_1978),
    control_1981: getMean(groups.control_1981),
    treatment_1978: getMean(groups.treatment_1978),
    treatment_1981: getMean(groups.treatment_1981)
  };
  
  // DID coefficient calculation
  const did_coefficient = 
    (means.treatment_1981 - means.treatment_1978) - 
    (means.control_1981 - means.control_1978);
  
  // Simplified coefficients
  const coefficients = [
    means.control_1978, // Intercept (baseline)
    means.control_1981 - means.control_1978, // Time effect
    means.treatment_1978 - means.control_1978, // Treatment effect
    did_coefficient // DID effect
  ];
  
  // Add control variable effects (simplified)
  includeControls.forEach(control => {
    const effect = control === 'age' ? DGP.age : 
                  control === 'area' ? DGP.area : 
                  control === 'rooms' ? DGP.rooms : 0;
    coefficients.push(effect);
  });
  
  // Calculate overall R-squared (approximate)
  const y = data.map(d => dependentVar === 'price' ? d.price : d.logPrice);
  const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
  
  // Predict values based on group membership
  const yPred = data.map(d => {
    let pred = coefficients[0]; // Intercept
    pred += coefficients[1] * d.y81; // Time effect
    pred += coefficients[2] * d.nearinc; // Treatment effect
    pred += coefficients[3] * d.y81 * d.nearinc; // DID effect
    
    // Add control effects
    includeControls.forEach((control, idx) => {
      if (control === 'age') pred += coefficients[4 + idx] * (-d.age);
      if (control === 'area') pred += coefficients[4 + idx] * (d.area - 1000) / 1000;
      if (control === 'rooms') pred += coefficients[4 + idx] * (d.rooms - 3);
    });
    
    return pred;
  });
  
  const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
  const rSquared = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  
  return {
    coefficients,
    variables,
    rSquared,
    sampleSize: n,
    groupMeans: means,
    didCoefficient: did_coefficient
  };
};

// Calculate balance score for data collection
export const calculateBalanceScore = (samples: HouseSample[]) => {
  const groups = {
    control: samples.filter(s => s.nearinc === 0).length,
    treatment: samples.filter(s => s.nearinc === 1).length
  };
  
  const total = groups.control + groups.treatment;
  if (total === 0) return 0;
  
  const idealRatio = 0.5;
  const actualRatio = groups.treatment / total;
  const balance = 1 - Math.abs(actualRatio - idealRatio) / idealRatio;
  
  return Math.max(0, balance);
};

// Calculate efficiency score for data collection
export const calculateEfficiencyScore = (samplesCollected: number, budget: number, totalBudget: number) => {
  const budgetUsed = totalBudget - budget;
  const maxSamples = totalBudget / 100;
  const efficiency = samplesCollected / maxSamples;
  
  return Math.min(1, efficiency);
};