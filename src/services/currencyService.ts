export interface CurrencyRate {
  currency: string;
  rate: number;
  lastUpdated: string;
  source?: string; // Track the source of the rate
}

export interface ARSRateDetails {
  compra: number; // Buy rate (ARS per USD)
  venta: number;  // Sell rate (ARS per USD)
  nombre: string; // Rate name (e.g., "Oficial")
  fechaActualizacion: string; // Last update timestamp
}

export class CurrencyService {
  private baseUrl = 'https://open.er-api.com/v6/latest';
  private cache: Record<string, CurrencyRate> = {};
  private cacheExpiry = 1000 * 60 * 60; // 1 hour

  /**
   * Get exchange rate from any currency to USD
   */
  async getExchangeRate(fromCurrency: string): Promise<number> {
    const upperCurrency = fromCurrency.toUpperCase();
    
    // Return 1 for USD
    if (upperCurrency === 'USD') {
      return 1;
    }

    // Check cache first
    const cached = this.cache[upperCurrency];
    if (cached && this.isCacheValid(cached.lastUpdated)) {
      return cached.rate;
    }

    try {
      // Special handling for ARS using DolarAPI
      if (upperCurrency === 'ARS') {
        return await this.getARSExchangeRate();
      }

      const response = await fetch(`${this.baseUrl}/${upperCurrency}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate for ${upperCurrency}`);
      }

      const data = await response.json();
      
      if (data.result === 'success' && data.rates && data.rates.USD) {
        const rate = data.rates.USD;
        
        // Cache the result
        this.cache[upperCurrency] = {
          currency: upperCurrency,
          rate,
          lastUpdated: new Date().toISOString()
        };

        return rate;
      } else {
        throw new Error(`Invalid response for ${upperCurrency}`);
      }
    } catch (error) {
      console.error(`Error fetching exchange rate for ${upperCurrency}:`, error);
      
      // Return fallback rates for common currencies
      const fallbackRates: Record<string, number> = {
        'EUR': 1.08,
        'GBP': 1.27,
        'JPY': 0.0067,
        'CAD': 0.74,
        'AUD': 0.66,
        'CHF': 1.12,
        'CNY': 0.14,
        'INR': 0.012,
        'BRL': 0.21,
        'MXN': 0.059,
        'ARS': 0.00073 // Updated based on current DolarAPI rate (~1375 ARS per USD)
      };

      return fallbackRates[upperCurrency] || 1;
    }
  }

  /**
   * Convert amount from one currency to USD
   */
  async convertToUSD(amount: number, fromCurrency: string): Promise<number> {
    const rate = await this.getExchangeRate(fromCurrency);
    return amount * rate;
  }

  /**
   * Convert amount from USD to another currency
   */
  async convertFromUSD(amount: number, toCurrency: string): Promise<number> {
    const rate = await this.getExchangeRate(toCurrency);
    return amount / rate;
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'ARS',
      'KRW', 'RUB', 'ZAR', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON'
    ];
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(lastUpdated: string): boolean {
    const lastUpdate = new Date(lastUpdated).getTime();
    const now = Date.now();
    return (now - lastUpdate) < this.cacheExpiry;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Get ARS exchange rate using DolarAPI
   */
  private async getARSExchangeRate(): Promise<number> {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
      if (!response.ok) {
        throw new Error('Failed to fetch ARS exchange rate from DolarAPI');
      }

      const data = await response.json();
      
      // DolarAPI returns the rate as ARS per USD, so we need to convert to USD per ARS
      // Using the "venta" (sell) rate as it's more representative for conversions
      const arsPerUSD = data.venta;
      const usdPerARS = 1 / arsPerUSD;
      
      console.log(`ARS rate from DolarAPI: ${arsPerUSD} ARS per USD (${usdPerARS} USD per ARS)`);
      
      // Cache the result
      this.cache['ARS'] = {
        currency: 'ARS',
        rate: usdPerARS,
        lastUpdated: new Date().toISOString(),
        source: 'DolarAPI'
      };

      return usdPerARS;
    } catch (error) {
      console.error('Error fetching ARS exchange rate from DolarAPI:', error);
      
      // Return fallback rate if DolarAPI fails
      const fallbackRate = 0.0012; // 1 ARS = 0.0012 USD (approximate)
      
      this.cache['ARS'] = {
        currency: 'ARS',
        rate: fallbackRate,
        lastUpdated: new Date().toISOString(),
        source: 'Fallback'
      };

      return fallbackRate;
    }
  }

  /**
   * Get ARS rate details from DolarAPI
   */
  async getARSRateDetails(): Promise<ARSRateDetails | null> {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
      if (!response.ok) {
        throw new Error('Failed to fetch ARS rate details from DolarAPI');
      }

      const data = await response.json();
      return {
        compra: data.compra,
        venta: data.venta,
        nombre: data.nombre,
        fechaActualizacion: data.fechaActualizacion
      };
    } catch (error) {
      console.error('Error fetching ARS rate details from DolarAPI:', error);
      return null;
    }
  }

  /**
   * Get cached rates
   */
  getCachedRates(): Record<string, CurrencyRate> {
    return { ...this.cache };
  }
}
