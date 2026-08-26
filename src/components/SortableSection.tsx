import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  DragOverlay,
  useDndContext,
} from '@dnd-kit/core';

import {
  useSortable,
} from '@dnd-kit/sortable';

import type {
  CVSectionId,
} from '@/types/types';

interface Props {
  id: CVSectionId;
  children: ReactNode;
  enabled?: boolean;
}

interface DragPreviewContextValue {
  registerSection: (
    id: CVSectionId,
    getContent: () => ReactNode
  ) => void;

  unregisterSection: (
    id: CVSectionId
  ) => void;
}

const DragPreviewContext =
  createContext<
    DragPreviewContextValue | null
  >(null);

interface DragPreviewProviderProps {
  children: ReactNode;
  scale?: number;
}

export function SectionDragPreviewProvider({
  children,
  scale = 1,
}: DragPreviewProviderProps) {
  const registry =
    useRef(
      new Map<
        CVSectionId,
        () => ReactNode
      >()
    );

  const [
    registryVersion,
    setRegistryVersion,
  ] = useState(0);

  const registerSection =
    useCallback(
      (
        id: CVSectionId,
        getContent: () => ReactNode
      ) => {
        registry.current.set(
          id,
          getContent
        );

        setRegistryVersion(
          (value) =>
            value + 1
        );
      },
      []
    );

  const unregisterSection =
    useCallback(
      (id: CVSectionId) => {
        registry.current.delete(
          id
        );

        setRegistryVersion(
          (value) =>
            value + 1
        );
      },
      []
    );

  const {
    active,
  } = useDndContext();

  const activeId =
    active?.id as
      | CVSectionId
      | undefined;

  const getPreview =
    activeId
      ? registry.current.get(
          activeId
        )
      : undefined;

  const preview =
    getPreview
      ? getPreview()
      : null;

  const initialRect =
    active?.rect.current.initial;

  const overlayWidth =
    initialRect?.width
      ? initialRect.width /
        Math.max(
          scale,
          0.01
        )
      : undefined;

  void registryVersion;

  return (
    <DragPreviewContext.Provider
      value={{
        registerSection,
        unregisterSection,
      }}
    >
      {children}

      <DragOverlay
        dropAnimation={null}
        adjustScale={false}
      >
        {preview ? (
          <div
            style={{
              width: overlayWidth
                ? `${overlayWidth}px`
                : 'auto',

              transform:
                `scale(${scale})`,

              transformOrigin:
                'top left',

              pointerEvents:
                'none',
            }}
            className="
              relative
              rounded-sm
              bg-white
              shadow-2xl
            "
          >
            {preview}
          </div>
        ) : null}
      </DragOverlay>
    </DragPreviewContext.Provider>
  );
}

const SECTION_LABELS: Record<
  CVSectionId,
  string
> = {
  summary: 'Profil',
  technicalSkills: 'Compétences techniques',
  softSkills: 'Compétences générales',
  experiences: 'Expériences',
  education: 'Formation',
  projects: 'Projets',
  interests: "Centres d'intérêt",
  certifications: 'Certifications',
  languages: 'Langues',
};

export default function SortableSection({
  id,
  children,
  enabled = true,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
  } = useSortable({
    id,
    disabled: !enabled,
  });

  const dragPreviewContext =
    useContext(
      DragPreviewContext
    );

  const {
    active,
    over,
  } = useDndContext();

  const getContentRef =
    useRef(
      () => children
    );

  getContentRef.current =
    () => children;

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    if (!dragPreviewContext) {
      return;
    }

    dragPreviewContext.registerSection(
      id,
      () =>
        getContentRef.current()
    );

    return () => {
      dragPreviewContext.unregisterSection(
        id
      );
    };
  }, [
    dragPreviewContext,
    id,
    enabled,
  ]);

  if (!enabled) {
    return <>{children}</>;
  }

  const isDragging =
    active?.id === id;

  /*
   * Une seule cible :
   *
   * la section actuellement ciblée.
   *
   * La ligne est toujours placée
   * au-dessus de cette section.
   *
   * C'est le système de collision du
   * CVPreview qui décide quelle section
   * devient la cible selon la position
   * du curseur.
   */
  const isInsertionTarget =
    over?.id === id &&
    active?.id !== id;

  /**
   * =========================================================
   * ÉLÉMENTS INTERACTIFS
   * =========================================================
   *
   * Les liens / boutons / champs restent
   * cliquables et ne déclenchent pas le drag.
   */

  const isInteractiveTarget = (
    target: EventTarget | null
  ) => {
    if (
      !(target instanceof HTMLElement)
    ) {
      return false;
    }

    return Boolean(
      target.closest(
        [
          'a',
          'button',
          'input',
          'textarea',
          'select',
          '[contenteditable="true"]',
        ].join(',')
      )
    );
  };

  const handlePointerDownCapture = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (
      isInteractiveTarget(
        event.target
      )
    ) {
      event.stopPropagation();
    }
  };

  const handleTouchStartCapture = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (
      isInteractiveTarget(
        event.target
      )
    ) {
      event.stopPropagation();
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onPointerDownCapture={
        handlePointerDownCapture
      }
      onTouchStartCapture={
        handleTouchStartCapture
      }
      className="
        relative
        group
        w-full

        cursor-grab
        active:cursor-grabbing

        touch-none
        select-none
      "
      style={{
        position: 'relative',
        width: '100%',

        /*
         * Le bloc original reste dans sa position
         * pendant le drag.
         *
         * Le vrai visuel qui suit le curseur
         * est le DragOverlay.
         */
        opacity:
          isDragging
            ? 0.15
            : 1,
      }}
    >
      {/* =====================================================
          LIGNE D'INSERTION UNIQUE
      ====================================================== */}

      {isInsertionTarget && (
        <div
          className="
            pointer-events-none
            absolute

            left-0
            right-0

            -top-[5px]

            z-[100]

            h-[3px]

            rounded-full

            bg-slate-900

            shadow-sm
          "
        />
      )}

      {/* =====================================================
          SURBRILLANCE
      ====================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          inset-0
          rounded-sm

          border-2
          border-dashed

          transition

          ${
            isDragging
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }
        `}
      />

      {/* =====================================================
          LABEL
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute

          top-1
          left-1/2
          -translate-x-1/2

          z-50

          px-2.5
          py-1

          rounded-full

          bg-slate-900
          text-white

          text-[9px]
          font-semibold

          opacity-0
          group-hover:opacity-100

          transition
        "
      >
        {SECTION_LABELS[id]}
      </div>

      {children}
    </div>
  );
}