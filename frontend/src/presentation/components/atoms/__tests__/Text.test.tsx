import React from 'react';
import { render, screen } from '@testing-library/react';
import { Text } from '../Text';

describe('Text Component', () => {
  describe('Basic Rendering', () => {
    it('renders text content', () => {
      render(<Text>Hello World</Text>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders JSX children', () => {
      render(<Text><strong>Bold</strong> and <em>italic</em></Text>);
      expect(screen.getByRole('strong')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Text className="custom-class">Text</Text>);
      expect(screen.getByText('Text')).toHaveClass('custom-class');
    });
  });

  describe('HTML Elements', () => {
    const elements = ['p', 'span', 'div', 'small', 'strong', 'em'] as const;
    
    elements.forEach(element => {
      it(`renders as ${element} element`, () => {
        const { container } = render(<Text as={element}>Text</Text>);
        expect(container.querySelector(element)).toBeInTheDocument();
        expect(container.querySelector(element)).toHaveTextContent('Text');
      });
    });

    it('defaults to p element', () => {
      const { container } = render(<Text>Default</Text>);
      expect(container.querySelector('p')).toBeInTheDocument();
    });
  });

  describe('Text Sizes', () => {
    const sizes = [1, 2, 3, 4, 5, 6, 7] as const;
    
    sizes.forEach(size => {
      it(`renders size ${size}`, () => {
        render(<Text size={size}>Size {size}</Text>);
        expect(screen.getByText(`Size ${size}`)).toHaveClass(`is-size-${size}`);
      });
    });

    it('renders without size class when no size specified', () => {
      render(<Text>No size</Text>);
      const text = screen.getByText('No size');
      expect(text).not.toHaveClass('is-size-1', 'is-size-2', 'is-size-3');
    });
  });

  describe('Colors', () => {
    const colors = [
      'primary', 'info', 'success', 'warning', 'danger', 
      'dark', 'light', 'white', 'black', 'grey', 'grey-light', 'grey-dark'
    ] as const;
    
    colors.forEach(color => {
      it(`renders ${color} color`, () => {
        render(<Text color={color}>Colored text</Text>);
        expect(screen.getByText('Colored text')).toHaveClass(`has-text-${color}`);
      });
    });
  });

  describe('Font Weights', () => {
    const weights = ['light', 'normal', 'medium', 'semibold', 'bold'] as const;
    
    weights.forEach(weight => {
      it(`renders ${weight} weight`, () => {
        render(<Text weight={weight}>Weighted text</Text>);
        expect(screen.getByText('Weighted text')).toHaveClass(`has-text-weight-${weight}`);
      });
    });
  });

  describe('Text Alignment', () => {
    const alignments = ['left', 'centered', 'right', 'justified'] as const;
    
    alignments.forEach(alignment => {
      it(`renders ${alignment} alignment`, () => {
        render(<Text alignment={alignment}>Aligned text</Text>);
        expect(screen.getByText('Aligned text')).toHaveClass(`has-text-${alignment}`);
      });
    });
  });

  describe('Text Transform', () => {
    const transforms = ['capitalized', 'lowercase', 'uppercase'] as const;
    
    transforms.forEach(transform => {
      it(`renders ${transform} transform`, () => {
        render(<Text transform={transform}>Transformed</Text>);
        expect(screen.getByText('Transformed')).toHaveClass(`is-${transform}`);
      });
    });
  });

  describe('Font Families', () => {
    const families = ['sans-serif', 'monospace', 'primary', 'secondary', 'code'] as const;
    
    families.forEach(family => {
      it(`renders ${family} font family`, () => {
        render(<Text family={family}>Font family</Text>);
        expect(screen.getByText('Font family')).toHaveClass(`is-family-${family}`);
      });
    });
  });

  describe('Text Style', () => {
    it('renders italic style', () => {
      render(<Text style="italic">Italic text</Text>);
      expect(screen.getByText('Italic text')).toHaveClass('is-italic');
    });

    it('renders without style class when no style specified', () => {
      render(<Text>Normal text</Text>);
      expect(screen.getByText('Normal text')).not.toHaveClass('is-italic');
    });
  });

  describe('Element Styles', () => {
    it('applies element styles', () => {
      const styles = { fontSize: '18px', color: 'red', margin: '10px' };
      render(<Text elementStyle={styles}>Styled text</Text>);
      
      const element = screen.getByText('Styled text');
      expect(element).toHaveStyle('font-size: 18px');
      expect(element).toHaveStyle('color: red');
      expect(element).toHaveStyle('margin: 10px');
    });

    it('renders without style attribute when no elementStyle', () => {
      render(<Text>Unstyled</Text>);
      const element = screen.getByText('Unstyled');
      expect(element).not.toHaveAttribute('style');
    });
  });

  describe('Combined Properties', () => {
    it('combines multiple text utilities', () => {
      render(
        <Text 
          size={3}
          color="primary"
          weight="bold"
          alignment="centered"
          transform="uppercase"
          family="monospace"
          style="italic"
          className="custom-text"
        >
          Complex Text
        </Text>
      );
      
      const text = screen.getByText('Complex Text');
      expect(text).toHaveClass(
        'is-size-3',
        'has-text-primary',
        'has-text-weight-bold',
        'has-text-centered',
        'is-uppercase',
        'is-family-monospace',
        'is-italic',
        'custom-text'
      );
    });

    it('combines element type with styles', () => {
      render(
        <Text 
          as="span"
          size={5}
          color="success"
          elementStyle={{ padding: '5px' }}
        >
          Span Text
        </Text>
      );
      
      const { container } = render(
        <Text 
          as="span"
          size={5}
          color="success"
          elementStyle={{ padding: '5px' }}
        >
          Span Text
        </Text>
      );
      
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toHaveClass('is-size-5', 'has-text-success');
      expect(span).toHaveStyle('padding: 5px');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Text></Text>);
      const textElement = container.querySelector('p');
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveTextContent('');
    });

    it('handles null/undefined children gracefully', () => {
      const { container } = render(<Text>{null}</Text>);
      const textElement = container.querySelector('p');
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveTextContent('');
    });

    it('handles numeric children', () => {
      render(<Text>{42}</Text>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles boolean children', () => {
      const { container } = render(<Text>{true}</Text>);
      const textElement = container.querySelector('p');
      // React doesn't render boolean values, so this should be empty
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveTextContent('');
    });
  });

  describe('Class Generation', () => {
    it('generates correct class string with no props', () => {
      render(<Text>Basic</Text>);
      const text = screen.getByText('Basic');
      
      // Should only have classes that are applied, not all possible classes
      expect(text.className).not.toContain('is-size');
      expect(text.className).not.toContain('has-text');
      expect(text.className).not.toContain('is-family');
    });

    it('does not add undefined classes', () => {
      render(<Text className="test">Test</Text>);
      const text = screen.getByText('Test');
      expect(text).toHaveClass('test');
      expect(text.className.split(' ')).not.toContain('undefined');
    });
  });
});