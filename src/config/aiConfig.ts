/**
 * Configuration for AI Assistant context optimization
 */
export const AI_CONFIG = {
    /**
     * Maximum number of tokens to use for portfolio context
     * If estimated context exceeds this, summarization will be applied
     */
    MAX_CONTEXT_TOKENS: 3000,

    /**
     * Portfolio size threshold for automatic summarization
     * Portfolios with more investments than this will be summarized for general queries
     */
    LARGE_PORTFOLIO_THRESHOLD: 15,

    /**
     * Number of top performing investments to include in summary
     */
    TOP_PERFORMERS_COUNT: 5,

    /**
     * Number of bottom performing investments to include in summary
     */
    BOTTOM_PERFORMERS_COUNT: 5,

    /**
     * Enable query analysis to detect specific asset mentions
     */
    ENABLE_QUERY_ANALYSIS: true,

    /**
     * Enable automatic context summarization for large portfolios
     */
    ENABLE_CONTEXT_SUMMARIZATION: true,

    /**
     * Approximate characters per token ratio for estimation
     */
    CHARS_PER_TOKEN: 4,
} as const;

export type AIConfig = typeof AI_CONFIG;
