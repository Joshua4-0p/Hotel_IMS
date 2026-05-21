import { RevealOnScroll } from './RevealOnScroll';
import { Btn } from './Btn';

interface SectionHeaderProps {
  overline?: string;
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  align?: 'left' | 'center';
  titleSize?: 'display-lg' | 'heading-xl';
  inverted?: boolean;
}

export function SectionHeader({
  overline,
  title,
  description,
  ctaText,
  ctaLink,
  align = 'center',
  titleSize = 'display-lg',
  inverted = false,
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <RevealOnScroll className={`flex flex-col gap-4 ${alignClass} max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
      {overline && (
        <span
          className="label"
          style={{ color: inverted ? 'rgba(255,255,255,0.7)' : '#585858' }}
        >
          {overline}
        </span>
      )}
      <h2
        className={titleSize}
        style={{
          color: inverted ? '#ffffff' : '#000000',
          textWrap: 'balance',
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          className="body-lg"
          style={{ color: inverted ? 'rgba(255,255,255,0.7)' : '#585858', maxWidth: '600px' }}
        >
          {description}
        </p>
      )}
      {ctaText && ctaLink && (
        <Btn to={ctaLink} variant="primary" inverted={inverted}>
          {ctaText}
        </Btn>
      )}
    </RevealOnScroll>
  );
}
