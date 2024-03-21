import type { Config } from 'tailwindcss';

const fontSizes: Required<Config>['theme']['fontSize'] = {
  // EXTRA BOLD
  'large-title': ['2.5rem', { lineHeight: 'normal', letterSpacing: '-0.5px', fontWeight: 700 }],
  title: ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.013em', fontWeight: 700 }],
  'big-title': ['1.375rem', { lineHeight: 'normal', letterSpacing: '-0.013em', fontWeight: 700 }],
  'body-bold': ['1rem', { lineHeight: '1.25rem', letterSpacing: '-0.013em', fontWeight: 800 }],

  // SEMI BOLD
  'medium-title': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.2px', fontWeight: 600 }],
  label: ['1rem', { lineHeight: 'normal', letterSpacing: '0.37px', fontWeight: 600 }],
  banner: ['13px', { lineHeight: 'normal', letterSpacing: '0.37px', fontWeight: 600 }],

  // MEDIUM
  headline: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.027em', fontWeight: 500 }],
  body: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.154px', fontWeight: 500 }],
  'help-text': ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '-0.01em', fontWeight: 500 }],
};

export default fontSizes;
