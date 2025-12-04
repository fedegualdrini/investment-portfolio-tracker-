import type { Investment } from '../types/investment';
import { AI_CONFIG } from '../config/aiConfig';

/**
 * Query analysis result
 */
export interface QueryAnalysis {
    /** Detected stock symbols (e.g., AAPL, TSLA) */
    symbols: string[];
    /** Detected company/asset names (e.g., Apple, Tesla) */
    names: string[];
    /** Detected asset types (e.g., bond, stock, crypto) */
    types: string[];
    /** Whether the query is about specific assets or general */
    isSpecific: boolean;
    /** The original query */
    query: string;
}

/**
 * Portfolio summary for token-efficient context
 */
export interface PortfolioSummary {
    totalValue: number;
    totalInvested: number;
    totalGainLoss: number;
    totalGainLossPercentage: number;
    investmentCount: number;
    assetAllocation: {
        stocks: number;
        bonds: number;
        crypto: number;
        cash: number;
        other: number;
    };
    topPerformers: Array<{
        symbol: string;
        name: string;
        type: string;
        gainLossPercentage: number;
    }>;
    bottomPerformers: Array<{
        symbol: string;
        name: string;
        type: string;
        gainLossPercentage: number;
    }>;
    bondSummary?: {
        count: number;
        totalValue: number;
        totalAnnualIncome: number;
        nextPaymentDate?: string;
    };
}

/**
 * Analyze user query to detect specific asset mentions
 */
export function analyzeQuery(query: string): QueryAnalysis {
    const normalizedQuery = query.toLowerCase();
    const symbols: string[] = [];
    const names: string[] = [];
    const types: string[] = [];

    // Common stock symbols pattern (2-5 uppercase letters)
    const symbolPattern = /\b([A-Z]{2,5})\b/g;
    const symbolMatches = query.match(symbolPattern);
    if (symbolMatches) {
        symbols.push(...symbolMatches.map(s => s.toUpperCase()));
    }

    // Common company names (this is a simplified list, can be expanded)
    const companyNames = [
        'apple', 'microsoft', 'google', 'amazon', 'tesla', 'meta', 'facebook',
        'nvidia', 'netflix', 'bitcoin', 'ethereum', 'cardano', 'solana',
        'edenor', 'ypf', 'pampa', 'galicia', 'bbva', 'santander'
    ];

    for (const company of companyNames) {
        if (normalizedQuery.includes(company)) {
            names.push(company);
        }
    }

    // Asset types
    const assetTypes = ['bond', 'bonds', 'stock', 'stocks', 'crypto', 'cryptocurrency', 'cash', 'etf'];
    for (const type of assetTypes) {
        if (normalizedQuery.includes(type)) {
            // Normalize to singular form
            const normalizedType = type.replace(/s$/, '');
            if (!types.includes(normalizedType)) {
                types.push(normalizedType);
            }
        }
    }

    // Determine if query is specific
    const isSpecific = symbols.length > 0 || names.length > 0 ||
        (types.length > 0 && types.length < 3); // If asking about 1-2 specific types

    return {
        symbols,
        names,
        types,
        isSpecific,
        query
    };
}

/**
 * Filter investments based on query analysis
 */
export function filterRelevantAssets(
    investments: Investment[],
    queryAnalysis: QueryAnalysis
): Investment[] {
    // If not specific, return all investments
    if (!queryAnalysis.isSpecific) {
        return investments;
    }

    const relevant: Investment[] = [];

    for (const investment of investments) {
        // Check if symbol matches
        if (queryAnalysis.symbols.some(s =>
            investment.symbol.toUpperCase() === s.toUpperCase()
        )) {
            relevant.push(investment);
            continue;
        }

        // Check if name matches
        if (queryAnalysis.names.some(name =>
            investment.name.toLowerCase().includes(name.toLowerCase()) ||
            investment.symbol.toLowerCase().includes(name.toLowerCase())
        )) {
            relevant.push(investment);
            continue;
        }

        // Check if type matches
        if (queryAnalysis.types.some(type =>
            investment.type.toLowerCase() === type.toLowerCase()
        )) {
            relevant.push(investment);
            continue;
        }
    }

    // If no matches found, return all (fallback)
    return relevant.length > 0 ? relevant : investments;
}

/**
 * Create a summarized version of the portfolio for token efficiency
 */
export function summarizePortfolio(investments: Investment[]): PortfolioSummary {
    // Calculate totals
    const totalInvested = investments.reduce(
        (sum, inv) => sum + inv.purchasePrice * inv.quantity,
        0
    );
    const totalValue = investments.reduce(
        (sum, inv) => sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity,
        0
    );
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0
        ? (totalGainLoss / totalInvested) * 100
        : 0;

    // Asset allocation
    const stocks = investments.filter(inv => inv.type === 'stock' || inv.type === 'etf');
    const bonds = investments.filter(inv => inv.type === 'bond');
    const crypto = investments.filter(inv => inv.type === 'crypto');
    const cash = investments.filter(inv => inv.type === 'cash');
    const other = investments.filter(inv =>
        !['stock', 'etf', 'bond', 'crypto', 'cash'].includes(inv.type)
    );

    // Calculate performers
    const investmentsWithReturns = investments.map(inv => {
        const gainLoss = (inv.currentPrice || inv.purchasePrice) - inv.purchasePrice;
        const gainLossPercentage = inv.purchasePrice > 0
            ? (gainLoss / inv.purchasePrice) * 100
            : 0;
        return {
            symbol: inv.symbol,
            name: inv.name,
            type: inv.type,
            gainLossPercentage
        };
    });

    // Sort by performance
    const sorted = [...investmentsWithReturns].sort(
        (a, b) => b.gainLossPercentage - a.gainLossPercentage
    );

    const topPerformers = sorted.slice(0, AI_CONFIG.TOP_PERFORMERS_COUNT);
    const bottomPerformers = sorted.slice(-AI_CONFIG.BOTTOM_PERFORMERS_COUNT).reverse();

    // Bond summary
    let bondSummary;
    if (bonds.length > 0) {
        const totalBondValue = bonds.reduce(
            (sum, inv) => sum + (inv.currentPrice || inv.purchasePrice) * inv.quantity,
            0
        );
        const totalAnnualIncome = bonds.reduce((sum, inv) => {
            const faceValue = inv.faceValue || inv.purchasePrice * inv.quantity;
            return sum + (inv.fixedYield || 0) * faceValue / 100;
        }, 0);

        // Find next payment date
        const bondsWithPayments = bonds
            .filter(inv => inv.nextPaymentDate)
            .sort((a, b) =>
                new Date(a.nextPaymentDate!).getTime() - new Date(b.nextPaymentDate!).getTime()
            );

        bondSummary = {
            count: bonds.length,
            totalValue: totalBondValue,
            totalAnnualIncome,
            nextPaymentDate: bondsWithPayments[0]?.nextPaymentDate
        };
    }

    return {
        totalValue,
        totalInvested,
        totalGainLoss,
        totalGainLossPercentage,
        investmentCount: investments.length,
        assetAllocation: {
            stocks: stocks.length,
            bonds: bonds.length,
            crypto: crypto.length,
            cash: cash.length,
            other: other.length
        },
        topPerformers,
        bottomPerformers,
        bondSummary
    };
}

/**
 * Estimate token count for a given text
 * Uses a simple character-based approximation
 */
export function estimateTokenCount(text: string): number {
    return Math.ceil(text.length / AI_CONFIG.CHARS_PER_TOKEN);
}

/**
 * Estimate token count for portfolio context object
 */
export function estimateContextTokens(context: any): number {
    const contextString = JSON.stringify(context);
    return estimateTokenCount(contextString);
}

/**
 * Determine if context should be summarized based on size
 */
export function shouldSummarizeContext(
    investments: Investment[],
    isSpecificQuery: boolean
): boolean {
    if (!AI_CONFIG.ENABLE_CONTEXT_SUMMARIZATION) {
        return false;
    }

    // Don't summarize for specific queries
    if (isSpecificQuery) {
        return false;
    }

    // Summarize if portfolio is large
    return investments.length > AI_CONFIG.LARGE_PORTFOLIO_THRESHOLD;
}
