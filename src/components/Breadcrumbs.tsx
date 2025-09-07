import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      <ol className="flex items-center space-x-1" itemScope itemType="https://schema.org/BreadcrumbList">
        {/* Home link */}
        <li className="flex items-center">
          <a 
            href="/" 
            className="flex items-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </a>
        </li>
        
        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            {item.current ? (
              <span 
                className="font-medium text-gray-900 dark:text-white"
                aria-current="page"
                itemProp="name"
              >
                {item.label}
              </span>
            ) : (
              <a 
                href={item.href}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                itemProp="name"
              >
                {item.label}
              </a>
            )}
            <meta itemProp="position" content={(index + 2).toString()} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
