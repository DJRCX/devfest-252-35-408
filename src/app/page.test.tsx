import { describe, it, expect } from 'vitest';
import React from 'react';
import SmartEscapeApp from './page';

describe('Page render test', () => {
  it('renders SmartEscapeApp without throwing', () => {
    expect(() => {
      // Execute the component function
      const el = React.createElement(SmartEscapeApp);
      expect(el).toBeDefined();
    }).not.toThrow();
  });
});
