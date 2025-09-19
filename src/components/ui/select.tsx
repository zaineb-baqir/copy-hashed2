// components/ui/select.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils"; // أو استبدله بالـ className مباشرة

// المكون الأساسي
export const Select = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative inline-block w-full", className)} {...props}>
    {children}
  </div>
));
Select.displayName = "Select";

// زر عرض القيمة
export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "w-full border rounded p-2 text-left hover:bg-gray-100",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

// القيمة المعروضة داخل الزر
// القيمة المعروضة داخل الزر
interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, children, placeholder, ...props }, ref) => (
    <span ref={ref} className={cn("text-gray-700", className)} {...props}>
      {children || placeholder}
    </span>
  )
);
SelectValue.displayName = "SelectValue";

// القائمة المنسدلة
export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectContent.displayName = "SelectContent";

// عنصر داخل القائمة
export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => (
  <div
    ref={ref}
    data-value={value}
    className={cn(
      "cursor-pointer px-3 py-2 hover:bg-gray-200",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";
