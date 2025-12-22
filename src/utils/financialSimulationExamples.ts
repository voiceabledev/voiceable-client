/**
 * Example Financial Simulations
 * 
 * Run these examples to see different scenarios
 */

import { FinancialSimulator, SCENARIOS } from './financialSimulation';

export function runExampleSimulations() {
  const examples: Array<{ name: string; scenario: keyof typeof SCENARIOS; months: number }> = [
    { name: 'Conservative - Year 1', scenario: 'conservative', months: 12 },
    { name: 'Moderate - Year 1', scenario: 'moderate', months: 12 },
    { name: 'Aggressive - Year 1', scenario: 'aggressive', months: 12 },
    { name: 'Enterprise - Year 1', scenario: 'enterprise', months: 12 },
  ];

  examples.forEach(({ name, scenario, months }) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${name} - ${scenario.toUpperCase()} SCENARIO`);
    console.log('='.repeat(60));
    
    const simulator = new FinancialSimulator(SCENARIOS[scenario]);
    const results = simulator.simulateMonths(months);
    const summary = simulator.generateSummary(results);
    
    console.log('\n📊 SUMMARY:');
    console.log(`  Total Revenue:     $${summary.totalRevenue.toLocaleString()}`);
    console.log(`  Total Costs:       $${summary.totalCosts.toLocaleString()}`);
    console.log(`  Total Profit:      $${summary.totalProfit.toLocaleString()}`);
    console.log(`  Avg Gross Margin:  ${summary.avgGrossMargin.toFixed(1)}%`);
    console.log(`  Avg Net Margin:    ${summary.avgNetMargin.toFixed(1)}%`);
    console.log(`  Final Users:       ${summary.finalUsers.toLocaleString()}`);
    console.log(`  Final Active:      ${summary.finalActiveUsers.toLocaleString()}`);
    console.log(`  Avg Monthly Rev:   $${summary.avgMonthlyRevenue.toLocaleString()}`);
    console.log(`  Avg Monthly Profit: $${summary.avgMonthlyProfit.toLocaleString()}`);
    
    console.log('\n📈 MONTHLY BREAKDOWN (First 3 & Last 3 months):');
    const displayMonths = [
      ...results.slice(0, 3),
      ...(results.length > 6 ? [{ month: '...' }] : []),
      ...results.slice(-3),
    ];
    
    displayMonths.forEach((month: any) => {
      if (month.month === '...') {
        console.log('  ...');
        return;
      }
      console.log(`  Month ${month.month.toString().padStart(2)}: ` +
        `Users: ${month.totalUsers.toString().padStart(5)}, ` +
        `Rev: $${month.totalRevenue.toFixed(0).padStart(8)}, ` +
        `Cost: $${month.totalCosts.toFixed(0).padStart(8)}, ` +
        `Profit: $${month.netProfit.toFixed(0).padStart(8)} ` +
        `(${month.netMargin > 0 ? '+' : ''}${month.netMargin.toFixed(1)}%)`);
    });
    
    // Final month breakdown
    const finalMonth = results[results.length - 1];
    console.log('\n💰 FINAL MONTH BREAKDOWN:');
    console.log(`  Users:              ${finalMonth.totalUsers.toLocaleString()} (${finalMonth.activeUsers} active)`);
    console.log(`  Total Minutes:     ${Math.round(finalMonth.totalMinutes).toLocaleString()}`);
    console.log(`  Hosting Revenue:   $${finalMonth.hostingRevenue.toFixed(2)}`);
    console.log(`  Provider Revenue:  $${finalMonth.providerRevenue.toFixed(2)}`);
    console.log(`  Total Revenue:     $${finalMonth.totalRevenue.toFixed(2)}`);
    console.log(`  Provider Costs:    $${finalMonth.providerCosts.toFixed(2)}`);
    console.log(`  Infrastructure:    $${finalMonth.infrastructureCost.toFixed(2)}`);
    console.log(`  Stripe Fees:       $${finalMonth.stripeFees.toFixed(2)}`);
    console.log(`  Total Costs:       $${finalMonth.totalCosts.toFixed(2)}`);
    console.log(`  Net Profit:        $${finalMonth.netProfit.toFixed(2)} (${finalMonth.netMargin.toFixed(1)}% margin)`);
  });
}

// Quick reference calculations
export function calculateBreakEven() {
  console.log('\n' + '='.repeat(60));
  console.log('BREAK-EVEN ANALYSIS');
  console.log('='.repeat(60));
  
  // Using moderate scenario
  const config = SCENARIOS.moderate;
  const simulator = new FinancialSimulator(config);
  const infrastructureCost = simulator.calculateInfrastructureCost();
  
  console.log(`\nInfrastructure Cost: $${infrastructureCost}/month`);
  console.log(`Hosting Revenue per minute: $${config.hostingCostPerMin}`);
  
  // Calculate break-even minutes
  // Assuming 50% gross margin on hosting (infrastructure cost is ~50% of hosting revenue)
  const hostingMargin = 0.50; // 50% margin
  const breakEvenMinutes = infrastructureCost / (config.hostingCostPerMin * hostingMargin);
  
  console.log(`\nBreak-even minutes needed: ${Math.round(breakEvenMinutes).toLocaleString()}/month`);
  console.log(`Break-even calls (10 min avg): ${Math.round(breakEvenMinutes / 10).toLocaleString()}/month`);
  console.log(`Break-even users (50 calls/user): ${Math.round(breakEvenMinutes / 10 / 50).toLocaleString()} active users`);
}

// Run examples if this file is executed directly
if (typeof window === 'undefined') {
  runExampleSimulations();
  calculateBreakEven();
}

