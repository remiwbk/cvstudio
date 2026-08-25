import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  DndContext,
  closestCenter,
  pointerWithin,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  arrayMove,
} from '@dnd-kit/sortable';

import {
  GripVertical,
} from 'lucide-react';

import type {
  CVData,
  TemplateId,
  ThemeColors,
  CVSectionId,
  CVSectionColumn,
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

export interface CVPreviewHandle {
  getPageEl: () => HTMLElement | null;
}

interface Props {
  data: CVData;
  template: TemplateId;
  captureMode?: boolean;

  onChange?: (
    data: CVData
  ) => void;

  onSectionOrderChange?: (
    order: CVSectionId[]
  ) => void;
}

const PAGE_PX_WIDTH =
  210 * (96 / 25.4);

const PAGE_PX_HEIGHT =
  297 * (96 / 25.4);

const MIN_SCALE = 0.4;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_STEP = 0.1;

const DEFAULT_SECTION_ORDER: CVSectionId[] = [
  'summary',
  'experiences',
  'education',
  'skills',
  'projects',
  'interests',
  'certifications',
];

const SECTION_COLUMN_IDS = {
  left: 'section-column-left',
  right: 'section-column-right',
} as const;

const SECTION_COLUMN_BOTTOM_IDS = {
  left: 'section-column-bottom-left',
  right: 'section-column-bottom-right',
} as const;

const TWO_COLUMN_TEMPLATES: TemplateId[] = [
  'corporate',
  'editorial',
  'executive',
  'modern',
  'swiss',
  'tech',
];

const DEFAULT_SECTION_COLUMNS: Record<
  CVSectionId,
  CVSectionColumn
> = {
  summary: 'left',
  skills: 'left',
  interests: 'left',
  certifications: 'right',

  experiences: 'right',
  education: 'right',
  projects: 'right',
};

/**
 * =========================================================
 * RENDER TEMPLATE
 * =========================================================
 */

function renderTemplate(
  data: CVData,
  template: TemplateId,
  colors: ThemeColors,
  fonts: {
    heading: string;
    body: string;
  },
  fontScale: number,
  captureMode = false
) {
  const commonProps = {
    data,
    colors,
    fonts,
    fontScale,
    captureMode,
  };

  switch (template) {
    case 'modern':
      return (
        <ModernTemplate
          {...commonProps}
        />
      );

    case 'classic':
      return (
        <ClassicTemplate
          {...commonProps}
        />
      );

    case 'minimal':
      return (
        <MinimalTemplate
          {...commonProps}
        />
      );

    case 'corporate':
      return (
        <CorporateTemplate
          {...commonProps}
        />
      );

    case 'editorial':
      return (
        <EditorialTemplate
          {...commonProps}
        />
      );

    case 'executive':
      return (
        <ExecutiveTemplate
          {...commonProps}
        />
      );

    case 'swiss':
      return (
        <SwissTemplate
          {...commonProps}
        />
      );

    case 'tech':
      return (
        <TechTemplate
          {...commonProps}
        />
      );

    default:
      return null;
  }
}

/**
 * =========================================================
 * CV PREVIEW
 * =========================================================
 */

const CVPreview = forwardRef<
  CVPreviewHandle,
  Props
>(
  (
    {
      data,
      template,
      captureMode = false,
      onChange,
      onSectionOrderChange,
    },
    ref
  ) => {
    const paneRef =
      useRef<HTMLDivElement>(null);

    const pageRef =
      useRef<HTMLDivElement>(null);

    const contentRef =
      useRef<HTMLDivElement>(null);

    const [fitScale, setFitScale] =
      useState(1);

    const [contentScale, setContentScale] =
      useState(1);

    const [zoomScale, setZoomScale] =
      useState(1);

    const [editMode, setEditMode] =
      useState(false);

    const [isPrinting, setIsPrinting] =
      useState(false);

    /**
     * =========================================================
     * DND-KIT
     * =========================================================
     */

    const sensors =
      useSensors(
        useSensor(
          PointerSensor,
          {
            activationConstraint: {
              distance: 8,
            },
          }
        ),

        useSensor(
          TouchSensor,
          {
            activationConstraint: {
              delay: 180,
              tolerance: 8,
            },
          }
        )
      );

    /**
     * =========================================================
     * REF EXPORT
     * =========================================================
     */

    useImperativeHandle(
      ref,
      () => ({
        getPageEl: () =>
          pageRef.current,
      }),
      []
    );

    /**
     * =========================================================
     * THEME
     * =========================================================
     */

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
          theme.fontBody
        );

      const s =
        data.style;

      const colors: ThemeColors =
        {
          primary:
            s.primary ||
            theme.colors.primary,

          secondary:
            s.secondary ||
            theme.colors.secondary,

          accent:
            s.accent ||
            theme.colors.accent,

          text:
            s.text ||
            theme.colors.text,

          muted:
            s.muted ||
            theme.colors.muted,

          background:
            theme.colors.background,

          surface:
            s.surface ||
            theme.colors.surface,

          border:
            s.border ||
            theme.colors.border,
        };

      return {
        colors,

        fonts: {
          heading:
            fontStack,
          body:
            fontStack,
        },

        fontScale:
          data.style.fontScale,
      };
    }, [
      template,
      data.style,
    ]);

    /**
     * =========================================================
     * SECTION ORDER
     * =========================================================
     */

    const sectionOrder =
      data.sectionOrder?.length
        ? data.sectionOrder
        : DEFAULT_SECTION_ORDER;

    /**
     * =========================================================
     * TEMPLATES À DEUX COLONNES
     * =========================================================
     */

    const isTwoColumnTemplate =
      TWO_COLUMN_TEMPLATES.includes(
        template
      );

    /**
     * =========================================================
     * SECTION COLUMN
     * =========================================================
     */

    const getSectionColumn = (
      sectionId: CVSectionId
    ): CVSectionColumn => {
      return (
        data.sectionColumns?.[
          sectionId
        ] ??
        DEFAULT_SECTION_COLUMNS[
          sectionId
        ]
      );
    };

    /**
     * =========================================================
     * COLLISION DETECTION
     * =========================================================
     */

    const collisionDetectionStrategy: CollisionDetection =
      (args) => {
        if (
          !isTwoColumnTemplate
        ) {
          const pointerCollisions =
            pointerWithin(args);

          if (
            pointerCollisions.length >
            0
          ) {
            return pointerCollisions;
          }

          return closestCenter(
            args
          );
        }

        const pointer =
          args.pointerCoordinates;

        if (!pointer) {
          return [];
        }

        const columnContainers =
          args.droppableContainers.filter(
            (container) => {
              const id =
                String(
                  container.id
                );

              return (
                id ===
                  SECTION_COLUMN_IDS.left ||
                id ===
                  SECTION_COLUMN_IDS.right
              );
            }
          );

        let targetColumn:
          | 'left'
          | 'right'
          | null = null;

        let targetColumnId:
          | string
          | null = null;

        let targetColumnRect:
          | NonNullable<
              ReturnType<
                typeof args.droppableRects.get
              >
            >
          | null = null;

        for (
          const container of
            columnContainers
        ) {
          const rect =
            args.droppableRects.get(
              container.id
            );

          if (!rect) {
            continue;
          }

          if (
            pointer.x >=
              rect.left &&
            pointer.x <=
              rect.right &&
            pointer.y >=
              rect.top &&
            pointer.y <=
              rect.bottom
          ) {
            targetColumn =
              String(
                container.id
              ) ===
              SECTION_COLUMN_IDS.left
                ? 'left'
                : 'right';

            targetColumnId =
              String(
                container.id
              );

            targetColumnRect =
              rect;

            break;
          }
        }

        if (
          !targetColumn ||
          !targetColumnId ||
          !targetColumnRect
        ) {
          return [];
        }

        const sectionCandidates:
          Array<{
            id: CVSectionId;
            rect: NonNullable<
              ReturnType<
                typeof args.droppableRects.get
              >
            >;
          }> = [];

        for (
          const container of
            args.droppableContainers
        ) {
          const id =
            String(
              container.id
            );

          if (
            id ===
              SECTION_COLUMN_IDS.left ||
            id ===
              SECTION_COLUMN_IDS.right
          ) {
            continue;
          }

          if (
            id ===
              SECTION_COLUMN_BOTTOM_IDS.left ||
            id ===
              SECTION_COLUMN_BOTTOM_IDS.right
          ) {
            continue;
          }

          if (
            !sectionOrder.includes(
              id as CVSectionId
            )
          ) {
            continue;
          }

          const sectionId =
            id as CVSectionId;

          if (
            getSectionColumn(
              sectionId
            ) !==
            targetColumn
          ) {
            continue;
          }

          const rect =
            args.droppableRects.get(
              container.id
            );

          if (!rect) {
            continue;
          }

          sectionCandidates.push({
            id: sectionId,
            rect,
          });
        }

        sectionCandidates.sort(
          (a, b) =>
            a.rect.top -
            b.rect.top
        );

        for (
          const candidate of
            sectionCandidates
        ) {
          const rect =
            candidate.rect;

          if (
            pointer.x >=
              rect.left &&
            pointer.x <=
              rect.right &&
            pointer.y >=
              rect.top &&
            pointer.y <=
              rect.bottom
          ) {
            return [
              {
                id:
                  candidate.id,
                rect:
                  candidate.rect,
              },
            ];
          }
        }

        for (
          const candidate of
            sectionCandidates
        ) {
          if (
            pointer.y <
            candidate.rect.top
          ) {
            return [
              {
                id:
                  candidate.id,
                rect:
                  candidate.rect,
              },
            ];
          }
        }

        if (
          sectionCandidates.length >
          0
        ) {
          const last =
            sectionCandidates[
              sectionCandidates.length -
                1
            ];

          if (
            pointer.y >=
            last.rect.bottom
          ) {
            const bottomId =
              targetColumn ===
              'left'
                ? SECTION_COLUMN_BOTTOM_IDS.left
                : SECTION_COLUMN_BOTTOM_IDS.right;

            const bottomContainer =
              args.droppableContainers.find(
                (container) =>
                  String(
                    container.id
                  ) === bottomId
              );

            if (
              bottomContainer
            ) {
              const bottomRect =
                args.droppableRects.get(
                  bottomContainer.id
                );

              if (bottomRect) {
                return [
                  {
                    id:
                      bottomContainer.id,
                    rect:
                      bottomRect,
                  },
                ];
              }
            }

            return [
              {
                id:
                  targetColumnId,
                rect:
                  targetColumnRect,
              },
            ];
          }
        }

        const emptyBottomId =
          targetColumn ===
          'left'
            ? SECTION_COLUMN_BOTTOM_IDS.left
            : SECTION_COLUMN_BOTTOM_IDS.right;

        const emptyBottomContainer =
          args.droppableContainers.find(
            (container) =>
              String(
                container.id
              ) ===
              emptyBottomId
          );

        if (
          emptyBottomContainer
        ) {
          const emptyBottomRect =
            args.droppableRects.get(
              emptyBottomContainer.id
            );

          if (
            emptyBottomRect
          ) {
            return [
              {
                id:
                  emptyBottomContainer.id,
                rect:
                  emptyBottomRect,
              },
            ];
          }
        }

        return [
          {
            id:
              targetColumnId,
            rect:
              targetColumnRect,
          },
        ];
      };

    /**
     * =========================================================
     * DND END
     * =========================================================
     */

    const handleDragEnd = (
      event: DragEndEvent
    ) => {
      if (
        captureMode ||
        !editMode
      ) {
        return;
      }

      const {
        active,
        over,
      } = event;

      if (!over) {
        return;
      }

      const activeId =
        active.id as CVSectionId;

      const overId =
        String(over.id);

      if (
        isTwoColumnTemplate
      ) {
        const activeColumn =
          getSectionColumn(
            activeId
          );

        if (
          overId ===
            SECTION_COLUMN_BOTTOM_IDS.left ||
          overId ===
            SECTION_COLUMN_BOTTOM_IDS.right
        ) {
          const targetColumn =
            overId ===
            SECTION_COLUMN_BOTTOM_IDS.left
              ? 'left'
              : 'right';

          const nextOrder =
            sectionOrder.filter(
              (id) =>
                id !== activeId
            );

          let insertionIndex =
            nextOrder.length;

          for (
            let index =
              nextOrder.length - 1;
            index >= 0;
            index--
          ) {
            if (
              getSectionColumn(
                nextOrder[index]
              ) ===
              targetColumn
            ) {
              insertionIndex =
                index + 1;

              break;
            }
          }

          nextOrder.splice(
            insertionIndex,
            0,
            activeId
          );

          onChange?.({
            ...data,
            sectionOrder:
              nextOrder,
            sectionColumns: {
              ...(data.sectionColumns ??
                {}),
              [activeId]:
                targetColumn,
            },
          });

          return;
        }

        if (
          overId ===
            SECTION_COLUMN_IDS.left ||
          overId ===
            SECTION_COLUMN_IDS.right
        ) {
          const targetColumn =
            overId ===
            SECTION_COLUMN_IDS.left
              ? 'left'
              : 'right';

          const nextOrder =
            sectionOrder.filter(
              (id) =>
                id !== activeId
            );

          let insertionIndex =
            nextOrder.length;

          for (
            let index =
              nextOrder.length - 1;
            index >= 0;
            index--
          ) {
            if (
              getSectionColumn(
                nextOrder[index]
              ) ===
              targetColumn
            ) {
              insertionIndex =
                index + 1;

              break;
            }
          }

          nextOrder.splice(
            insertionIndex,
            0,
            activeId
          );

          onChange?.({
            ...data,
            sectionOrder:
              nextOrder,
            sectionColumns: {
              ...(data.sectionColumns ??
                {}),
              [activeId]:
                targetColumn,
            },
          });

          return;
        }

        const overSectionId =
          over.id as CVSectionId;

        if (
          activeId ===
          overSectionId
        ) {
          return;
        }

        const targetColumn =
          getSectionColumn(
            overSectionId
          );

        if (
          activeColumn !==
          targetColumn
        ) {
          const nextOrder =
            sectionOrder.filter(
              (id) =>
                id !== activeId
            );

          const targetIndex =
            nextOrder.indexOf(
              overSectionId
            );

          const insertionIndex =
            targetIndex === -1
              ? nextOrder.length
              : targetIndex;

          nextOrder.splice(
            insertionIndex,
            0,
            activeId
          );

          onChange?.({
            ...data,
            sectionOrder:
              nextOrder,
            sectionColumns: {
              ...(data.sectionColumns ??
                {}),
              [activeId]:
                targetColumn,
            },
          });

          return;
        }

        const columnItems =
          sectionOrder.filter(
            (sectionId) =>
              getSectionColumn(
                sectionId
              ) ===
              activeColumn
          );

        const oldIndex =
          columnItems.indexOf(
            activeId
          );

        const newIndex =
          columnItems.indexOf(
            overSectionId
          );

        if (
          oldIndex === -1 ||
          newIndex === -1 ||
          oldIndex === newIndex
        ) {
          return;
        }

        const newColumnItems =
          arrayMove(
            columnItems,
            oldIndex,
            newIndex
          );

        const newOrder:
          CVSectionId[] = [];

        let columnIndex = 0;

        for (
          const sectionId of
            sectionOrder
        ) {
          if (
            getSectionColumn(
              sectionId
            ) ===
            activeColumn
          ) {
            newOrder.push(
              newColumnItems[
                columnIndex
              ]
            );

            columnIndex++;
          } else {
            newOrder.push(
              sectionId
            );
          }
        }

        if (
          onSectionOrderChange
        ) {
          onSectionOrderChange(
            newOrder
          );

          return;
        }

        onChange?.({
          ...data,
          sectionOrder:
            newOrder,
        });

        return;
      }

      if (
        String(over.id) ===
        'section-column-bottom'
      ) {
        const nextOrder =
          sectionOrder.filter(
            (id) =>
              id !== activeId
          );

        nextOrder.push(
          activeId
        );

        if (
          onSectionOrderChange
        ) {
          onSectionOrderChange(
            nextOrder
          );

          return;
        }

        onChange?.({
          ...data,
          sectionOrder:
            nextOrder,
        });

        return;
      }

      const overSectionId =
        over.id as CVSectionId;

      if (
        activeId ===
        overSectionId
      ) {
        return;
      }

      const oldIndex =
        sectionOrder.indexOf(
          activeId
        );

      const newIndex =
        sectionOrder.indexOf(
          overSectionId
        );

      if (
        oldIndex === -1 ||
        newIndex === -1
      ) {
        return;
      }

      const newOrder =
        arrayMove(
          sectionOrder,
          oldIndex,
          newIndex
        );

      if (
        onSectionOrderChange
      ) {
        onSectionOrderChange(
          newOrder
        );

        return;
      }

      onChange?.({
        ...data,
        sectionOrder:
          newOrder,
      });
    };

    /**
     * =========================================================
     * RECALCUL DU FIT PREVIEW
     * =========================================================
     */

    useLayoutEffect(() => {
      if (
        captureMode ||
        isPrinting
      ) {
        setFitScale(1);
        return;
      }

      const pane =
        paneRef.current;

      if (!pane) {
        return;
      }

      const compute = () => {
        const available =
          pane.clientWidth -
          48;

        const scale =
          Math.min(
            1,
            available /
              PAGE_PX_WIDTH
          );

        setFitScale(
          scale
        );
      };

      compute();

      const ro =
        new ResizeObserver(
          compute
        );

      ro.observe(pane);

      return () => {
        ro.disconnect();
      };
    }, [
      captureMode,
      isPrinting,
    ]);

    /**
     * =========================================================
     * RECALCUL DU SCALE DU CONTENU
     * =========================================================
     */

    const recomputeContentScale =
      () => {
        const content =
          contentRef.current;

        if (!content) {
          return;
        }

        const natural =
          content.scrollHeight;

        if (
          natural <= 0
        ) {
          return;
        }

        const scale =
          Math.max(
            MIN_SCALE,
            Math.min(
              1,
              PAGE_PX_HEIGHT /
                natural
            )
          );

        setContentScale(
          scale
        );
      };

    useLayoutEffect(() => {
      recomputeContentScale();

      const ro =
        new ResizeObserver(
          () => {
            recomputeContentScale();
          }
        );

      const content =
        contentRef.current;

      if (content) {
        ro.observe(
          content
        );
      }

      return () =>
        ro.disconnect();
    }, [
      data,
      template,
      colors,
      fonts,
      fontScale,
      sectionOrder,
    ]);

    /**
     * =========================================================
     * PRINT
     * =========================================================
     */

    useLayoutEffect(() => {
      const handleBeforePrint =
        async () => {
          setIsPrinting(true);
          setFitScale(1);
          setZoomScale(1);

          /*
           * Laisse React terminer son rendu avant
           * de recalculer la hauteur naturelle.
           */
          await new Promise<void>(
            (resolve) =>
              requestAnimationFrame(
                () => resolve()
              )
          );

          if (
            document.fonts &&
            document.fonts.ready
          ) {
            try {
              await document.fonts.ready;
            } catch {
              // Rien à faire si le navigateur
              // ne permet pas d'attendre les polices.
            }
          }

          recomputeContentScale();
        };

      const handleAfterPrint =
        () => {
          setIsPrinting(false);
        };

      window.addEventListener(
        'beforeprint',
        () => {
          void handleBeforePrint();
        }
      );

      window.addEventListener(
        'afterprint',
        handleAfterPrint
      );

      return () => {
        window.removeEventListener(
          'afterprint',
          handleAfterPrint
        );
      };
    }, []);

    /**
     * =========================================================
     * ZOOM
     * =========================================================
     */

    const decreaseZoom =
      () => {
        setZoomScale(
          (current) =>
            Math.max(
              MIN_ZOOM,
              Number(
                (
                  current -
                  ZOOM_STEP
                ).toFixed(2)
              )
            )
        );
      };

    const increaseZoom =
      () => {
        setZoomScale(
          (current) =>
            Math.min(
              MAX_ZOOM,
              Number(
                (
                  current +
                  ZOOM_STEP
                ).toFixed(2)
              )
            )
        );
      };

    const resetZoom =
      () => {
        setZoomScale(1);
      };

    const previewScale =
      fitScale *
      zoomScale;

    /**
     * =========================================================
     * TEMPLATE
     * =========================================================
     */

    const templateElement =
      renderTemplate(
        data,
        template,
        colors,
        fonts,
        fontScale,
        captureMode ||
          !editMode
      );

    /**
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={
          collisionDetectionStrategy
        }
        onDragEnd={
          handleDragEnd
        }
      >
        <div
          ref={paneRef}
          className="
            preview-scroll
            relative
            w-full
            h-full
            overflow-auto
            flex
            items-start
            justify-center
            p-3
            sm:p-6
            pt-20
            sm:pt-20
            bg-slate-200
          "
        >
          {/* =====================================================
              BARRE DE CONTRÔLES
          ====================================================== */}

          {!captureMode && (
            <div
              className="
                absolute
                z-[100]
                top-3
                right-3
                sm:top-4
                sm:right-4

                flex
                items-center
                gap-1

                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-lg
                p-1
              "
            >
              <button
                type="button"
                onClick={() =>
                  setEditMode(
                    (current) =>
                      !current
                  )
                }
                className={`
                  h-8
                  sm:h-9
                  px-2.5
                  sm:px-3
                  rounded-lg
                  text-[11px]
                  sm:text-xs
                  font-semibold
                  transition
                  flex
                  items-center
                  gap-1.5

                  ${
                    editMode
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }
                `}
                title={
                  editMode
                    ? 'Quitter le mode réorganisation'
                    : 'Activer le mode réorganisation'
                }
              >
                <GripVertical
                  className="
                    w-3.5
                    h-3.5
                    shrink-0
                  "
                />

                <span>
                  {editMode
                    ? 'Terminer'
                    : 'Réorganiser'}
                </span>
              </button>

              <div className="w-px h-6 bg-slate-200" />

              <button
                type="button"
                onClick={
                  decreaseZoom
                }
                disabled={
                  zoomScale <=
                  MIN_ZOOM
                }
                className="
                  w-8
                  h-8
                  sm:w-9
                  sm:h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-slate-700
                  text-lg
                  font-medium
                  hover:bg-slate-100
                  active:bg-slate-200
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                  transition
                "
                title="Dézoomer"
              >
                −
              </button>

              <button
                type="button"
                onClick={
                  resetZoom
                }
                className="
                  min-w-[48px]
                  sm:min-w-[62px]
                  h-8
                  sm:h-9
                  px-2
                  rounded-lg
                  text-[11px]
                  sm:text-xs
                  font-semibold
                  text-slate-600
                  hover:bg-slate-100
                  transition
                "
                title="Réinitialiser le zoom"
              >
                {Math.round(
                  zoomScale *
                    100
                )}
                %
              </button>

              <button
                type="button"
                onClick={
                  increaseZoom
                }
                disabled={
                  zoomScale >=
                  MAX_ZOOM
                }
                className="
                  w-8
                  h-8
                  sm:w-9
                  sm:h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-slate-700
                  text-lg
                  font-medium
                  hover:bg-slate-100
                  active:bg-slate-200
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                  transition
                "
                title="Zoomer"
              >
                +
              </button>
            </div>
          )}

          {/* =====================================================
              INDICATEUR MODE RÉORGANISATION
          ====================================================== */}

          {!captureMode &&
            editMode && (
              <div
                className="
                  fixed
                  bottom-4
                  left-1/2
                  -translate-x-1/2
                  z-[100]

                  flex
                  items-center
                  gap-2

                  max-w-[calc(100vw-24px)]

                  rounded-xl
                  bg-slate-900
                  text-white

                  px-3
                  sm:px-4
                  py-2.5

                  text-[11px]
                  sm:text-xs
                  font-medium

                  shadow-xl

                  pointer-events-none
                "
              >
                <GripVertical
                  className="
                    w-4
                    h-4
                    shrink-0
                  "
                />

                <span className="text-center">
                  <span className="hidden sm:inline">
                    Mode réorganisation activé —
                    glissez les sections
                  </span>

                  <span className="sm:hidden">
                    Glissez les sections pour
                    les réorganiser
                  </span>
                </span>
              </div>
            )}

          {/* =====================================================
              PAGE
          ====================================================== */}

          <div
            className="
              cv-preview-scale-wrapper
              relative
              shrink-0
            "
            style={{
              width:
                PAGE_PX_WIDTH *
                previewScale,

              height:
                PAGE_PX_HEIGHT *
                previewScale,
            }}
          >
            <div
              className="
                cv-preview-transform-wrapper
              "
              style={{
                transform:
                  `scale(${previewScale})`,

                transformOrigin:
                  'top left',

                width:
                  PAGE_PX_WIDTH,
              }}
            >
              <div
                ref={pageRef}
                className="
                  a4-page
                  cv-export-page
                  bg-white
                "
                style={{
                  width:
                    '210mm',

                  minWidth:
                    '210mm',

                  height:
                    '297mm',

                  minHeight:
                    '297mm',

                  position:
                    'relative',

                  overflow:
                    'hidden',

                  boxSizing:
                    'border-box',
                }}
              >
                <div
                  className="
                    cv-content-scale-wrapper
                  "
                  style={{
                    transform:
                      `scale(${contentScale})`,

                    transformOrigin:
                      'top left',

                    width:
                      `${100 / contentScale}%`,
                  }}
                >
                  <div
                    ref={contentRef}
                    className="
                      relative
                    "
                  >
                    {templateElement}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    );
  }
);

CVPreview.displayName =
  'CVPreview';

export default CVPreview;