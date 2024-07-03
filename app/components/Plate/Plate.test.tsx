import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import Plate from './Plate';

describe('ui/Plate', () => {
  test('should render component', () => {
    const content = 'This is simple content';
    render(<Plate>{content}</Plate>);

    const children = screen.getByText(content);
    expect(children).toBeInTheDocument();
  });

  test('should render as custom tag', () => {
    const content = 'Custom tag';
    render(<Plate as="section">{content}</Plate>);

    const children = screen.getByText(content);
    expect(children).toBeInTheDocument();
    expect(children.nodeName.toLowerCase()).toEqual('section');
  });
});
