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
    'app.subtitle': 'Track your investments in real-time',
    'add.investment': 'Add Investment',
    'export.portfolio': 'Export Portfolio',
    'import.portfolio': 'Import Portfolio',
    'update.prices': 'Update Prices',
    'loading': 'Loading...',
    'last.update': 'Last Update',
    'bond.analysis.button': 'Bond Analysis',
    'performance.comparison.button': 'Performance Comparison',
    'chat.button': 'Chat',
    'back.to.portfolio': 'Back to Portfolio',
    'refresh': 'Refresh',
    
    // Dashboard
    'dashboard.title': 'Portfolio Dashboard',
    'total.value': 'Total Value',
    'total.invested': 'Total Invested',
    'total.gain.loss': 'Total Gain/Loss',
    'gain.loss.percentage': 'Gain/Loss %',
    'no.investments': 'No investments yet',
    'add.first.investment': 'Add your first investment to get started',
    
    // Performance Comparison
    'performance.comparison': 'Performance Comparison',
    'performance.comparison.subtitle': 'Compare your portfolio performance against market benchmarks',
    'performance.comparison.10k.subtitle': 'Compare 10k {currency} investment performance against {benchmark}',
    'percentage.growth': 'Percentage Growth: Portfolio vs {benchmark}',
    'investment.amount': 'Investment Amount',
    'portfolio.return': 'Portfolio Return',
    'benchmark.return': 'Benchmark Return',
    'final.value': 'Final Value',
    'alpha.title': 'Alpha (Portfolio Outperformance)',
    'alpha.subtitle': 'How much your portfolio outperformed the benchmark over this period',
    'portfolio.allocation.title': 'Portfolio Allocation & Investment Breakdown',
    'portfolio.allocation.subtitle': 'How the {amount} was distributed across your portfolio',
    'outperformed.by': 'Your portfolio outperformed {benchmark} by {percentage}%',
    'underperformed.by': 'Your portfolio underperformed {benchmark} by {percentage}%',
    'benchmark': 'Benchmark',
    'time.period': 'Time Period',
    'start.date': 'Start Date',
    'end.date': 'End Date',
    
    // Bond Analysis
    'bond.analysis': 'Bond Analysis',
    'bond.analysis.subtitle': 'Advanced bond portfolio analysis and cash flow projections',
    'no.bond.investments.title': 'No Bond Investments Found',
    'no.bond.investments.subtitle': 'Add bonds to your portfolio to access advanced bond analysis, cash flow projections, and yield optimization tools.',
    'bond.portfolio.summary': 'Bond Portfolio Summary',
    'total.annual.income': 'Total Annual Income',
    'average.yield': 'Average Yield',
    'next.payment.date': 'Next Payment Date',
    'bond.details': 'Bond Details',
    'maturity.date': 'Maturity Date',
    'payment.frequency': 'Payment Frequency',
    'coupon.rate': 'Coupon Rate',
    'face.value': 'Face Value',
    'current.yield': 'Current Yield',
    'yield.to.maturity': 'Yield to Maturity',
    'accrued.interest': 'Accrued Interest',
    'days.to.maturity': 'Days to Maturity',
    'cash.flow.projections': 'Cash Flow Projections',
    
    // Charts
    'view.chart': 'View Chart',
    'price.history': 'Price History',
    'chart.powered.by': 'Powered by TradingView',
    'chart.real.time': 'Real-time data',
    'chart.symbol': 'Symbol',
    'chart.loading': 'Loading chart...',
    
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
    'last.payment.date': 'Last Payment Date Received',
    'next.payment.date.field': 'Next Payment Date',
    'coupon.rate.field': 'Coupon Rate (%)',
    'face.value.field': 'Face Value (Optional)',
    
    // Payment Frequencies
    'frequency.monthly': 'Monthly',
    'frequency.quarterly': 'Quarterly',
    'frequency.semi-annual': 'Semi-Annual',
    'frequency.annual': 'Annual',
    
    // Form Actions
    'add': 'Add',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'remove': 'Remove',
    'update': 'Update',
    'clear': 'Clear',
    'reset': 'Reset',
    
    // Form Validation
    'required.field': 'This field is required',
    'invalid.number': 'Please enter a valid number',
    'invalid.date': 'Please enter a valid date',
    'invalid.percentage': 'Please enter a valid percentage',
    
    // Form Helpers
    'purchase.price.usd.helper': 'Enter amount in USD',
    'face.value.helper': 'Leave blank to use purchase price × quantity',
    'yield.helper': 'Annual percentage yield',
    'maturity.date.helper': 'Bond maturity date',
    
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
    
    // Chat/AI Assistant
    'chat.title': 'AI Investment Assistant',
    'chat.subtitle': 'Get help with your investment portfolio',
    'chat.welcome.title': 'Welcome to your AI Investment Assistant!',
    'chat.welcome.message': 'I can help you with investment strategies, portfolio analysis, bond calculations, market insights, and more. What would you like to know?',
    'chat.placeholder': 'Ask me about investments, portfolio analysis, bonds...',
    'chat.error.connection': 'Sorry, there was an error connecting to the AI assistant. Please try again.',
    'chat.error.generic': 'I\'m currently having trouble connecting to the AI service. Please try again in a moment.',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    
    // Date/Time
    'never': 'Never',
    'today': 'Today',
    'yesterday': 'Yesterday',
    'days.ago': '{days} days ago',
    'months.ago': '{months} months ago',
    'years.ago': '{years} years ago',
    
    // Navigation
    'go.back': 'Go Back',
    'next': 'Next',
    'previous': 'Previous',
    'close': 'Close',
    'open': 'Open',
    'show': 'Show',
    'hide': 'Hide',
    
    // General
    'yes': 'Yes',
    'no': 'No',
    'ok': 'OK',
    'confirm': 'Confirm',
    'warning': 'Warning',
    'info': 'Information',
    'success': 'Success',
    'error': 'Error'
  },
  es: {
    // Header
    'app.title': 'Rastreador de Portafolio de Inversiones',
    'app.subtitle': 'Rastrea tus inversiones en tiempo real',
    'add.investment': 'Agregar Inversión',
    'export.portfolio': 'Exportar Portafolio',
    'import.portfolio': 'Importar Portafolio',
    'update.prices': 'Actualizar Precios',
    'loading': 'Cargando...',
    'last.update': 'Última Actualización',
    'bond.analysis.button': 'Análisis de Bonos',
    'performance.comparison.button': 'Comparación de Rendimiento',
    'chat.button': 'Chat',
    'back.to.portfolio': 'Volver al Portafolio',
    'refresh': 'Actualizar',
    
    // Dashboard
    'dashboard.title': 'Panel de Portafolio',
    'total.value': 'Valor Total',
    'total.invested': 'Total Invertido',
    'total.gain.loss': 'Ganancia/Pérdida Total',
    'gain.loss.percentage': '% Ganancia/Pérdida',
    'no.investments': 'Aún no hay inversiones',
    'add.first.investment': 'Agrega tu primera inversión para comenzar',
    
    // Performance Comparison
    'performance.comparison': 'Comparación de Rendimiento',
    'performance.comparison.subtitle': 'Compara el rendimiento de tu portafolio contra benchmarks del mercado',
    'performance.comparison.10k.subtitle': 'Compara el rendimiento de una inversión de 10k {currency} contra {benchmark}',
    'percentage.growth': 'Crecimiento Porcentual: Portafolio vs {benchmark}',
    'investment.amount': 'Monto de Inversión',
    'portfolio.return': 'Retorno del Portafolio',
    'benchmark.return': 'Retorno del Benchmark',
    'final.value': 'Valor Final',
    'alpha.title': 'Alfa (Sobrerrendimiento del Portafolio)',
    'alpha.subtitle': 'Cuánto superó tu portafolio al benchmark durante este período',
    'portfolio.allocation.title': 'Asignación del Portafolio y Desglose de Inversiones',
    'portfolio.allocation.subtitle': 'Cómo se distribuyó {amount} a través de tu portafolio',
    'outperformed.by': 'Tu portafolio superó a {benchmark} por {percentage}%',
    'underperformed.by': 'Tu portafolio fue inferior a {benchmark} por {percentage}%',
    'benchmark': 'Benchmark',
    'time.period': 'Período de Tiempo',
    'start.date': 'Fecha de Inicio',
    'end.date': 'Fecha de Fin',
    
    // Bond Analysis
    'bond.analysis': 'Análisis de Bonos',
    'bond.analysis.subtitle': 'Análisis avanzado de portafolio de bonos y proyecciones de flujo de caja',
    'no.bond.investments.title': 'No se Encontraron Inversiones en Bonos',
    'no.bond.investments.subtitle': 'Agrega bonos a tu portafolio para acceder a análisis avanzado de bonos, proyecciones de flujo de caja y herramientas de optimización de rendimiento.',
    'bond.portfolio.summary': 'Resumen del Portafolio de Bonos',
    'total.annual.income': 'Ingreso Anual Total',
    'average.yield': 'Rendimiento Promedio',
    'next.payment.date': 'Próxima Fecha de Pago',
    'bond.details': 'Detalles del Bono',
    'maturity.date': 'Fecha de Vencimiento',
    'payment.frequency': 'Frecuencia de Pago',
    'coupon.rate': 'Tasa de Cupón',
    'face.value': 'Valor Nominal',
    'current.yield': 'Rendimiento Actual',
    'yield.to.maturity': 'Rendimiento al Vencimiento',
    'accrued.interest': 'Interés Devengado',
    'days.to.maturity': 'Días al Vencimiento',
    'cash.flow.projections': 'Proyecciones de Flujo de Caja',
    
    // Charts
    'view.chart': 'Ver Gráfico',
    'price.history': 'Historial de Precios',
    'chart.powered.by': 'Desarrollado por TradingView',
    'chart.real.time': 'Datos en tiempo real',
    'chart.symbol': 'Símbolo',
    'chart.loading': 'Cargando gráfico...',
    
    // Investment Types
    'type.crypto': 'Criptomoneda',
    'type.stock': 'Acción',
    'type.etf': 'ETF',
    'type.bond': 'Bono',
    'type.cash': 'Efectivo',
    'type.commodity': 'Commodity',
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
    'fixed.yield': 'Rendimiento Fijo (% por año)',
    'last.payment.date': 'Última Fecha de Pago Recibida',
    'next.payment.date.field': 'Próxima Fecha de Pago',
    'coupon.rate.field': 'Tasa de Cupón (%)',
    'face.value.field': 'Valor Nominal (Opcional)',
    
    // Payment Frequencies
    'frequency.monthly': 'Mensual',
    'frequency.quarterly': 'Trimestral',
    'frequency.semi-annual': 'Semestral',
    'frequency.annual': 'Anual',
    
    // Form Actions
    'add': 'Agregar',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'edit': 'Editar',
    'delete': 'Eliminar',
    'remove': 'Quitar',
    'update': 'Actualizar',
    'clear': 'Limpiar',
    'reset': 'Reiniciar',
    
    // Form Validation
    'required.field': 'Este campo es obligatorio',
    'invalid.number': 'Por favor ingresa un número válido',
    'invalid.date': 'Por favor ingresa una fecha válida',
    'invalid.percentage': 'Por favor ingresa un porcentaje válido',
    
    // Form Helpers
    'purchase.price.usd.helper': 'Ingresa el monto en USD',
    'face.value.helper': 'Deja en blanco para usar precio de compra × cantidad',
    'yield.helper': 'Rendimiento porcentual anual',
    'maturity.date.helper': 'Fecha de vencimiento del bono',
    
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
    
    // Chat/AI Assistant
    'chat.title': 'Asistente de IA para Inversiones',
    'chat.subtitle': 'Obtén ayuda con tu portafolio de inversiones',
    'chat.welcome.title': '¡Bienvenido a tu Asistente de IA para Inversiones!',
    'chat.welcome.message': 'Puedo ayudarte con estrategias de inversión, análisis de portafolio, cálculos de bonos, perspectivas del mercado y más. ¿Qué te gustaría saber?',
    'chat.placeholder': 'Pregúntame sobre inversiones, análisis de portafolio, bonos...',
    'chat.error.connection': 'Lo siento, hubo un error al conectar con el asistente de IA. Por favor, inténtalo de nuevo.',
    'chat.error.generic': 'Actualmente tengo problemas para conectar con el servicio de IA. Por favor, inténtalo de nuevo en un momento.',
    
    // Theme
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',
    
    // Language
    'language.english': 'English',
    'language.spanish': 'Español',
    
    // Date/Time
    'never': 'Nunca',
    'today': 'Hoy',
    'yesterday': 'Ayer',
    'days.ago': 'hace {days} días',
    'months.ago': 'hace {months} meses',
    'years.ago': 'hace {years} años',
    
    // Navigation
    'go.back': 'Volver',
    'next': 'Siguiente',
    'previous': 'Anterior',
    'close': 'Cerrar',
    'open': 'Abrir',
    'show': 'Mostrar',
    'hide': 'Ocultar',
    
    // General
    'yes': 'Sí',
    'no': 'No',
    'ok': 'OK',
    'confirm': 'Confirmar',
    'warning': 'Advertencia',
    'info': 'Información',
    'success': 'Éxito',
    'error': 'Error'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, interpolations?: Record<string, string>): string => {
    let translation = (translations[language] as any)[key] || key;
    
    // Handle interpolations like {currency}, {benchmark}, etc.
    if (interpolations) {
      Object.keys(interpolations).forEach(key => {
        translation = translation.replace(new RegExp(`\\{${key}\\}`, 'g'), interpolations[key]);
      });
    }
    
    return translation;
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