import type { Investment } from '../types/investment';
import { PortfolioService, type PortfolioContext } from './portfolioService';
import { PriceService, type BulkPriceUpdateResult } from './priceService';
import { AnalysisService } from './analysisService';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  usage?: any;
  steps?: number;
  toolCalls?: number;
  toolResults?: number;
  updatedPortfolio?: {
    investments: Investment[];
    totalValue: number;
    totalInvested: number;
    totalGainLoss: number;
    totalGainLossPercentage: number;
  };
}

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: string;
}

export class ChatApiService {
  private portfolioService: PortfolioService;
  private priceService: PriceService;
  private analysisService: AnalysisService;

  constructor() {
    this.portfolioService = new PortfolioService();
    this.priceService = new PriceService();
    this.analysisService = new AnalysisService();
  }

  /**
   * Send message to chat API
   */
  async sendMessage(
    messages: ChatMessage[],
    portfolioContext: PortfolioContext | null
  ): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          portfolioContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }

  /**
   * Refresh all investment prices
   */
  async refreshPrices(investments: Investment[]): Promise<ToolResult> {
    try {
      if (investments.length === 0) {
        return {
          success: false,
          message: 'No investments found in portfolio to refresh',
          timestamp: new Date().toISOString()
        };
      }

      const result: BulkPriceUpdateResult = await this.priceService.updateBulkPrices(investments);
      
      // Update investments with new prices
      const updatedInvestments = investments.map(investment => {
        const priceResult = result.results.find(r => r.symbol === investment.symbol);
        if (priceResult && priceResult.success) {
          return {
            ...investment,
            currentPrice: priceResult.newPrice,
            lastUpdated: priceResult.timestamp
          };
        }
        return investment;
      });

      const summary = this.portfolioService.calculatePortfolioSummary(updatedInvestments);

      return {
        success: true,
        message: `Successfully refreshed prices for ${result.successCount} out of ${result.totalCount} investments`,
        data: {
          results: result.results,
          totalInvestments: result.totalCount,
          successfullyRefreshed: result.successCount,
          updatedPortfolio: {
            investments: updatedInvestments,
            totalValue: summary.totalValue,
            totalInvested: summary.totalInvested,
            totalGainLoss: summary.totalGainLoss,
            totalGainLossPercentage: summary.totalGainLossPercentage
          }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error refreshing prices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to refresh prices',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Add a new investment
   */
  async addInvestment(
    investments: Investment[],
    investmentData: Omit<Investment, 'id'>
  ): Promise<ToolResult> {
    try {
      const { updatedInvestments, summary } = this.portfolioService.addInvestment(
        investments,
        investmentData
      );

      return {
        success: true,
        message: `Successfully added ${investmentData.quantity} shares of ${investmentData.symbol} (${investmentData.name}) to your portfolio`,
        data: {
          investment: updatedInvestments[updatedInvestments.length - 1],
          updatedPortfolio: {
            investments: updatedInvestments,
            totalValue: summary.totalValue,
            totalInvested: summary.totalInvested,
            totalGainLoss: summary.totalGainLoss,
            totalGainLossPercentage: summary.totalGainLossPercentage
          }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding investment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to add investment',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update an existing investment
   */
  async updateInvestment(
    investments: Investment[],
    id: string,
    updates: Partial<Investment>
  ): Promise<ToolResult> {
    try {
      const { updatedInvestments, summary } = this.portfolioService.updateInvestment(
        investments,
        id,
        updates
      );

      const updatedInvestment = updatedInvestments.find(inv => inv.id === id);

      return {
        success: true,
        message: `Successfully updated investment ${updatedInvestment?.symbol} (${updatedInvestment?.name})`,
        data: {
          investment: updatedInvestment,
          updatedPortfolio: {
            investments: updatedInvestments,
            totalValue: summary.totalValue,
            totalInvested: summary.totalInvested,
            totalGainLoss: summary.totalGainLoss,
            totalGainLossPercentage: summary.totalGainLossPercentage
          }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating investment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update investment',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Remove an investment
   */
  async removeInvestment(
    investments: Investment[],
    id: string
  ): Promise<ToolResult> {
    try {
      const { updatedInvestments, summary, removedInvestment } = this.portfolioService.removeInvestment(
        investments,
        id
      );

      return {
        success: true,
        message: `Successfully removed investment ${removedInvestment.symbol} (${removedInvestment.name}) from your portfolio`,
        data: {
          removedInvestment,
          updatedPortfolio: {
            investments: updatedInvestments,
            totalValue: summary.totalValue,
            totalInvested: summary.totalInvested,
            totalGainLoss: summary.totalGainLoss,
            totalGainLossPercentage: summary.totalGainLossPercentage
          }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error removing investment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to remove investment',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * List investments with optional filtering
   */
  async listInvestments(
    investments: Investment[],
    filters?: { type?: string; symbol?: string }
  ): Promise<ToolResult> {
    try {
      const filteredInvestments = this.portfolioService.listInvestments(investments, filters);

      return {
        success: true,
        message: `Found ${filteredInvestments.length} investment(s) matching your criteria`,
        data: {
          investments: filteredInvestments,
          totalCount: filteredInvestments.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error listing investments:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to list investments',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analyze portfolio
   */
  async analyzePortfolio(
    investments: Investment[],
    analysisType: 'performance' | 'risk' | 'diversification' | 'bonds' | 'overview' = 'performance',
    timeframe: string = 'all time'
  ): Promise<ToolResult> {
    try {
      const analysis = this.portfolioService.analyzePerformance(investments, analysisType, timeframe);

      return {
        success: true,
        message: `Portfolio analysis completed for ${analysisType} over ${timeframe}`,
        data: { analysis },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze portfolio',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test tool functionality
   */
  async testTool(message: string): Promise<ToolResult> {
    try {
      console.log('🧪 TEST TOOL CALLED:', message);
      return {
        success: true,
        message: 'Test tool executed successfully',
        data: { testMessage: message },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in test tool:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Test tool failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Build portfolio context for AI
   */
  async buildPortfolioContext(
    investments: Investment[],
    currency: string = 'USD',
    exchangeRates: Record<string, number> = {}
  ): Promise<PortfolioContext> {
    return await this.portfolioService.buildPortfolioContext(investments, currency, exchangeRates);
  }

  /**
   * Get comprehensive analysis
   */
  async getComprehensiveAnalysis(investments: Investment[]) {
    return await this.analysisService.analyzePortfolio(investments);
  }

  /**
   * Compare to benchmark
   */
  async compareToBenchmark(
    investments: Investment[],
    benchmark: 'SP500' | 'NASDAQ' | 'BOND' | 'CRYPTO'
  ) {
    return this.analysisService.compareToBenchmark(investments, benchmark);
  }
}
