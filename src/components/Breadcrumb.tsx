import React from "react";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-gray-500" style={{ marginBottom: 'var(--spacing-lg)', fontSize: 'var(--text-sm)' }}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight size={14} className="mx-2 text-gray-400" />
          )}
          <span
            className={`${
              index === items.length - 1
                ? "text-gray-800 font-semibold"
                : "text-gray-500"
            }`}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
