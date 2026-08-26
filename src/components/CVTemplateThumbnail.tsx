import React, {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  CVData,
  TemplateId,
  ThemeColors,
} from '@/types/types';

import {
  themes,
  resolveFontStack,
} from '@/themes';

import ModernTemplate from '@/components/templates/ModernTemplate';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import MinimalTemplate from '@/components/templates/MinimalTemplate';
import CorporateTemplate from '@/components/templates/CorporateTemplate';
import EditorialTemplate from '@/components/templates/EditorialTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import SwissTemplate from '@/components/templates/SwissTemplate';
import TechTemplate from '@/components/templates/TechTemplate';

interface Props {
  data: CVData;
  template: TemplateId;
  className?: string;
}

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

function renderTemplate(
  data: CVData,
  template: TemplateId,
  colors: ThemeColors,
  fonts: {
    heading: string;
    body: string;
  },
  fontScale: number,
) {
  const commonProps = {
    data,
    colors,
    fonts,
    fontScale,
  };

  switch (template) {
    case 'modern':
      return <ModernTemplate {...commonProps} />;

    case 'classic':
      return <ClassicTemplate {...commonProps} />;

    case 'minimal':
      return <MinimalTemplate {...commonProps} />;

    case 'corporate':
      return <CorporateTemplate {...commonProps} />;

    case 'editorial':
      return <EditorialTemplate {...commonProps} />;

    case 'executive':
      return <ExecutiveTemplate {...commonProps} />;

    case 'swiss':
      return <SwissTemplate {...commonProps} />;

    case 'tech':
      return <TechTemplate {...commonProps} />;

    default:
      return null;
  }
}

export default function CVTemplateThumbnail({
  data,
  template,
  className = '',
}: Props) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const contentRef =
    useRef<HTMLDivElement>(null);

  const [scale, setScale] =
    useState(0.25);

  const [contentScale, setContentScale] =
    useState(1);

  const {
    colors,
    fonts,
    fontScale,
  } = useMemo(() => {
    const theme =
      themes[template];

    const fontStack =
      resolveFontStack(
        data.style.fontFamily,
        theme.fontBody,
      );

    const style =
      data.style;

    const colors: ThemeColors = {
      primary:
        style.primary ||
        theme.colors.primary,

      secondary:
        style.secondary ||
        theme.colors.secondary,

      accent:
        style.accent ||
        theme.colors.accent,

      text:
        style.text ||
        theme.colors.text,

      muted:
        style.muted ||
        theme.colors.muted,

      background:
        theme.colors.background,

      surface:
        style.surface ||
        theme.colors.surface,

      border:
        style.border ||
        theme.colors.border,
    };

    return {
      colors,

      fonts: {
        heading: fontStack,
        body: fontStack,
      },

      fontScale:
        style.fontScale,
    };
  }, [
    data.style,
    template,
  ]);

  /**
   * =========================================================
   * SCALE DE LA MINIATURE
   * =========================================================
   *
   * La page prend toujours exactement toute la largeur
   * disponible du thumbnail.
   */

  useLayoutEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const calculate =
      () => {
        const width =
          container.clientWidth;

        if (!width) {
          return;
        }

        const nextScale =
          width / A4_WIDTH;

        setScale(
          nextScale,
        );
      };

    calculate();

    const observer =
      new ResizeObserver(
        calculate,
      );

    observer.observe(
      container,
    );

    return () =>
      observer.disconnect();
  }, []);

  /**
   * =========================================================
   * AUTO-FIT DU CONTENU
   * =========================================================
   *
   * IMPORTANT :
   *
   * Pas de ResizeObserver ici.
   *
   * Le ResizeObserver provoquait une boucle :
   *
   * mesure → contentScale → transform → mesure...
   *
   * particulièrement visible avec Classic.
   *
   * On mesure uniquement après les changements de contenu.
   */

  useLayoutEffect(() => {
    const content =
      contentRef.current;

    if (!content) {
      return;
    }

    let cancelled = false;

    const calculate =
      () => {
        if (cancelled) {
          return;
        }

        /**
         * On mesure la hauteur naturelle
         * du contenu AVANT de lui appliquer
         * une nouvelle réduction.
         */
        const naturalHeight =
          content.scrollHeight;

        if (!naturalHeight) {
          return;
        }

        const fit =
          Math.min(
            1,
            A4_HEIGHT /
              naturalHeight,
          );

        setContentScale(
          current =>
            Math.abs(
              current - fit,
            ) < 0.001
              ? current
              : fit,
        );
      };

    /**
     * Premier calcul après le layout.
     */
    const frame1 =
      requestAnimationFrame(
        () => {
          calculate();

          /**
           * Deuxième mesure pour laisser
           * les polices et le layout finir.
           */
          const frame2 =
            requestAnimationFrame(
              () => {
                calculate();
              },
            );

          cleanupFrame2 =
            () =>
              cancelAnimationFrame(
                frame2,
              );
        },
      );

    let cleanupFrame2 =
      () => {};

    return () => {
      cancelled = true;

      cancelAnimationFrame(
        frame1,
      );

      cleanupFrame2();
    };
  }, [
    data,
    template,
    fontScale,
    fonts,
  ]);

  return (
    <div
      ref={containerRef}
      className={`
        relative
        w-full
        overflow-hidden
        bg-white
        ${className}
      `}
      style={{
        aspectRatio:
          `${A4_WIDTH} / ${A4_HEIGHT}`,
      }}
    >
      {/* =====================================================
          PAGE A4
      ====================================================== */}

      <div
        className="
          absolute
          left-0
          top-0
          origin-top-left
        "
        style={{
          width: A4_WIDTH,
          height: A4_HEIGHT,

          transform:
            `scale(${scale})`,
        }}
      >
        {/* ===================================================
            CONTENU
        ==================================================== */}

        <div
          ref={contentRef}
          className="
            relative
            bg-white
          "
          style={{
            width:
              `${100 / contentScale}%`,

            minHeight:
              A4_HEIGHT,

            transform:
              `scale(${contentScale})`,

            transformOrigin:
              'top left',
          }}
        >
          {renderTemplate(
            data,
            template,
            colors,
            fonts,
            fontScale,
          )}
        </div>
      </div>
    </div>
  );
}