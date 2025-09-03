import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  en: {
    // Header
    'app.title': 'Investment Portfolio Tracker',
    'add.investment': 'Add Investment',
    'export.portfolio': 'Export Portfolio',
    'import.portfolio': 'Import Portfolio',
    'update.prices': 'Update Prices',
    'loading': 'Loading...',
    'last.update': 'Last Update',
    
    // Dashboard
    'dashboard.title': 'Portfolio Dashboard',
    'total.value': 'Total Value',
    'total.invested': 'Total Invested',
    'total.gain.loss': 'Total Gain/Loss',
    'gain.loss.percentage': 'Gain/Loss %',
    'no.investments': 'No investments yet',
    'add.first.investment': 'Add your first investment to get started',
    
    // Investment Types
    'type.crypto': 'Cryptocurrency',
    'type.stock': 'Stock',
    'type.etf': 'ETF',
    'type.bond': 'Bond',
    'type.cash': 'Cash',
    'type.commodity': 'Commodity',
    'type.other': 'Other',
    
    // Form Fields
    'symbol': 'Symbol',
    'name': 'Name',
    'investment.type': 'Investment Type',
    'quantity': 'Quantity',
    'purchase.price': 'Purchase Price',
    'purchase.date': 'Purchase Date',
    'current.price': 'Current Price',
    'currency': 'Currency',
    'fixed.yield': 'Fixed Yield (% per annum)',
    'payment.frequency': 'Payment Frequency',
    'maturity.date': 'Maturity Date',
    'face.value': 'Face Value (Optional)',
    'last.payment.date': 'Last Payment Date Received',
    'next.payment.date': 'Next Payment Date',
    
    // Payment Frequencies
    'frequency.monthly': 'Monthly',
    'frequency.quarterly': 'Quarterly',
    'frequency.semi.annual': 'Semi-Annual',
    'frequency.annual': 'Annual',
    'frequency.zero.coupon': 'Zero Coupon',
    'frequency.unknown': 'Unknown',
    
    // Form Actions
    'add': 'Add',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'remove': 'Remove',
    'delete': 'Delete',
    'investment': 'Investment',
    
    // Validation Messages
    'required': 'Required',
    'symbol.required': 'Symbol is required',
    'name.required': 'Name is required',
    'quantity.required': 'Quantity must be greater than 0',
    'price.required': 'Purchase price must be greater than 0',
    'date.required': 'Purchase date is required',
    'yield.negative': 'Fixed yield cannot be negative',
    'maturity.after.purchase': 'Maturity date must be after purchase date',
    'face.value.positive': 'Face value must be greater than 0',
    'last.payment.required': 'Last payment date is required for bonds purchased after payment cycles',
    'last.payment.before.purchase': 'Last payment date cannot be before purchase date',
    'next.payment.required': 'Next payment date is required for recently purchased bonds',
    'next.payment.after.purchase': 'Next payment date must be after purchase date',
    
    // Bond Analysis
    'bond.analysis': 'Bond Analysis',
    'detected.frequency': 'Detected payment frequency',
    'confidence': 'Confidence',
    'estimated.payment': 'Estimated payment',
    'payment.amount': 'Payment amount',
    'annual.income': 'Annual income',
    'per.payment': 'per payment',
    'next.payment': 'Next Payment',
    'days': 'days',
    'days.overdue': 'days overdue',
    'coupon.payment': 'coupon payment',
    'coupon': 'Coupon',
    
    // Cash Flow
    'bond.cash.flow': 'Bond Cash Flow Summary',
    'monthly.income': 'Monthly Income',
    'quarterly.income': 'Quarterly Income',
    'annual.income': 'Annual Income',
    'upcoming.payments': 'Upcoming Payments',
    'bond.holdings': 'Bond Holdings',
    'refresh.calculations': 'Refresh Calculations',
    'debug': 'Debug',
    'no.upcoming.payments': 'No upcoming payments scheduled',
    'no.bond.investments': 'No Bond Investments',
    'add.bonds.message': 'Add bonds with fixed yields to see cash flow projections',
    
    // Portfolio Stats
    'portfolio.statistics': 'Portfolio Statistics',
    'portfolio.allocation': 'Portfolio Allocation',
    'total.return': 'Total Return',
    'annualized.return': 'Annualized Return',
    'volatility': 'Volatility',
    'sharpe.ratio': 'Sharpe Ratio',
    'max.drawdown': 'Max Drawdown',
    
    // Currency Names
    'currency.usd': 'USD - US Dollar',
    'currency.eur': 'EUR - Euro',
    'currency.gbp': 'GBP - British Pound',
    'currency.jpy': 'JPY - Japanese Yen',
    'currency.cad': 'CAD - Canadian Dollar',
    'currency.aud': 'AUD - Australian Dollar',
    'currency.chf': 'CHF - Swiss Franc',
    'currency.cny': 'CNY - Chinese Yuan',
    'currency.inr': 'INR - Indian Rupee',
    'currency.brl': 'BRL - Brazilian Real',
    'currency.mxn': 'MXN - Mexican Peso',
    'currency.ars': 'ARS - Argentine Peso',
    
    // Helper Text
    'currency.helper': 'Exchange rates are automatically fetched and updated hourly',
    'face.value.helper': 'Face value is used for accurate yield calculations. If not provided, we\'ll use purchase price × quantity',
    'purchase.price.helper': 'Enter amount in any currency',
    'purchase.price.usd.helper': 'Enter amount in USD',
    
    // Placeholders
    'placeholder.symbol': 'e.g., AAPL, BTC, SPY',
    'placeholder.name': 'e.g., Apple Inc., Bitcoin, S&P 500 ETF',
    'placeholder.quantity': '0',
    'placeholder.price': '0.00',
    'placeholder.yield': 'e.g., 3.5',
    'placeholder.face.value': 'Leave blank to use purchase price × quantity',
    
    // Messages
    'investment.added': 'Investment added successfully',
    'investment.updated': 'Investment updated successfully',
    'investment.removed': 'Investment removed successfully',
    'portfolio.exported': 'Portfolio exported successfully',
    'portfolio.imported': 'Portfolio imported successfully',
    'prices.updated': 'Prices updated successfully',
    
    // Errors
    'error.general': 'An error occurred',
    'error.invalid.file': 'Invalid file format',
    'error.import.failed': 'Failed to import portfolio',
    'error.export.failed': 'Failed to export portfolio',
    'error.update.prices': 'Failed to update prices',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    
    // Navigation
    'back.to.portfolio': 'Back to Portfolio',
    'bond.analysis.subtitle': 'Advanced bond portfolio analysis and cash flow projections',
    'bond.analysis.button': 'Bond Analysis',
    
    // Currency
    'currency.display': 'Display Currency',
    

  },
  es: {
    // Header
    'app.title': 'Rastreador de Portafolio de Inversiones',
    'add.investment': 'Agregar Inversión',
    'export.portfolio': 'Exportar Portafolio',
    'import.portfolio': 'Importar Portafolio',
    'update.prices': 'Actualizar Precios',
    'loading': 'Cargando...',
    'last.update': 'Última Actualización',
    
    // Dashboard
    'dashboard.title': 'Panel del Portafolio',
    'total.value': 'Valor Total',
    'total.invested': 'Total Invertido',
    'total.gain.loss': 'Ganancia/Pérdida Total',
    'gain.loss.percentage': 'Ganancia/Pérdida %',
    'no.investments': 'Aún no hay inversiones',
    'add.first.investment': 'Agrega tu primera inversión para comenzar',
    
    // Investment Types
    'type.crypto': 'Criptomoneda',
    'type.stock': 'Acción',
    'type.etf': 'ETF',
    'type.bond': 'Bono',
    'type.cash': 'Efectivo',
    'type.commodity': 'Materia Prima',
    'type.other': 'Otro',
    
    // Form Fields
    'symbol': 'Símbolo',
    'name': 'Nombre',
    'investment.type': 'Tipo de Inversión',
    'quantity': 'Cantidad',
    'purchase.price': 'Precio de Compra',
    'purchase.date': 'Fecha de Compra',
    'current.price': 'Precio Actual',
    'currency': 'Moneda',
    'fixed.yield': 'Rendimiento Fijo (% anual)',
    'payment.frequency': 'Frecuencia de Pago',
    'maturity.date': 'Fecha de Vencimiento',
    'face.value': 'Valor Nominal (Opcional)',
    'last.payment.date': 'Fecha del Último Pago Recibido',
    'next.payment.date': 'Próxima Fecha de Pago',
    
    // Payment Frequencies
    'frequency.monthly': 'Mensual',
    'frequency.quarterly': 'Trimestral',
    'frequency.semi.annual': 'Semestral',
    'frequency.annual': 'Anual',
    'frequency.zero.coupon': 'Cupón Cero',
    'frequency.unknown': 'Desconocido',
    
    // Form Actions
    'add': 'Agregar',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'edit': 'Editar',
    'remove': 'Eliminar',
    'delete': 'Eliminar',
    'investment': 'Inversión',
    
    // Validation Messages
    'required': 'Requerido',
    'symbol.required': 'El símbolo es requerido',
    'name.required': 'El nombre es requerido',
    'quantity.required': 'La cantidad debe ser mayor a 0',
    'price.required': 'El precio de compra debe ser mayor a 0',
    'date.required': 'La fecha de compra es requerida',
    'yield.negative': 'El rendimiento fijo no puede ser negativo',
    'maturity.after.purchase': 'La fecha de vencimiento debe ser después de la fecha de compra',
    'face.value.positive': 'El valor nominal debe ser mayor a 0',
    'last.payment.required': 'La fecha del último pago es requerida para bonos comprados después de ciclos de pago',
    'last.payment.before.purchase': 'La fecha del último pago no puede ser antes de la fecha de compra',
    'next.payment.required': 'La próxima fecha de pago es requerida para bonos recientemente comprados',
    'next.payment.after.purchase': 'La próxima fecha de pago debe ser después de la fecha de compra',
    
    // Bond Analysis
    'bond.analysis': 'Análisis de Bonos',
    'detected.frequency': 'Frecuencia de pago detectada',
    'confidence': 'Confianza',
    'estimated.payment': 'Pago estimado',
    'payment.amount': 'Monto del pago',
    'annual.income': 'Ingreso anual',
    'per.payment': 'por pago',
    'next.payment': 'Próximo Pago',
    'days': 'días',
    'days.overdue': 'días de retraso',
    'coupon.payment': 'pago de cupón',
    'coupon': 'Cupón',
    
    // Cash Flow
    'bond.cash.flow': 'Resumen de Flujo de Caja de Bonos',
    'monthly.income': 'Ingreso Mensual',
    'quarterly.income': 'Ingreso Trimestral',
    'annual.income': 'Ingreso Anual',
    'upcoming.payments': 'Pagos Próximos',
    'bond.holdings': 'Tenencia de Bonos',
    'refresh.calculations': 'Actualizar Cálculos',
    'debug': 'Depurar',
    'no.upcoming.payments': 'No hay pagos próximos programados',
    'no.bond.investments': 'No Hay Inversiones en Bonos',
    'add.bonds.message': 'Agrega bonos con rendimientos fijos para ver proyecciones de flujo de caja',
    
    // Portfolio Stats
    'portfolio.statistics': 'Estadísticas del Portafolio',
    'portfolio.allocation': 'Asignación del Portafolio',
    'total.return': 'Retorno Total',
    'annualized.return': 'Retorno Anualizado',
    'volatility': 'Volatilidad',
    'sharpe.ratio': 'Ratio de Sharpe',
    'max.drawdown': 'Máxima Caída',
    
    // Currency Names
    'currency.usd': 'USD - Dólar Estadounidense',
    'currency.eur': 'EUR - Euro',
    'currency.gbp': 'GBP - Libra Esterlina',
    'currency.jpy': 'JPY - Yen Japonés',
    'currency.cad': 'CAD - Dólar Canadiense',
    'currency.aud': 'AUD - Dólar Australiano',
    'currency.chf': 'CHF - Franco Suizo',
    'currency.cny': 'CNY - Yuan Chino',
    'currency.inr': 'INR - Rupia India',
    'currency.brl': 'BRL - Real Brasileño',
    'currency.mxn': 'MXN - Peso Mexicano',
    'currency.ars': 'ARS - Peso Argentino',
    
    // Helper Text
    'currency.helper': 'Las tasas de cambio se obtienen y actualizan automáticamente cada hora',
    'face.value.helper': 'El valor nominal se usa para cálculos precisos de rendimiento. Si no se proporciona, usaremos precio de compra × cantidad',
    'purchase.price.helper': 'Ingresa el monto en cualquier moneda',
    'purchase.price.usd.helper': 'Ingresa el monto en USD',
    
    // Placeholders
    'placeholder.symbol': 'ej., AAPL, BTC, SPY',
    'placeholder.name': 'ej., Apple Inc., Bitcoin, S&P 500 ETF',
    'placeholder.quantity': '0',
    'placeholder.price': '0.00',
    'placeholder.yield': 'ej., 3.5',
    'placeholder.face.value': 'Deja en blanco para usar precio de compra × cantidad',
    
    // Messages
    'investment.added': 'Inversión agregada exitosamente',
    'investment.updated': 'Inversión actualizada exitosamente',
    'investment.removed': 'Inversión eliminada exitosamente',
    'portfolio.exported': 'Portafolio exportado exitosamente',
    'portfolio.imported': 'Portafolio importado exitosamente',
    'prices.updated': 'Precios actualizados exitosamente',
    
    // Errors
    'error.general': 'Ocurrió un error',
    'error.invalid.file': 'Formato de archivo inválido',
    'error.import.failed': 'Falló la importación del portafolio',
    'error.export.failed': 'Falló la exportación del portafolio',
    'error.update.prices': 'Falló la actualización de precios',
    
    // Theme
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    
    // Navigation
    'back.to.portfolio': 'Volver al Portafolio',
    'bond.analysis.subtitle': 'Análisis avanzado de portafolio de bonos y proyecciones de flujo de caja',
    'bond.analysis.button': 'Análisis de Bonos',
    
    // Currency
    'currency.display': 'Moneda de Visualización',
    

  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
