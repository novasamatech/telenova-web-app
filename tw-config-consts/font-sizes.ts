import type { Config } from 'tailwindcss';

const fontSizes: Required<Config>['theme']['fontSize'] = {
  // EXTRA BOLD
  'large-title': ['2.5rem', { lineHeight: '2.5rem', letterSpacing: '-0.5px', fontWeight: 700 }],
  title: ['1.25rem', { lineHeight: '1.375rem', letterSpacing: '-0.013em', fontWeight: 700 }],
  'medium-title': ['1.0625rem', { lineHeight: '1.5rem', letterSpacing: '-0.016em', fontWeight: 700 }],
  // SEMI BOLD
  caption: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.02px', fontWeight: 600 }],
  footnote: ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '-0.01em', fontWeight: 600 }],
  'button-large': ['0.875rem', { lineHeight: '1.125rem', letterSpacing: '-0.01em', fontWeight: 600 }],
  'button-small': ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '-0.01em', fontWeight: 600 }],

  // MEDIUM
  headline: ['0.9375rem', { lineHeight: '1.375rem', letterSpacing: '-0.01em', fontWeight: 500 }],
  body: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.154px', fontWeight: 500 }],
  'help-text': ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '-0.01em', fontWeight: 500 }],
};

export default fontSizes;
