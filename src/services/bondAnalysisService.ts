import type { Investment, PaymentFrequency, PaymentEvent, BondPaymentInfo } from '../types/investment';
import { getPaymentsPerYear, getMonthsInterval, calculatePaymentAmount } from '../utils/paymentFrequencyUtils';

interface BondPattern {
  patterns: RegExp[];
  defaultFrequency: PaymentFrequency;
  confidence: number;
}

export class BondAnalysisService {
  private bondPatterns: Record<string, BondPattern> = {
    government: {
      patterns: [
        /^T-/, /^TREASURY/, /^UST/, /^GOVT/, /^US\d/, 
        /^TIPS/, /^I-BOND/, /^BILL/, /^NOTE/, /^BOND/,
        /\.T$/, /\.GOV$/, /\.TREASURY$/
      ],
      defaultFrequency: 'semi-annual',
      confidence: 0.9
    },
    corporate: {
      patterns: [
        /\.CORP$/, /\.CB$/, /\.BOND$/, /\.CORPORATE$/,
        /^CORP/, /^[A-Z]{2,4}\d+/, // Common corporate bond format
      ],
      defaultFrequency: 'semi-annual',
      confidence: 0.8
    },
    municipal: {
      patterns: [
        /^MUNI/, /\.MUN$/, /\.MUNI$/, /^MUNICIPAL/,
        /^NYC/, /^CA/, /^TX/, /^FL/, // State/city prefixes
      ],
      defaultFrequency: 'semi-annual',
      confidence: 0.85
    },
    highYield: {
      patterns: [
        /^HY/, /^JUNK/, /^HIGH/, /\.HY$/,
      ],
      defaultFrequency: 'quarterly',
      confidence: 0.7
    },
    international: {
      patterns: [
        /^EUR/, /^GBP/, /^JPY/, /^CAD/,
        /\.INTL$/, /\.GLOBAL$/, /^GLOBAL/,
      ],
      defaultFrequency: 'annual',
      confidence: 0.6
    }
  };

  private bondDatabase: Record<string, BondPaymentInfo> = {};

  /**
   * Analyzes a bond symbol and returns payment information
   */
  analyzeBond(investment: Investment): BondPaymentInfo {
    if (investment.type !== 'bond' || !investment.fixedYield) {
      return this.createDefaultBondInfo();
    }

    // PRIORITY 1: If user has set a payment frequency, use it directly
    if (investment.paymentFrequency && investment.paymentFrequency !== 'unknown') {
      const paymentInfo = this.calculatePaymentDetails(investment, investment.paymentFrequency);
      
      // User input is always 100% confident - trust the user
      return {
        paymentFrequency: investment.paymentFrequency,
        nextPaymentDate: paymentInfo.nextPaymentDate,
        paymentAmount: paymentInfo.paymentAmount,
        totalAnnualPayments: paymentInfo.totalAnnualPayments,
        confidence: 1.0 // User input is always 100% confident
      };
    }

    // PRIORITY 2: Smart detection only when user hasn't provided payment frequency
    // Check if we have cached data for this symbol (only for auto-analysis)
    if (this.bondDatabase[investment.symbol]) {
      return this.bondDatabase[investment.symbol];
    }

    // Analyze symbol patterns
    const patternAnalysis = this.analyzeBondSymbol(investment.symbol);
    
    // Apply yield-based heuristics
    const yieldAnalysis = this.analyzeByYield(investment.fixedYield);
    
    // Combine analyses with weighted confidence
    const combinedInfo = this.combineAnalyses(patternAnalysis, yieldAnalysis, investment);
    
    // Cache the result (only for auto-analysis)
    this.bondDatabase[investment.symbol] = combinedInfo;
    
    return combinedInfo;
  }

  /**
   * Analyzes bond symbol against known patterns
   */
  private analyzeBondSymbol(symbol: string): Partial<BondPaymentInfo> {
    const upperSymbol = symbol.toUpperCase();
    
    for (const [category, pattern] of Object.entries(this.bondPatterns)) {
      for (const regex of pattern.patterns) {
        if (regex.test(upperSymbol)) {
          return {
            paymentFrequency: pattern.defaultFrequency,
            confidence: pattern.confidence
          };
        }
      }
    }
    
    return {
      paymentFrequency: 'unknown',
      confidence: 0.3
    };
  }

  /**
   * Applies yield-based heuristics
   */
  private analyzeByYield(bondYield: number): Partial<BondPaymentInfo> {
    let frequency: PaymentFrequency = 'semi-annual';
    let confidence = 0.6;
    
    if (bondYield > 8) {
      // High yield bonds often pay quarterly
      frequency = 'quarterly';
      confidence = 0.7;
    } else if (bondYield > 5) {
      // Medium yield, could be quarterly or semi-annual
      frequency = 'semi-annual';
      confidence = 0.6;
    } else if (bondYield < 2) {
      // Low yield government bonds, typically semi-annual
      frequency = 'semi-annual';
      confidence = 0.8;
    } else if (bondYield === 0) {
      // Zero coupon bond
      frequency = 'zero-coupon';
      confidence = 0.9;
    }
    
    return { paymentFrequency: frequency, confidence };
  }

  /**
   * Combines multiple analyses with weighted confidence and smart detection
   */
  private combineAnalyses(
    patternAnalysis: Partial<BondPaymentInfo>,
    yieldAnalysis: Partial<BondPaymentInfo>,
    investment: Investment
  ): BondPaymentInfo {
    // Pattern analysis has higher weight if confidence is high
    const usePattern = (patternAnalysis.confidence || 0) > (yieldAnalysis.confidence || 0);
    
    const frequency = usePattern 
      ? (patternAnalysis.paymentFrequency || 'semi-annual')
      : (yieldAnalysis.paymentFrequency || 'semi-annual');
    
    let confidence = Math.max(patternAnalysis.confidence || 0, yieldAnalysis.confidence || 0);
    
    // Calculate payment details with smart detection
    const paymentInfo = this.calculatePaymentDetails(investment, frequency);
    
    // If we have maturity date, get smart detection confidence
    if (investment.maturityDate) {
      const smartPrediction = this.smartPaymentPatternDetection(investment, frequency);
      // Use higher confidence between traditional analysis and smart detection
      confidence = Math.max(confidence, smartPrediction.confidence);
    }
    
    return {
      paymentFrequency: frequency,
      nextPaymentDate: paymentInfo.nextPaymentDate,
      paymentAmount: paymentInfo.paymentAmount,
      totalAnnualPayments: paymentInfo.totalAnnualPayments,
      confidence
    };
  }

  /**
   * Calculates payment details based on frequency and maturity date
   */
  private calculatePaymentDetails(investment: Investment, frequency: PaymentFrequency) {
    const faceValue = investment.faceValue || investment.purchasePrice * investment.quantity;
    const annualYield = (investment.fixedYield || 0) / 100;
    
    const paymentsPerYear = getPaymentsPerYear(frequency);
    const monthsInterval = getMonthsInterval(frequency);
    const paymentAmount = calculatePaymentAmount(faceValue, annualYield, frequency);
    
    // Calculate next payment date using improved logic
    const nextPaymentDate = this.calculateNextPaymentDate(investment, frequency, monthsInterval);
    
    return {
      nextPaymentDate: frequency === 'zero-coupon' ? undefined : nextPaymentDate,
      paymentAmount,
      totalAnnualPayments: paymentsPerYear
    };
  }

  /**
   * Calculates the next payment date using user-provided dates or smart detection
   */
  private calculateNextPaymentDate(investment: Investment, frequency: PaymentFrequency, monthsInterval: number): string | undefined {
    const today = new Date();
    
    // PRIORITY 1: Use user-provided payment dates
    if (investment.nextPaymentDate) {
      // User provided next payment date - use it directly
      return investment.nextPaymentDate;
    }
    
    if (investment.lastPaymentDate) {
      // User provided last payment date - calculate next from it
      const lastPayment = new Date(investment.lastPaymentDate);
      const nextPayment = new Date(lastPayment);
      nextPayment.setMonth(nextPayment.getMonth() + monthsInterval);
      return nextPayment.toISOString().split('T')[0];
    }
    
    // PRIORITY 2: Use smart pattern detection when maturity date is available
    if (investment.maturityDate) {
      const smartPrediction = this.smartPaymentPatternDetection(investment, frequency);
      if (smartPrediction.nextPaymentDate) {
        return smartPrediction.nextPaymentDate;
      }
    }
    
    // PRIORITY 3: Fallback to old logic
    return this.calculateNextPaymentDateFromPurchase(investment, monthsInterval);
  }

  /**
   * Smart payment pattern detection using multiple strategies
   */
  private smartPaymentPatternDetection(investment: Investment, frequency: PaymentFrequency): { nextPaymentDate?: string; confidence: number } {
    // Parse maturity date with explicit timezone handling to avoid date shifts
    const maturityDate = new Date(investment.maturityDate! + 'T12:00:00');
    const today = new Date();
    const maturityDay = maturityDate.getDate();
    
    // Define payment patterns - prioritize maturity-based for each bond
    const maturityMonth = maturityDate.getMonth();
    const patterns = [
      {
        name: 'Maturity-based',
        months: [maturityMonth, (maturityMonth + 6) % 12],
        confidence: 0.5, // Higher base confidence for maturity-based
        reason: 'Based on maturity month (most accurate)'
      },
      {
        name: 'Jan/Jul Standard',
        months: [0, 6], // January = 0, July = 6
        confidence: 0.35,
        reason: 'Common government/corporate pattern'
      },
      {
        name: 'Apr/Oct Standard', 
        months: [3, 9], // April = 3, October = 9
        confidence: 0.3,
        reason: 'Common municipal pattern'
      },
      {
        name: 'Mar/Sep Corporate',
        months: [2, 8], // March = 2, September = 8
        confidence: 0.25,
        reason: 'Common corporate fiscal year'
      }
    ];
    
    // Score each pattern based on bond-specific characteristics
    patterns.forEach(pattern => {
      // Boost confidence for day matching (15th-25th is common for bonds)
      if (maturityDay >= 15 && maturityDay <= 25) {
        pattern.confidence += 0.2;
      } else if (maturityDay >= 1 && maturityDay <= 5) {
        pattern.confidence += 0.1; // First few days also common
      }
      
      // Extra boost for maturity-based pattern (most logical for individual bonds)
      if (pattern.name === 'Maturity-based') {
        pattern.confidence += 0.25; // Strong preference for maturity-based
      }
      
      // Boost Jan/Jul only if maturity is actually in Jan or Jul
      if (pattern.name === 'Jan/Jul Standard' && (maturityMonth === 0 || maturityMonth === 6)) {
        pattern.confidence += 0.2; // Boost if maturity aligns with Jan/Jul
      }
      
      // Boost Apr/Oct only if maturity is actually in Apr or Oct  
      if (pattern.name === 'Apr/Oct Standard' && (maturityMonth === 3 || maturityMonth === 9)) {
        pattern.confidence += 0.2; // Boost if maturity aligns with Apr/Oct
      }
      
      // Reduce confidence for patterns that don't align with maturity month
      if (pattern.name !== 'Maturity-based') {
        if (!pattern.months.includes(maturityMonth) && !pattern.months.includes((maturityMonth + 6) % 12)) {
          pattern.confidence -= 0.1; // Penalty for misaligned patterns
        }
      }
    });
    
    // Sort by confidence and pick the best
    patterns.sort((a, b) => b.confidence - a.confidence);
    const bestPattern = patterns[0];
    
    // Generate next payment date using the best pattern
    const nextPaymentDate = this.generateNextPaymentFromPattern(bestPattern.months, maturityDay, today);
    
    return {
      nextPaymentDate: nextPaymentDate?.toISOString().split('T')[0],
      confidence: bestPattern.confidence
    };
  }

  /**
   * Generates the next payment date from a month pattern
   */
  private generateNextPaymentFromPattern(months: number[], day: number, today: Date): Date | undefined {
    const candidates: Date[] = [];
    
    // Generate payment dates for the next 2 years using the pattern
    for (let year = today.getFullYear(); year <= today.getFullYear() + 2; year++) {
      months.forEach(month => {
        const candidate = new Date(year, month, day);
        if (candidate > today) {
          candidates.push(candidate);
        }
      });
    }
    
    // Return the nearest future date
    candidates.sort((a, b) => a.getTime() - b.getTime());
    return candidates[0];
  }

  /**
   * Generates coupon dates working backwards from maturity date
   */
  private generateCouponDatesFromMaturity(maturityDate: Date, monthsInterval: number): Date[] {
    const couponDates: Date[] = [];
    const currentDate = new Date(maturityDate);
    
    // Generate dates going backwards from maturity
    // Go back up to 50 payment periods (should cover most bonds)
    for (let i = 0; i < 50; i++) {
      couponDates.unshift(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() - monthsInterval);
      
      // Stop if we go too far back (more than 30 years)
      if (currentDate.getFullYear() < new Date().getFullYear() - 30) {
        break;
      }
    }
    
    return couponDates;
  }

  /**
   * Fallback method: Calculate next payment from purchase date (old logic)
   */
  private calculateNextPaymentDateFromPurchase(investment: Investment, monthsInterval: number): string | undefined {
    const purchaseDate = new Date(investment.purchaseDate);
    const nextPaymentDate = new Date(purchaseDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + monthsInterval);
    
    // Adjust to common payment dates (1st or 15th of month)
    const day = nextPaymentDate.getDate();
    if (day <= 8) {
      nextPaymentDate.setDate(1);
    } else {
      nextPaymentDate.setDate(15);
    }
    
    return nextPaymentDate.toISOString().split('T')[0];
  }

  /**
   * Generates payment schedule for a bond using user-provided dates or smart logic
   */
  generatePaymentSchedule(investment: Investment, months: number = 12): PaymentEvent[] {
    const bondInfo = this.analyzeBond(investment);
    
    if (bondInfo.paymentFrequency === 'zero-coupon' || bondInfo.totalAnnualPayments === 0) {
      return this.generateZeroCouponSchedule(investment, months);
    }
    
    const events: PaymentEvent[] = [];
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    const monthsBetween = 12 / bondInfo.totalAnnualPayments;
    
    // PRIORITY 1: Use user-provided payment dates
    if (investment.nextPaymentDate || investment.lastPaymentDate) {
      let startDate: Date;
      
      if (investment.nextPaymentDate) {
        // Start from user-provided next payment date
        startDate = new Date(investment.nextPaymentDate);
      } else if (investment.lastPaymentDate) {
        // Start from user-provided last payment date + interval
        startDate = new Date(investment.lastPaymentDate);
        startDate.setMonth(startDate.getMonth() + monthsBetween);
      } else {
        startDate = new Date(bondInfo.nextPaymentDate || investment.purchaseDate);
      }
      
      // Generate payments from the reference date
      for (let i = 0; i < Math.ceil(months / monthsBetween) + 5; i++) {
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(paymentDate.getMonth() + (i * monthsBetween));
        
        // Only include future payments within timeframe
        if (paymentDate > endDate) break;
        if (paymentDate < today) continue;
        
        // Stop at maturity date if provided
        if (investment.maturityDate && paymentDate > new Date(investment.maturityDate)) break;
        
        events.push({
          date: paymentDate.toISOString().split('T')[0],
          amount: bondInfo.paymentAmount,
          type: 'coupon',
          description: `${investment.symbol} coupon payment`
        });
      }
      
      return events;
    }
    
    // PRIORITY 2: Use smart pattern detection if available
    if (investment.maturityDate) {
      const smartSchedule = this.generateSmartPaymentSchedule(investment, bondInfo, today, endDate);
      events.push(...smartSchedule);
    } else {
      // PRIORITY 3: Fallback to old logic
      const startDate = new Date(bondInfo.nextPaymentDate || investment.purchaseDate);
      
      for (let i = 0; i < Math.ceil(months / monthsBetween); i++) {
        const paymentDate = new Date(startDate);
        paymentDate.setMonth(paymentDate.getMonth() + (i * monthsBetween));
        
        if (paymentDate > endDate) break;
        if (paymentDate < today) continue;
        
        events.push({
          date: paymentDate.toISOString().split('T')[0],
          amount: bondInfo.paymentAmount,
          type: 'coupon',
          description: `${investment.symbol} coupon payment`
        });
      }
    }
    
    return events;
  }

  /**
   * Generates smart payment schedule using pattern detection
   */
  private generateSmartPaymentSchedule(investment: Investment, bondInfo: BondPaymentInfo, today: Date, endDate: Date): PaymentEvent[] {
    const smartPrediction = this.smartPaymentPatternDetection(investment, bondInfo.paymentFrequency);
    const events: PaymentEvent[] = [];
    
    if (!smartPrediction.nextPaymentDate) {
      return []; // Fallback will be used
    }
    
    // Generate all payment dates using the smart pattern
    const maturityDate = new Date(investment.maturityDate! + 'T12:00:00');
    const maturityDay = maturityDate.getDate();
    
    // Determine which months to use based on the best pattern
    // We need to reverse-engineer the pattern from the predicted next payment
    const nextPayment = new Date(smartPrediction.nextPaymentDate);
    const nextMonth = nextPayment.getMonth();
    
    // For semi-annual bonds, determine the 6-month cycle
    let paymentMonths: number[];
    if (bondInfo.paymentFrequency === 'semi-annual') {
      paymentMonths = [nextMonth, (nextMonth + 6) % 12];
    } else if (bondInfo.paymentFrequency === 'quarterly') {
      paymentMonths = [nextMonth, (nextMonth + 3) % 12, (nextMonth + 6) % 12, (nextMonth + 9) % 12];
    } else if (bondInfo.paymentFrequency === 'annual') {
      paymentMonths = [nextMonth];
    } else {
      paymentMonths = [nextMonth, (nextMonth + 6) % 12]; // Default to semi-annual
    }
    
    // Generate payment dates for the requested period
    for (let year = today.getFullYear(); year <= endDate.getFullYear() + 1; year++) {
      paymentMonths.forEach(month => {
        const paymentDate = new Date(year, month, maturityDay);
        
        // Only include dates within our timeframe and in the future
        if (paymentDate >= today && paymentDate <= endDate) {
          events.push({
            date: paymentDate.toISOString().split('T')[0],
            amount: bondInfo.paymentAmount,
            type: 'coupon',
            description: `${investment.symbol} coupon payment`
          });
        }
      });
    }
    
    // Sort by date
    events.sort((a, b) => a.date.localeCompare(b.date));
    
    return events;
  }

  /**
   * Generates payment schedule for zero-coupon bonds
   */
  private generateZeroCouponSchedule(investment: Investment, months: number): PaymentEvent[] {
    const maturityDate = investment.maturityDate;
    if (!maturityDate) return [];
    
    const maturity = new Date(maturityDate + 'T12:00:00');
    const now = new Date();
    const monthsToMaturity = (maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsToMaturity > months) return [];
    
    const faceValue = investment.faceValue || investment.purchasePrice * investment.quantity;
    const maturityValue = faceValue * Math.pow(1 + (investment.fixedYield || 0) / 100, monthsToMaturity / 12);
    
    return [{
      date: maturityDate,
      amount: maturityValue,
      type: 'maturity',
      description: `${investment.symbol} maturity payment`
    }];
  }

  /**
   * Updates bond database with user input
   */
  updateBondInfo(symbol: string, userInfo: Partial<BondPaymentInfo>): void {
    const existing = this.bondDatabase[symbol] || this.createDefaultBondInfo();
    this.bondDatabase[symbol] = {
      ...existing,
      ...userInfo,
      confidence: 1.0 // User input is always 100% confident
    };
  }

  /**
   * Clears cached analysis for a bond symbol
   */
  clearBondCache(symbol: string): void {
    delete this.bondDatabase[symbol];
  }

  /**
   * Clears all cached bond data to force recalculation
   */
  clearAllCache(): void {
    this.bondDatabase = {};
  }

  /**
   * Determines what payment date field to show based on purchase timing
   */
  getRequiredPaymentField(purchaseDate: string, maturityDate: string, frequency: PaymentFrequency): 'lastPayment' | 'nextPayment' | 'none' {
    if (!maturityDate || frequency === 'zero-coupon' || frequency === 'unknown') {
      return 'none';
    }

    const purchase = new Date(purchaseDate);
    const maturity = new Date(maturityDate + 'T12:00:00');
    
    // Calculate time since purchase in months
    const monthsSincePurchase = (Date.now() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    
    // Get payment interval in months
    let paymentIntervalMonths = 6; // Default semi-annual
    switch (frequency) {
      case 'monthly': paymentIntervalMonths = 1; break;
      case 'quarterly': paymentIntervalMonths = 3; break;
      case 'semi-annual': paymentIntervalMonths = 6; break;
      case 'annual': paymentIntervalMonths = 12; break;
    }
    
    // If user has owned the bond for longer than one payment cycle,
    // they likely received at least one payment - ask for last payment date
    if (monthsSincePurchase >= paymentIntervalMonths) {
      return 'lastPayment';
    }
    
    // If recently purchased, ask for next payment date
    return 'nextPayment';
  }

  /**
   * Calculate payment schedule from user-provided reference date
   */
  calculatePaymentScheduleFromReference(
    referenceDate: string,
    isLastPayment: boolean,
    frequency: PaymentFrequency,
    maturityDate: string,
    months: number = 12
  ): PaymentEvent[] {
    if (frequency === 'zero-coupon' || frequency === 'unknown') {
      return [];
    }

    const events: PaymentEvent[] = [];
    const reference = new Date(referenceDate);
    const maturity = new Date(maturityDate + 'T12:00:00');
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // Get payment interval in months
    let intervalMonths = 6;
    switch (frequency) {
      case 'monthly': intervalMonths = 1; break;
      case 'quarterly': intervalMonths = 3; break;
      case 'semi-annual': intervalMonths = 6; break;
      case 'annual': intervalMonths = 12; break;
    }

    // Generate payment dates
    const currentDate = new Date(reference);
    
    // If reference is last payment, start from next payment
    if (isLastPayment) {
      currentDate.setMonth(currentDate.getMonth() + intervalMonths);
    }

    // Generate future payments until maturity or requested period
    while (currentDate <= maturity && currentDate <= endDate) {
      if (currentDate >= today) {
        events.push({
          date: currentDate.toISOString().split('T')[0],
          amount: 0, // Will be calculated by bondInfo
          type: 'coupon',
          description: 'Coupon payment'
        });
      }
      currentDate.setMonth(currentDate.getMonth() + intervalMonths);
    }

    return events;
  }

  /**
   * Gets frequency label for display
   */
  getFrequencyLabel(frequency: PaymentFrequency): string {
    const labels: Record<PaymentFrequency, string> = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'semi-annual': 'Semi-Annual',
      'annual': 'Annual',
      'zero-coupon': 'Zero Coupon',
      'unknown': 'Unknown'
    };
    return labels[frequency];
  }

  /**
   * Creates default bond info
   */
  private createDefaultBondInfo(): BondPaymentInfo {
    return {
      paymentFrequency: 'semi-annual',
      paymentAmount: 0,
      totalAnnualPayments: 2,
      confidence: 0.5
    };
  }

  /**
   * Gets confidence color for UI
   */
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  /**
   * Gets confidence label for UI
   */
  getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  }
}
