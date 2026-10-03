/**
 * Typography components with consistent KLE styling
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

// Heading Components
export function PageHeading({ children, className, as: Component = 'h1' }: TypographyProps) {
  return (
    <Component className={cn('text-3xl font-bold text-gray-900 sm:text-4xl', className)}>
      {children}
    </Component>
  );
}

export function SectionHeading({ children, className, as: Component = 'h2' }: TypographyProps) {
  return (
    <Component className={cn('text-2xl font-semibold text-gray-900 sm:text-3xl', className)}>
      {children}
    </Component>
  );
}

export function SubHeading({ children, className, as: Component = 'h3' }: TypographyProps) {
  return (
    <Component className={cn('text-xl font-semibold text-gray-900', className)}>
      {children}
    </Component>
  );
}

export function CardHeading({ children, className, as: Component = 'h4' }: TypographyProps) {
  return (
    <Component className={cn('text-lg font-medium text-gray-900', className)}>
      {children}
    </Component>
  );
}

// Text Components
export function BodyText({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component className={cn('text-base text-gray-700 leading-relaxed', className)}>
      {children}
    </Component>
  );
}

export function CaptionText({ children, className, as: Component = 'p' }: TypographyProps) {
  return (
    <Component className={cn('text-sm text-gray-600', className)}>
      {children}
    </Component>
  );
}

export function MutedText({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn('text-sm text-gray-500', className)}>
      {children}
    </Component>
  );
}

export function SmallText({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn('text-xs text-gray-600', className)}>
      {children}
    </Component>
  );
}

// Emphasis Components
export function Strong({ children, className, as: Component = 'strong' }: TypographyProps) {
  return (
    <Component className={cn('font-semibold text-gray-900', className)}>
      {children}
    </Component>
  );
}

export function Emphasis({ children, className, as: Component = 'em' }: TypographyProps) {
  return (
    <Component className={cn('italic text-gray-700', className)}>
      {children}
    </Component>
  );
}

// Brand Components
export function BrandText({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn('font-bold text-primary-500', className)}>
      {children}
    </Component>
  );
}

export function LogoText({ children, className, as: Component = 'span' }: TypographyProps) {
  return (
    <Component className={cn('text-2xl font-bold text-primary-500', className)}>
      {children}
    </Component>
  );
}

// Layout Components
export function PageDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-2 text-gray-600', className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between pb-6 border-b border-gray-200', className)}>
      <div className="min-w-0 flex-1">
        <PageHeading className="mb-0">{title}</PageHeading>
        {description && <PageDescription>{description}</PageDescription>}
      </div>
      {action && (
        <div className="flex items-center space-x-3">
          {action}
        </div>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="min-w-0 flex-1">
        <SectionHeading className="mb-0">{title}</SectionHeading>
        {description && <CaptionText className="mt-1">{description}</CaptionText>}
      </div>
      {action && (
        <div className="flex items-center space-x-3">
          {action}
        </div>
      )}
    </div>
  );
}

// List Components
export function UnorderedList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={cn('list-disc list-inside space-y-1 text-gray-700', className)}>
      {children}
    </ul>
  );
}

export function OrderedList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ol className={cn('list-decimal list-inside space-y-1 text-gray-700', className)}>
      {children}
    </ol>
  );
}

// Code Components
export function InlineCode({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code className={cn('px-1.5 py-0.5 text-sm bg-gray-100 text-gray-800 rounded font-mono', className)}>
      {children}
    </code>
  );
}

export function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <pre className={cn('p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto font-mono text-sm', className)}>
      <code>{children}</code>
    </pre>
  );
}