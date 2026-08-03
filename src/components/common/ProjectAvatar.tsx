import React from 'react';
import { IconShield } from './Icons';

interface ProjectAvatarProps {
  avatar?: string;
  projectKey?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProjectAvatar: React.FC<ProjectAvatarProps> = ({
  avatar = '',
  projectKey = '',
  name = '',
  size = 'md',
  className = '',
}) => {
  const keyUpper = projectKey.toUpperCase();
  const avatarLower = (avatar || '').toLowerCase();

  const sizePx = size === 'sm' ? 16 : size === 'lg' ? 26 : 20;

  // Cloud AI Core Platform -> Clean Cloud SVG Icon with subtle brand color, no background box
  if (keyUpper === 'CLOUD' || avatarLower.includes('cloud')) {
    return (
      <span
        className={`project-avatar-icon cloud-icon ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-in-progress, #6366f1)',
          flexShrink: 0,
        }}
        title={name || 'Cloud Project'}
      >
        <svg width={sizePx} height={sizePx} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="currentColor" fillOpacity="0.15" />
        </svg>
      </span>
    );
  }

  // Mobile App -> Clean Mobile Device SVG Icon, no background box
  if (keyUpper === 'MOBILE' || avatarLower.includes('mobile')) {
    return (
      <span
        className={`project-avatar-icon mobile-icon ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10b981',
          flexShrink: 0,
        }}
        title={name || 'Mobile Project'}
      >
        <svg width={sizePx} height={sizePx} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="3" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 18h.01" strokeWidth="3" />
        </svg>
      </span>
    );
  }

  // Infrastructure Ops -> Clean Shield / Server SVG Icon, no background box
  if (keyUpper === 'OPS' || avatarLower.includes('ops') || avatarLower.includes('infra')) {
    return (
      <span
        className={`project-avatar-icon ops-icon ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f59e0b',
          flexShrink: 0,
        }}
        title={name || 'Ops Project'}
      >
        <IconShield size={sizePx} color="currentColor" />
      </span>
    );
  }

  // Custom project fallback initial
  const initial = (name || projectKey || 'P').charAt(0).toUpperCase();
  return (
    <span
      className={`project-avatar-icon default-icon ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-primary)',
        fontWeight: 700,
        fontSize: size === 'lg' ? '1rem' : size === 'sm' ? '0.78rem' : '0.88rem',
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
};
