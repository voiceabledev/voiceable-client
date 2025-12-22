/**
 * Financial Simulation Model for Voiceable
 * 
 * Simulates revenue, costs, and profitability based on:
 * - Number of users
 * - Usage patterns
 * - Heroku infrastructure costs
 * - Stripe payment processing fees
 * - Provider pass-through costs
 */

export interface SimulationConfig {
  // User metrics
  totalUsers: number;
  activeUsers: number; // % of total users who are active
  newUsersPerMonth: number;
  
  // Usage patterns
  callsPerUserPerMonth: number;
  avgCallLengthMinutes: number;
  
  // Pricing
  hostingCostPerMin: number;
  transportCostPerMin: number; // Twilio
  ttsCostPerMin: number; // ElevenLabs
  sttCostPerMin: number; // ElevenLabs
  avgLlmCostPerMin: number; // Average across all models
  
  // Infrastructure (Heroku)
  herokuDynoType: 'basic' | 'standard-1x' | 'standard-2x' | 'performance-m' | 'performance-l';
  apiDynos: number;
  frontendDynos: number;
  postgresPlan: 'essential-0' | 'essential-1' | 'standard-0' | 'standard-1' | 'premium-0' | 'premium-1';
  redisAddon: boolean;
  
  // Stripe fees
  stripeFeePercent: number; // 2.9%
  stripeFeeFixed: number; // $0.30
  avgPaymentAmount: number; // Average credit purchase
  
  // Provider costs (pass-through, no margin)
  providerCostMargin: number; // % margin on pass-through costs (0-10%)
}

export interface MonthlyMetrics {
  month: number;
  totalUsers: number;
  activeUsers: number;
  totalCalls: number;
  totalMinutes: number;
  
  // Revenue
  hostingRevenue: number;
  providerRevenue: number; // Pass-through with margin
  totalRevenue: number;
  
  // Costs
  providerCosts: number; // Actual costs to providers
  infrastructureCost: number;
  stripeFees: number;
  totalCosts: number;
  
  // Profitability
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
}

// Heroku Pricing (as of 2024)
const HEROKU_DYNO_PRICING = {
  'basic': 7, // $7/month
  'standard-1x': 25, // $25/month
  'standard-2x': 50, // $50/month
  'performance-m': 250, // $250/month
  'performance-l': 500, // $500/month
};

const HEROKU_POSTGRES_PRICING = {
  'essential-0': 0, // Free tier
  'essential-1': 9, // $9/month
  'standard-0': 50, // $50/month
  'standard-1': 200, // $200/month
  'premium-0': 600, // $600/month
  'premium-1': 2000, // $2000/month
};

const HEROKU_REDIS_PRICING = {
  'hobby-dev': 0, // Free
  'premium-0': 15, // $15/month
  'premium-1': 60, // $60/month
};

export class FinancialSimulator {
  private config: SimulationConfig;
  
  constructor(config: SimulationConfig) {
    this.config = config;
  }
  
  calculateInfrastructureCost(): number {
    const apiCost = HEROKU_DYNO_PRICING[this.config.herokuDynoType] * this.config.apiDynos;
    const frontendCost = HEROKU_DYNO_PRICING[this.config.herokuDynoType] * this.config.frontendDynos;
    const postgresCost = HEROKU_POSTGRES_PRICING[this.config.postgresPlan];
    const redisCost = this.config.redisAddon ? HEROKU_REDIS_PRICING['premium-0'] : 0;
    
    return apiCost + frontendCost + postgresCost + redisCost;
  }
  
  calculateStripeFees(revenue: number): number {
    // Assume users make payments proportional to usage
    // Estimate number of transactions based on revenue
    const estimatedTransactions = Math.ceil(revenue / this.config.avgPaymentAmount);
    const percentFees = revenue * (this.config.stripeFeePercent / 100);
    const fixedFees = estimatedTransactions * this.config.stripeFeeFixed;
    
    return percentFees + fixedFees;
  }
  
  simulateMonth(month: number, previousUsers: number = 0): MonthlyMetrics {
    // User growth
    const totalUsers = previousUsers + this.config.newUsersPerMonth;
    const activeUsers = Math.floor(totalUsers * (this.config.activeUsers / 100));
    
    // Usage
    const totalCalls = activeUsers * this.config.callsPerUserPerMonth;
    const totalMinutes = totalCalls * this.config.avgCallLengthMinutes;
    
    // Revenue
    const hostingRevenue = totalMinutes * this.config.hostingCostPerMin;
    
    // Provider costs (pass-through)
    const transportCost = totalMinutes * this.config.transportCostPerMin;
    const ttsCost = totalMinutes * this.config.ttsCostPerMin;
    const sttCost = totalMinutes * this.config.sttCostPerMin;
    const llmCost = totalMinutes * this.config.avgLlmCostPerMin;
    const providerCosts = transportCost + ttsCost + sttCost + llmCost;
    
    // Provider revenue (with margin)
    const providerRevenue = providerCosts * (1 + this.config.providerCostMargin / 100);
    
    const totalRevenue = hostingRevenue + providerRevenue;
    
    // Costs
    const infrastructureCost = this.calculateInfrastructureCost();
    const stripeFees = this.calculateStripeFees(totalRevenue);
    const totalCosts = providerCosts + infrastructureCost + stripeFees;
    
    // Profitability
    const grossProfit = totalRevenue - providerCosts;
    const grossMargin = (grossProfit / totalRevenue) * 100;
    const netProfit = totalRevenue - totalCosts;
    const netMargin = (netProfit / totalRevenue) * 100;
    
    return {
      month,
      totalUsers,
      activeUsers,
      totalCalls,
      totalMinutes,
      hostingRevenue,
      providerRevenue,
      totalRevenue,
      providerCosts,
      infrastructureCost,
      stripeFees,
      totalCosts,
      grossProfit,
      grossMargin,
      netProfit,
      netMargin,
    };
  }
  
  simulateMonths(months: number): MonthlyMetrics[] {
    const results: MonthlyMetrics[] = [];
    let currentUsers = this.config.totalUsers;
    
    for (let month = 1; month <= months; month++) {
      const metrics = this.simulateMonth(month, currentUsers);
      results.push(metrics);
      currentUsers = metrics.totalUsers;
    }
    
    return results;
  }
  
  generateSummary(metrics: MonthlyMetrics[]): {
    totalRevenue: number;
    totalCosts: number;
    totalProfit: number;
    avgGrossMargin: number;
    avgNetMargin: number;
    finalUsers: number;
    finalActiveUsers: number;
    avgMonthlyRevenue: number;
    avgMonthlyProfit: number;
  } {
    const totalRevenue = metrics.reduce((sum, m) => sum + m.totalRevenue, 0);
    const totalCosts = metrics.reduce((sum, m) => sum + m.totalCosts, 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgGrossMargin = metrics.reduce((sum, m) => sum + m.grossMargin, 0) / metrics.length;
    const avgNetMargin = metrics.reduce((sum, m) => sum + m.netMargin, 0) / metrics.length;
    const finalUsers = metrics[metrics.length - 1].totalUsers;
    const finalActiveUsers = metrics[metrics.length - 1].activeUsers;
    const avgMonthlyRevenue = totalRevenue / metrics.length;
    const avgMonthlyProfit = totalProfit / metrics.length;
    
    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      avgGrossMargin,
      avgNetMargin,
      finalUsers,
      finalActiveUsers,
      avgMonthlyRevenue,
      avgMonthlyProfit,
    };
  }
}

// Predefined scenarios
export const SCENARIOS = {
  // Conservative - Early stage startup
  conservative: {
    totalUsers: 50,
    activeUsers: 60, // 60% active
    newUsersPerMonth: 10,
    callsPerUserPerMonth: 20,
    avgCallLengthMinutes: 8,
    hostingCostPerMin: 0.05,
    transportCostPerMin: 0.01, // Average
    ttsCostPerMin: 0.036,
    sttCostPerMin: 0.00667,
    avgLlmCostPerMin: 0.025, // Average across models
    herokuDynoType: 'standard-1x' as const,
    apiDynos: 1,
    frontendDynos: 1,
    postgresPlan: 'essential-1' as const,
    redisAddon: false,
    stripeFeePercent: 2.9,
    stripeFeeFixed: 0.30,
    avgPaymentAmount: 50,
    providerCostMargin: 5, // 5% margin on pass-through
  },
  
  // Moderate - Growing startup
  moderate: {
    totalUsers: 200,
    activeUsers: 70, // 70% active
    newUsersPerMonth: 50,
    callsPerUserPerMonth: 50,
    avgCallLengthMinutes: 10,
    hostingCostPerMin: 0.05,
    transportCostPerMin: 0.01,
    ttsCostPerMin: 0.036,
    sttCostPerMin: 0.00667,
    avgLlmCostPerMin: 0.025,
    herokuDynoType: 'standard-2x' as const,
    apiDynos: 2,
    frontendDynos: 1,
    postgresPlan: 'standard-0' as const,
    redisAddon: true,
    stripeFeePercent: 2.9,
    stripeFeeFixed: 0.30,
    avgPaymentAmount: 100,
    providerCostMargin: 7, // 7% margin
  },
  
  // Aggressive - Scaling startup
  aggressive: {
    totalUsers: 1000,
    activeUsers: 75, // 75% active
    newUsersPerMonth: 200,
    callsPerUserPerMonth: 100,
    avgCallLengthMinutes: 12,
    hostingCostPerMin: 0.05,
    transportCostPerMin: 0.01,
    ttsCostPerMin: 0.036,
    sttCostPerMin: 0.00667,
    avgLlmCostPerMin: 0.025,
    herokuDynoType: 'performance-m' as const,
    apiDynos: 3,
    frontendDynos: 2,
    postgresPlan: 'standard-1' as const,
    redisAddon: true,
    stripeFeePercent: 2.9,
    stripeFeeFixed: 0.30,
    avgPaymentAmount: 200,
    providerCostMargin: 10, // 10% margin
  },
  
  // Enterprise - Large scale
  enterprise: {
    totalUsers: 5000,
    activeUsers: 80, // 80% active
    newUsersPerMonth: 500,
    callsPerUserPerMonth: 200,
    avgCallLengthMinutes: 15,
    hostingCostPerMin: 0.05,
    transportCostPerMin: 0.01,
    ttsCostPerMin: 0.036,
    sttCostPerMin: 0.00667,
    avgLlmCostPerMin: 0.025,
    herokuDynoType: 'performance-l' as const,
    apiDynos: 5,
    frontendDynos: 3,
    postgresPlan: 'premium-0' as const,
    redisAddon: true,
    stripeFeePercent: 2.9,
    stripeFeeFixed: 0.30,
    avgPaymentAmount: 500,
    providerCostMargin: 10,
  },
};

