import React, { useState } from 'react';

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import {
  Plus,
  Trash2,
  GripVertical,
  ImagePlus,
  X,
  Type,
  Palette,
  ChevronDown,
  Linkedin,
  Github,
  Pencil,
} from 'lucide-react';

import {
  DEFAULT_SECTION_TITLES,
  type CVData,
  type CVSectionId,
  type Experience,
  type Education,
  type Project,
  type Certification,
  type SkillCategory,
  type CVStyle,
} from '@/types/types';

import {
  fontFamilies,
  colorPresets,
} from '@/themes';

interface Props {
  data: CVData;
  onChange: (data: CVData) => void;
}

type SortableRenderProps = {
  setNodeRef: (
    node: HTMLElement | null
  ) => void;

  style: React.CSSProperties;

  attributes: Record<string, any>;

  listeners:
    | Record<string, any>
    | undefined;

  isDragging: boolean;
};

interface SortableItemProps {
  id: string;

  children: (
    props: SortableRenderProps
  ) => React.ReactNode;
}

function SortableItem({
  id,
  children,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform:
      CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging
      ? 50
      : undefined,
    position: 'relative',
  };

  return (
    <>
      {children({
        setNodeRef,
        style,
        attributes,
        listeners,
        isDragging,
      })}
    </>
  );
}

function uid() {
  return Math.random()
    .toString(36)
    .slice(2, 9);
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-400';

const labelCls =
  'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

/*
 * =========================================================
 * TEXTAREA REDIMENSIONNABLE
 * =========================================================
 */

function ResizableTextarea({
  value,
  onChange,
  placeholder,
  minHeight = 60,
}: {
  value: string;

  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;

  placeholder?: string;

  minHeight?: number;
}) {
  const [height, setHeight] =
    useState(minHeight);

  const startY =
    React.useRef(0);

  const startHeight =
    React.useRef(minHeight);

  const resizing =
    React.useRef(false);

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    resizing.current = true;

    startY.current =
      e.clientY;

    startHeight.current =
      height;

    e.currentTarget.setPointerCapture(
      e.pointerId
    );
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!resizing.current) {
      return;
    }

    const delta =
      e.clientY -
      startY.current;

    setHeight(
      Math.max(
        minHeight,
        startHeight.current +
          delta
      )
    );
  };

  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    resizing.current =
      false;

    if (
      e.currentTarget.hasPointerCapture(
        e.pointerId
      )
    ) {
      e.currentTarget.releasePointerCapture(
        e.pointerId
      );
    }
  };

  return (
    <div
      className="relative"
      style={{ height }}
    >
      <textarea
        className={`${inputCls} resize-none h-full`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

      <div
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          handlePointerUp
        }
        onPointerCancel={
          handlePointerUp
        }
        className="
          absolute
          bottom-1
          right-1
          w-5
          h-5
          cursor-ns-resize
          touch-none
          flex
          items-end
          justify-end
          p-0.5
        "
        aria-label="Redimensionner"
      >
        <div className="w-3 h-3 border-r-2 border-b-2 border-slate-300" />
      </div>
    </div>
  );
}

/*
 * =========================================================
 * TITRE DE SECTION ÉDITABLE
 * =========================================================
 *
 * Le titre est directement modifiable dans le CVForm.
 *
 * Il reste clairement visible sur desktop ET mobile.
 * =========================================================
 */

function SectionEditorTitle({
  sectionId,
  action,
  data,
  updateSectionTitle,
}: {
  sectionId: CVSectionId;

  action?: React.ReactNode;

  data: CVData;

  updateSectionTitle: (
    sectionId: CVSectionId,
    title: string
  ) => void;
}) {
  const title =
    data.sectionTitles?.[
      sectionId
    ] ??
    DEFAULT_SECTION_TITLES[
      sectionId
    ];

  const defaultTitle =
    DEFAULT_SECTION_TITLES[
      sectionId
    ];

  return (
    <div
      className="
        rounded-lg
        border
        border-slate-200
        bg-slate-50/70
        px-3
        py-2.5
        sm:px-3
        sm:py-2
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          min-w-0
        "
      >
        {/* INDICATEUR */}
        <span
          className="
            w-1
            h-5
            bg-slate-900
            rounded-full
            shrink-0
          "
        />

        {/* ICÔNE */}
        <Pencil
          className="
            w-3.5
            h-3.5
            text-slate-400
            shrink-0
          "
        />

        {/* TITRE EDITABLE */}
        <input
          className="
            min-w-0
            flex-1
            bg-transparent
            border-none
            outline-none
            p-0
            text-sm
            font-bold
            text-slate-900
            focus:ring-0
          "
          value={title}
          onChange={(e) =>
            updateSectionTitle(
              sectionId,
              e.target.value
            )
          }
          onBlur={(e) => {
            const value =
              e.target.value.trim();

            if (!value) {
              updateSectionTitle(
                sectionId,
                defaultTitle
              );
            }
          }}
          aria-label={`Modifier le titre de la section ${defaultTitle}`}
        />

        {/* INDICATION MOBILE / DESKTOP */}
        <span
          className="
            hidden
            sm:inline
            shrink-0
            text-[10px]
            font-medium
            text-slate-400
          "
        >
          Modifier
        </span>

        {/* ACTION */}
        {action && (
          <div
            className="
              shrink-0
              ml-auto
            "
          >
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CVForm({
  data,
  onChange,
}: Props) {
  const [draggedId, setDraggedId] =
    useState<string | null>(
      null
    );

  /*
   * =========================================================
   * DND-KIT SENSORS
   * =========================================================
   */

  const sensors =
    useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 6,
        },
      }),

      useSensor(TouchSensor, {
        activationConstraint: {
          delay: 180,
          tolerance: 8,
        },
      })
    );

  /*
   * =========================================================
   * UPDATE
   * =========================================================
   */

  const update = <
    K extends keyof CVData
  >(
    key: K,
    value: CVData[K]
  ) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  const updateStyle = (
    patch: Partial<
      CVData['style']
    >
  ) => {
    onChange({
      ...data,
      style: {
        ...data.style,
        ...patch,
      },
    });
  };

  /*
   * =========================================================
   * TITRES DES SECTIONS
   * =========================================================
   */

  const updateSectionTitle = (
    sectionId: CVSectionId,
    title: string
  ) => {
    onChange({
      ...data,
      sectionTitles: {
        ...DEFAULT_SECTION_TITLES,
        ...(data.sectionTitles ??
          {}),
        [sectionId]:
          title,
      },
    });
  };

  /*
   * =========================================================
   * DRAG END
   * =========================================================
   */

  const handleSortEnd = (
    event: DragEndEvent,
    section:
      | 'skills'
      | 'experiences'
      | 'education'
      | 'projects'
      | 'certifications'
  ) => {
    const {
      active,
      over,
    } = event;

    setDraggedId(null);

    if (!over) {
      return;
    }

    const activeId =
      String(active.id);

    const overId =
      String(over.id);

    if (
      activeId === overId
    ) {
      return;
    }

    if (
      section === 'skills'
    ) {
      moveSkillCategory(
        activeId,
        overId
      );

      return;
    }

    moveArrayItem(
      section,
      activeId,
      overId
    );
  };

  /*
   * =========================================================
   * DRAG START
   * =========================================================
   */

  const handleDragStart = (
    event: any
  ) => {
    setDraggedId(
      String(
        event.active.id
      )
    );
  };

  const handleDragCancel =
    () => {
      setDraggedId(null);
    };

  /*
   * =========================================================
   * MOVE ARRAY ITEM
   * =========================================================
   */

  const moveArrayItem = (
    key:
      | 'experiences'
      | 'education'
      | 'projects'
      | 'certifications',
    draggedItemId: string,
    targetItemId: string
  ) => {
    if (
      !draggedItemId ||
      draggedItemId ===
        targetItemId
    ) {
      return;
    }

    if (
      key === 'experiences'
    ) {
      const items = [
        ...data.experiences,
      ];

      const fromIndex =
        items.findIndex(
          (item) =>
            item.id ===
            draggedItemId
        );

      const targetIndex =
        items.findIndex(
          (item) =>
            item.id ===
            targetItemId
        );

      if (
        fromIndex === -1 ||
        targetIndex === -1
      ) {
        return;
      }

      const [movedItem] =
        items.splice(
          fromIndex,
          1
        );

      items.splice(
        targetIndex,
        0,
        movedItem
      );

      update(
        'experiences',
        items
      );

      return;
    }

    if (key === 'education') {
      const items = [
        ...data.education,
      ];

      const fromIndex =
        items.findIndex(
          (item) =>
            item.id ===
            draggedItemId
        );

      const targetIndex =
        items.findIndex(
          (item) =>
            item.id ===
            targetItemId
        );

      if (
        fromIndex === -1 ||
        targetIndex === -1
      ) {
        return;
      }

      const [movedItem] =
        items.splice(
          fromIndex,
          1
        );

      items.splice(
        targetIndex,
        0,
        movedItem
      );

      update(
        'education',
        items
      );

      return;
    }

    if (key === 'projects') {
      const items = [
        ...data.projects,
      ];

      const fromIndex =
        items.findIndex(
          (item) =>
            item.id ===
            draggedItemId
        );

      const targetIndex =
        items.findIndex(
          (item) =>
            item.id ===
            targetItemId
        );

      if (
        fromIndex === -1 ||
        targetIndex === -1
      ) {
        return;
      }

      const [movedItem] =
        items.splice(
          fromIndex,
          1
        );

      items.splice(
        targetIndex,
        0,
        movedItem
      );

      update(
        'projects',
        items
      );

      return;
    }

    if (
      key === 'certifications'
    ) {
      const items = [
        ...data.certifications,
      ];

      const fromIndex =
        items.findIndex(
          (item) =>
            item.id ===
            draggedItemId
        );

      const targetIndex =
        items.findIndex(
          (item) =>
            item.id ===
            targetItemId
        );

      if (
        fromIndex === -1 ||
        targetIndex === -1
      ) {
        return;
      }

      const [movedItem] =
        items.splice(
          fromIndex,
          1
        );

      items.splice(
        targetIndex,
        0,
        movedItem
      );

      update(
        'certifications',
        items
      );
    }
  };

  /*
   * =========================================================
   * MOVE SKILL CATEGORY
   * =========================================================
   */

  const moveSkillCategory = (
    draggedItemId: string,
    targetItemId: string
  ) => {
    if (
      !draggedItemId ||
      draggedItemId ===
        targetItemId
    ) {
      return;
    }

    const items = [
      ...data.skills,
    ];

    const fromIndex =
      items.findIndex(
        (item) =>
          item.id ===
          draggedItemId
      );

    const targetIndex =
      items.findIndex(
        (item) =>
          item.id ===
          targetItemId
      );

    if (
      fromIndex === -1 ||
      targetIndex === -1
    ) {
      return;
    }

    const [movedItem] =
      items.splice(
        fromIndex,
        1
      );

    items.splice(
      targetIndex,
      0,
      movedItem
    );

    update(
      'skills',
      items
    );
  };

  /*
   * =========================================================
   * ARRAY OPERATIONS
   * =========================================================
   */

  const arrayOps = {
    add: (
      key:
        | 'experiences'
        | 'education'
        | 'projects'
        | 'certifications',
      item:
        | Experience
        | Education
        | Project
        | Certification
    ) => {
      if (
        key ===
        'experiences'
      ) {
        update(
          'experiences',
          [
            ...data.experiences,
            item as Experience,
          ]
        );

        return;
      }

      if (
        key === 'education'
      ) {
        update(
          'education',
          [
            ...data.education,
            item as Education,
          ]
        );

        return;
      }

      if (
        key === 'projects'
      ) {
        update(
          'projects',
          [
            ...data.projects,
            item as Project,
          ]
        );

        return;
      }

      const nextSectionOrder: CVSectionId[] =
        data.sectionOrder?.includes(
          'certifications'
        )
          ? [
              ...data.sectionOrder,
            ]
          : [
              ...(data.sectionOrder ??
                []),
              'certifications',
            ];

      update(
        'certifications',
        [
          ...data.certifications,
          item as Certification,
        ]
      );

      onChange({
        ...data,
        sectionOrder:
          nextSectionOrder,
        sectionTitles: {
          ...DEFAULT_SECTION_TITLES,
          ...(data.sectionTitles ??
            {}),
        },
      });
    },

    remove: (
      key:
        | 'experiences'
        | 'education'
        | 'projects'
        | 'certifications',
      id: string
    ) => {
      if (
        key === 'experiences'
      ) {
        update(
          'experiences',
          data.experiences.filter(
            (x) =>
              x.id !== id
          )
        );

        return;
      }

      if (
        key === 'education'
      ) {
        update(
          'education',
          data.education.filter(
            (x) =>
              x.id !== id
          )
        );

        return;
      }

      if (
        key === 'projects'
      ) {
        update(
          'projects',
          data.projects.filter(
            (x) =>
              x.id !== id
          )
        );

        return;
      }

      update(
        'certifications',
        data.certifications.filter(
          (x) =>
            x.id !== id
        )
      );
    },

    patch: (
      key:
        | 'experiences'
        | 'education'
        | 'projects'
        | 'certifications',
      id: string,
      field: string,
      value: string
    ) => {
      if (
        key === 'experiences'
      ) {
        update(
          'experiences',
          data.experiences.map(
            (x) =>
              x.id === id
                ? {
                    ...x,
                    [field]:
                      value,
                  }
                : x
          )
        );

        return;
      }

      if (
        key === 'education'
      ) {
        update(
          'education',
          data.education.map(
            (x) =>
              x.id === id
                ? {
                    ...x,
                    [field]:
                      value,
                  }
                : x
          )
        );

        return;
      }

      if (
        key === 'projects'
      ) {
        update(
          'projects',
          data.projects.map(
            (x) =>
              x.id === id
                ? {
                    ...x,
                    [field]:
                      value,
                  }
                : x
          )
        );

        return;
      }

      update(
        'certifications',
        data.certifications.map(
          (x) =>
            x.id === id
              ? {
                  ...x,
                  [field]:
                    value,
                }
              : x
          )
      );
    },
  };

  /*
   * =========================================================
   * SKILLS OPERATIONS
   * =========================================================
   */

  const skillOps = {
    addCategory: () =>
      update(
        'skills',
        [
          ...data.skills,
          {
            id: uid(),
            name: 'Nouvelle catégorie',
            items: [],
          } as SkillCategory,
        ]
      ),

    removeCategory: (
      id: string
    ) =>
      update(
        'skills',
        data.skills.filter(
          (c) =>
            c.id !== id
        )
      ),

    renameCategory: (
      id: string,
      name: string
    ) =>
      update(
        'skills',
        data.skills.map(
          (c) =>
            c.id === id
              ? {
                  ...c,
                  name,
                }
              : c
        )
      ),

    addItem: (
      catId: string,
      item: string
    ) => {
      const value =
        item.trim();

      if (!value) {
        return;
      }

      update(
        'skills',
        data.skills.map(
          (c) =>
            c.id === catId
              ? {
                  ...c,
                  items: [
                    ...c.items,
                    value,
                  ],
                }
              : c
        )
      );
    },

    removeItem: (
      catId: string,
      idx: number
    ) =>
      update(
        'skills',
        data.skills.map(
          (c) =>
            c.id === catId
              ? {
                  ...c,
                  items:
                    c.items.filter(
                      (_, i) =>
                        i !== idx
                    ),
                }
              : c
        )
      ),
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          STYLE
      ====================================================== */}

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="w-1 h-4 bg-slate-900 rounded-full" />
          Style
        </h3>

        <div>
          <label
            className={`${labelCls} flex items-center gap-1.5`}
          >
            <Type className="w-3.5 h-3.5" />

            Taille du texte

            <span className="ml-auto normal-case tracking-normal text-slate-400 font-medium">
              {Math.round(
                data.style.fontScale *
                  100
              )}
              %
            </span>
          </label>

          <input
            type="range"
            min={0.8}
            max={1.3}
            step={0.05}
            value={
              data.style.fontScale
            }
            onChange={(e) =>
              updateStyle({
                fontScale:
                  parseFloat(
                    e.target.value
                  ),
              })
            }
            className="w-full accent-slate-900"
          />
        </div>

        <div>
          <label
            className={labelCls}
          >
            Police
          </label>

          <div className="grid grid-cols-2 gap-2">
            {fontFamilies.map(
              (font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() =>
                    updateStyle({
                      fontFamily:
                        font.id,
                    })
                  }
                  style={{
                    fontFamily:
                      font.stack,
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm transition text-left ${
                    data.style
                      .fontFamily ===
                    font.id
                      ? 'border-slate-900 bg-slate-50 text-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {font.label}
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label
            className={`${labelCls} flex items-center gap-1.5`}
          >
            <Palette className="w-3.5 h-3.5" />

            Couleurs
          </label>

          <div className="grid grid-cols-6 gap-2 mb-3">
            {colorPresets.map(
              (preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    updateStyle({
                      primary:
                        preset.primary,
                      secondary:
                        preset.secondary,
                      accent:
                        preset.accent,
                      text:
                        preset.text,
                      muted:
                        preset.muted,
                      surface:
                        preset.surface,
                      border:
                        preset.border,
                    })
                  }
                  title={
                    preset.name
                  }
                  className={`h-9 rounded-lg transition border-2 ${
                    data.style
                      .primary ===
                    preset.primary
                      ? 'ring-2 ring-offset-1 ring-slate-900 border-white'
                      : 'border-white hover:scale-105'
                  }`}
                  style={{
                    background:
                      preset.primary,
                  }}
                />
              )
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 rounded-lg border border-slate-200 p-3 bg-slate-50/60">
            {([
              [
                'primary',
                'Principale',
              ],
              [
                'secondary',
                'Secondaire',
              ],
              [
                'accent',
                'Accent',
              ],
              [
                'text',
                'Texte',
              ],
              [
                'muted',
                'Texte léger',
              ],
              [
                'surface',
                'Fond clair',
              ],
              [
                'border',
                'Bordures',
              ],
            ] as [
              keyof CVStyle,
              string
            ][]).map(
              ([
                key,
                label,
              ]) => (
                <div
                  key={key}
                  className="flex items-center gap-2"
                >
                  <input
                    type="color"
                    value={
                      (data.style[
                        key
                      ] as string) ||
                      '#000000'
                    }
                    onChange={(e) =>
                      updateStyle({
                        [key]:
                          e.target.value,
                      } as Partial<CVStyle>)
                    }
                    className="w-8 h-8 rounded border border-slate-200 cursor-pointer bg-white p-0.5 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-slate-600 block leading-tight">
                      {label}
                    </span>

                    <input
                      className="w-full text-[10px] text-slate-400 bg-transparent border-none outline-none p-0"
                      value={
                        (data.style[
                          key
                        ] as string) ||
                        ''
                      }
                      onChange={(e) =>
                        updateStyle({
                          [key]:
                            e.target.value,
                        } as Partial<CVStyle>)
                      }
                      placeholder="auto"
                    />
                  </div>

                  {data.style[
                    key
                  ] && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStyle({
                          [key]: '',
                        } as Partial<CVStyle>)
                      }
                      className="text-slate-300 hover:text-slate-600 shrink-0"
                      aria-label="Réinitialiser"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              updateStyle({
                primary: '',
                secondary: '',
                accent: '',
                text: '',
                muted: '',
                surface: '',
                border: '',
              })
            }
            className="mt-2 text-xs text-slate-400 hover:text-slate-700"
          >
            Réinitialiser toutes les couleurs
          </button>
        </div>
      </section>

      {/* =====================================================
          IDENTITÉ
      ====================================================== */}

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="w-1 h-4 bg-slate-900 rounded-full" />
          Identité
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {data.photo ? (
                <div className="relative">
                  <img
                    src={data.photo}
                    alt="Photo"
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      update(
                        'photo',
                        ''
                      )
                    }
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition shadow"
                    aria-label="Supprimer la photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-500 hover:bg-slate-50 transition gap-1 text-slate-400">
                  <ImagePlus className="w-5 h-5" />

                  <span className="text-[9px] font-medium text-center leading-tight">
                    Photo
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file =
                        event
                          .target
                          .files?.[0];

                      if (!file) {
                        return;
                      }

                      const reader =
                        new FileReader();

                      reader.onload =
                        () =>
                          update(
                            'photo',
                            reader.result as string
                          );

                      reader.readAsDataURL(
                        file
                      );
                    }}
                  />
                </label>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Ajoutez une photo de profil.
              Elle apparaîtra dans l'en-tête
              du CV. Utilisez un cadrage carré
              pour un meilleur rendu.
            </p>
          </div>

          {data.photo && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Taille de la photo
                </label>

                <span className="text-[11px] font-medium text-slate-500">
                  {Math.round(
                    (data.photoScale ??
                      1) *
                      100
                  )}
                  %
                </span>
              </div>

              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={
                  data.photoScale ??
                  1
                }
                onChange={(e) =>
                  update(
                    'photoScale',
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full accent-slate-900 cursor-pointer"
              />

              <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                <span>Petite</span>
                <span>Grande</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              Nom complet
            </label>

            <input
              className={inputCls}
              value={data.name}
              onChange={(e) =>
                update(
                  'name',
                  e.target.value
                )
              }
              placeholder="Alex Martin"
            />
          </div>

          <div>
            <label className={labelCls}>
              Titre / Poste
            </label>

            <input
              className={inputCls}
              value={data.title}
              onChange={(e) =>
                update(
                  'title',
                  e.target.value
                )
              }
              placeholder="Senior Product Designer"
            />
          </div>

          <div>
            <label className={labelCls}>
              Email
            </label>

            <input
              className={inputCls}
              value={data.email}
              onChange={(e) =>
                update(
                  'email',
                  e.target.value
                )
              }
              placeholder="alex@email.com"
            />
          </div>

          <div>
            <label className={labelCls}>
              Téléphone
            </label>

            <input
              className={inputCls}
              value={data.phone}
              onChange={(e) =>
                update(
                  'phone',
                  e.target.value
                )
              }
              placeholder="+33 6 ..."
            />
          </div>

          <div>
            <label className={labelCls}>
              Localisation
            </label>

            <input
              className={inputCls}
              value={data.location}
              onChange={(e) =>
                update(
                  'location',
                  e.target.value
                )
              }
              placeholder="Paris, France"
            />
          </div>

          <div>
            <label className={labelCls}>
              Site web
            </label>

            <input
              className={inputCls}
              value={data.website}
              onChange={(e) =>
                update(
                  'website',
                  e.target.value
                )
              }
              placeholder="alex.design"
            />
          </div>

          <div>
            <label
              className={`${labelCls} flex items-center justify-between`}
            >
              <span>
                Date de naissance
              </span>

              {data.birthDate && (
                <button
                  type="button"
                  onClick={() =>
                    update(
                      'birthDate',
                      ''
                    )
                  }
                  className="normal-case tracking-normal text-[10px] font-medium text-slate-400 hover:text-slate-700 transition"
                >
                  Effacer
                </button>
              )}
            </label>

            <input
              type="date"
              className={inputCls}
              value={
                data.birthDate ||
                ''
              }
              onChange={(e) =>
                update(
                  'birthDate',
                  e.target.value
                )
              }
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 h-[38px] px-3 rounded-lg border border-slate-300 bg-white cursor-pointer hover:bg-slate-50 transition w-full">
              <input
                type="checkbox"
                checked={
                  data.hasDrivingLicense ??
                  false
                }
                onChange={(e) =>
                  update(
                    'hasDrivingLicense',
                    e.target.checked
                  )
                }
                className="w-4 h-4 accent-slate-900"
              />

              <span className="text-sm text-slate-700">
                Permis B
              </span>
            </label>
          </div>

          <div>
            <label
              className={`${labelCls} flex items-center gap-1`}
            >
              <Linkedin className="w-3 h-3" />
              LinkedIn
            </label>

            <input
              className={inputCls}
              value={data.linkedin}
              onChange={(e) =>
                update(
                  'linkedin',
                  e.target.value
                )
              }
              placeholder="linkedin.com/in/..."
            />
          </div>

          <div>
            <label
              className={`${labelCls} flex items-center gap-1`}
            >
              <Github className="w-3 h-3" />
              GitHub
            </label>

            <input
              className={inputCls}
              value={data.github}
              onChange={(e) =>
                update(
                  'github',
                  e.target.value
                )
              }
              placeholder="github.com/..."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          PROFIL
      ====================================================== */}

      <section className="space-y-3">
        <SectionEditorTitle
          sectionId="summary"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
        />

        <ResizableTextarea
          value={data.summary}
          onChange={(e) =>
            update(
              'summary',
              e.target.value
            )
          }
          placeholder="Présentez votre profil, vos compétences et vos objectifs..."
        />
      </section>

      {/* =====================================================
          COMPÉTENCES
      ====================================================== */}

      <section className="space-y-3">
        <SectionEditorTitle
          sectionId="skills"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
          action={
            <button
              type="button"
              onClick={
                skillOps.addCategory
              }
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                Catégorie
              </span>
              <span className="sm:hidden">
                +
              </span>
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={
            closestCenter
          }
          onDragStart={
            handleDragStart
          }
          onDragCancel={
            handleDragCancel
          }
          onDragEnd={(event) =>
            handleSortEnd(
              event,
              'skills'
            )
          }
        >
          <SortableContext
            items={data.skills.map(
              (cat) => cat.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="space-y-3">
              {data.skills.map(
                (cat) => (
                  <SortableItem
                    key={cat.id}
                    id={cat.id}
                  >
                    {({
                      setNodeRef,
                      style,
                      attributes,
                      listeners,
                      isDragging,
                    }) => (
                      <div
                        ref={setNodeRef}
                        style={style}
                        className={`relative rounded-xl border border-slate-200 p-3 space-y-2.5 bg-slate-50/60 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing touch-none shrink-0 p-1 -ml-1 rounded hover:bg-slate-200"
                            title="Déplacer la catégorie"
                            aria-label="Déplacer la catégorie"
                          >
                            <GripVertical
                              className={`w-4 h-4 ${
                                isDragging
                                  ? 'text-slate-900'
                                  : 'text-slate-300 hover:text-slate-600'
                              }`}
                            />
                          </button>

                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />

                          <input
                            className={`${inputCls} font-semibold`}
                            value={cat.name}
                            onChange={(e) =>
                              skillOps.renameCategory(
                                cat.id,
                                e.target.value
                              )
                            }
                            placeholder="Nom de la catégorie"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              skillOps.removeCategory(
                                cat.id
                              )
                            }
                            className="text-slate-400 hover:text-red-500 transition shrink-0"
                            aria-label="Supprimer la catégorie"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pl-6">
                          {cat.items.map(
                            (
                              item,
                              i
                            ) => (
                              <span
                                key={`${cat.id}-${i}`}
                                className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 pl-2 pr-1 py-0.5 text-xs text-slate-700"
                              >
                                {item}

                                <button
                                  type="button"
                                  onClick={() =>
                                    skillOps.removeItem(
                                      cat.id,
                                      i
                                    )
                                  }
                                  className="rounded p-0.5 hover:bg-slate-200 text-slate-400"
                                  aria-label="Supprimer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            )
                          )}
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();

                            const input =
                              e.currentTarget
                                .elements
                                .namedItem(
                                  'item'
                                ) as HTMLInputElement;

                            skillOps.addItem(
                              cat.id,
                              input.value
                            );

                            input.value =
                              '';
                          }}
                          className="flex gap-2 pl-6"
                        >
                          <input
                            name="item"
                            className={inputCls}
                            placeholder="Ajouter un élément (ex: Linux)"
                          />

                          <button
                            type="submit"
                            className="shrink-0 rounded-lg bg-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-300 transition flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    )}
                  </SortableItem>
                )
              )}

              {data.skills.length ===
                0 && (
                <p className="text-xs text-slate-400 italic">
                  Aucune catégorie.
                  Cliquez sur «
                  Catégorie » pour
                  commencer.
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* =====================================================
          EXPÉRIENCES
      ====================================================== */}

      <section className="space-y-3">
        <SectionEditorTitle
          sectionId="experiences"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
          action={
            <button
              type="button"
              onClick={() =>
                arrayOps.add(
                  'experiences',
                  {
                    id: uid(),
                    role: '',
                    company: '',
                    period: '',
                    description:
                      '',
                  } as Experience
                )
              }
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                Ajouter
              </span>
              <span className="sm:hidden">
                +
              </span>
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={
            closestCenter
          }
          onDragStart={
            handleDragStart
          }
          onDragCancel={
            handleDragCancel
          }
          onDragEnd={(event) =>
            handleSortEnd(
              event,
              'experiences'
            )
          }
        >
          <SortableContext
            items={data.experiences.map(
              (exp) => exp.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="space-y-3">
              {data.experiences.map(
                (exp) => (
                  <SortableItem
                    key={exp.id}
                    id={exp.id}
                  >
                    {({
                      setNodeRef,
                      style,
                      attributes,
                      listeners,
                      isDragging,
                    }) => (
                      <div
                        ref={setNodeRef}
                        style={style}
                        className={`relative rounded-xl border border-slate-200 p-3 space-y-2 bg-slate-50/60 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="mt-2 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1 -ml-1 rounded hover:bg-slate-200"
                            title="Déplacer l'expérience"
                            aria-label="Déplacer l'expérience"
                          >
                            <GripVertical
                              className={`w-4 h-4 ${
                                isDragging
                                  ? 'text-slate-900'
                                  : 'text-slate-300 hover:text-slate-600'
                              }`}
                            />
                          </button>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              className={inputCls}
                              value={exp.role}
                              onChange={(e) =>
                                arrayOps.patch(
                                  'experiences',
                                  exp.id,
                                  'role',
                                  e.target.value
                                )
                              }
                              placeholder="Poste"
                            />

                            <input
                              className={inputCls}
                              value={exp.company}
                              onChange={(e) =>
                                arrayOps.patch(
                                  'experiences',
                                  exp.id,
                                  'company',
                                  e.target.value
                                )
                              }
                              placeholder="Entreprise"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              arrayOps.remove(
                                'experiences',
                                exp.id
                              )
                            }
                            className="mt-2 text-slate-400 hover:text-red-500 transition"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          className={inputCls}
                          value={exp.period}
                          onChange={(e) =>
                            arrayOps.patch(
                              'experiences',
                              exp.id,
                              'period',
                              e.target.value
                            )
                          }
                          placeholder="Période (ex: 2021 — Present)"
                        />

                        <ResizableTextarea
                          value={
                            exp.description
                          }
                          onChange={(e) =>
                            arrayOps.patch(
                              'experiences',
                              exp.id,
                              'description',
                              e.target.value
                            )
                          }
                          placeholder="Description des missions et résultats"
                        />
                      </div>
                    )}
                  </SortableItem>
                )
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* =====================================================
          FORMATION
      ====================================================== */}

      <section className="space-y-3">
        <SectionEditorTitle
          sectionId="education"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
          action={
            <button
              type="button"
              onClick={() =>
                arrayOps.add(
                  'education',
                  {
                    id: uid(),
                    degree: '',
                    school: '',
                    period: '',
                    description:
                      '',
                  } as Education
                )
              }
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                Ajouter
              </span>
              <span className="sm:hidden">
                +
              </span>
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={
            closestCenter
          }
          onDragStart={
            handleDragStart
          }
          onDragCancel={
            handleDragCancel
          }
          onDragEnd={(event) =>
            handleSortEnd(
              event,
              'education'
            )
          }
        >
          <SortableContext
            items={data.education.map(
              (ed) => ed.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="space-y-3">
              {data.education.map(
                (ed) => (
                  <SortableItem
                    key={ed.id}
                    id={ed.id}
                  >
                    {({
                      setNodeRef,
                      style,
                      attributes,
                      listeners,
                      isDragging,
                    }) => (
                      <div
                        ref={setNodeRef}
                        style={style}
                        className={`relative rounded-xl border border-slate-200 p-3 space-y-2 bg-slate-50/60 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="mt-2 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1 -ml-1 rounded hover:bg-slate-200"
                            title="Déplacer la formation"
                            aria-label="Déplacer la formation"
                          >
                            <GripVertical
                              className={`w-4 h-4 ${
                                isDragging
                                  ? 'text-slate-900'
                                  : 'text-slate-300 hover:text-slate-600'
                              }`}
                            />
                          </button>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              className={inputCls}
                              value={ed.degree}
                              onChange={(e) =>
                                arrayOps.patch(
                                  'education',
                                  ed.id,
                                  'degree',
                                  e.target.value
                                )
                              }
                              placeholder="Diplôme"
                            />

                            <input
                              className={inputCls}
                              value={ed.school}
                              onChange={(e) =>
                                arrayOps.patch(
                                  'education',
                                  ed.id,
                                  'school',
                                  e.target.value
                                )
                              }
                              placeholder="Établissement"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              arrayOps.remove(
                                'education',
                                ed.id
                              )
                            }
                            className="mt-2 text-slate-400 hover:text-red-500 transition"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          className={inputCls}
                          value={ed.period}
                          onChange={(e) =>
                            arrayOps.patch(
                              'education',
                              ed.id,
                              'period',
                              e.target.value
                            )
                          }
                          placeholder="Période"
                        />

                        <ResizableTextarea
                          value={
                            ed.description
                          }
                          onChange={(e) =>
                            arrayOps.patch(
                              'education',
                              ed.id,
                              'description',
                              e.target.value
                            )
                          }
                          placeholder="Description (optionnelle)"
                        />
                      </div>
                    )}
                  </SortableItem>
                )
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* =====================================================
          CERTIFICATIONS
      ====================================================== */}

      <section className="space-y-3">
        <SectionEditorTitle
          sectionId="certifications"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
          action={
            <button
              type="button"
              onClick={() =>
                arrayOps.add(
                  'certifications',
                  {
                    id: uid(),
                    name: '',
                    organization:
                      '',
                    date: '',
                    url: '',
                  } as Certification
                )
              }
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                Ajouter
              </span>
              <span className="sm:hidden">
                +
              </span>
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={
            closestCenter
          }
          onDragStart={
            handleDragStart
          }
          onDragCancel={
            handleDragCancel
          }
          onDragEnd={(event) =>
            handleSortEnd(
              event,
              'certifications'
            )
          }
        >
          <SortableContext
            items={data.certifications.map(
              (certification) =>
                certification.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="space-y-3">
              {data.certifications.map(
                (
                  certification
                ) => (
                  <SortableItem
                    key={
                      certification.id
                    }
                    id={
                      certification.id
                    }
                  >
                    {({
                      setNodeRef,
                      style,
                      attributes,
                      listeners,
                      isDragging,
                    }) => (
                      <div
                        ref={setNodeRef}
                        style={style}
                        className={`relative rounded-xl border border-slate-200 p-3 space-y-2 bg-slate-50/60 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="mt-2 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1 -ml-1 rounded hover:bg-slate-200"
                            title="Déplacer la certification"
                            aria-label="Déplacer la certification"
                          >
                            <GripVertical
                              className={`w-4 h-4 ${
                                isDragging
                                  ? 'text-slate-900'
                                  : 'text-slate-300 hover:text-slate-600'
                              }`}
                            />
                          </button>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              className={inputCls}
                              value={
                                certification.name
                              }
                              onChange={(e) =>
                                arrayOps.patch(
                                  'certifications',
                                  certification.id,
                                  'name',
                                  e.target.value
                                )
                              }
                              placeholder="Nom de la certification"
                            />

                            <input
                              className={inputCls}
                              value={
                                certification.organization
                              }
                              onChange={(e) =>
                                arrayOps.patch(
                                  'certifications',
                                  certification.id,
                                  'organization',
                                  e.target.value
                                )
                              }
                              placeholder="Organisme"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              arrayOps.remove(
                                'certifications',
                                certification.id
                              )
                            }
                            className="mt-2 text-slate-400 hover:text-red-500 transition"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            className={inputCls}
                            value={
                              certification.date
                            }
                            onChange={(e) =>
                              arrayOps.patch(
                                'certifications',
                                certification.id,
                                'date',
                                e.target.value
                              )
                            }
                            placeholder="Date / année"
                          />

                          <input
                            className={inputCls}
                            value={
                              certification.url
                            }
                            onChange={(e) =>
                              arrayOps.patch(
                                'certifications',
                                certification.id,
                                'url',
                                e.target.value
                              )
                            }
                            placeholder="URL"
                          />
                        </div>
                      </div>
                    )}
                  </SortableItem>
                )
              )}

              {data.certifications
                .length ===
                0 && (
                <p className="text-xs text-slate-400 italic">
                  Aucune certification.
                  Cliquez sur «
                  Ajouter » pour
                  commencer.
                </p>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* =====================================================
          PROJETS
      ====================================================== */}

      <section className="space-y-3">
        <SectionEditorTitle
          sectionId="projects"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
          action={
            <button
              type="button"
              onClick={() =>
                arrayOps.add(
                  'projects',
                  {
                    id: uid(),
                    name: '',
                    url: '',
                    description:
                      '',
                  } as Project
                )
              }
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                Ajouter
              </span>
              <span className="sm:hidden">
                +
              </span>
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={
            closestCenter
          }
          onDragStart={
            handleDragStart
          }
          onDragCancel={
            handleDragCancel
          }
          onDragEnd={(event) =>
            handleSortEnd(
              event,
              'projects'
            )
          }
        >
          <SortableContext
            items={data.projects.map(
              (project) =>
                project.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="space-y-3">
              {data.projects.map(
                (project) => (
                  <SortableItem
                    key={
                      project.id
                    }
                    id={
                      project.id
                    }
                  >
                    {({
                      setNodeRef,
                      style,
                      attributes,
                      listeners,
                      isDragging,
                    }) => (
                      <div
                        ref={setNodeRef}
                        style={style}
                        className={`relative rounded-xl border border-slate-200 p-3 space-y-2 bg-slate-50/60 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="mt-2 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1 -ml-1 rounded hover:bg-slate-200"
                            title="Déplacer le projet"
                            aria-label="Déplacer le projet"
                          >
                            <GripVertical
                              className={`w-4 h-4 ${
                                isDragging
                                  ? 'text-slate-900'
                                  : 'text-slate-300 hover:text-slate-600'
                              }`}
                            />
                          </button>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              className={inputCls}
                              value={
                                project.name
                              }
                              onChange={(e) =>
                                arrayOps.patch(
                                  'projects',
                                  project.id,
                                  'name',
                                  e.target.value
                                )
                              }
                              placeholder="Nom du projet"
                            />

                            <input
                              className={inputCls}
                              value={
                                project.url
                              }
                              onChange={(e) =>
                                arrayOps.patch(
                                  'projects',
                                  project.id,
                                  'url',
                                  e.target.value
                                )
                              }
                              placeholder="URL"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              arrayOps.remove(
                                'projects',
                                project.id
                              )
                            }
                            className="mt-2 text-slate-400 hover:text-red-500 transition"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <ResizableTextarea
                          value={
                            project.description
                          }
                          onChange={(e) =>
                            arrayOps.patch(
                              'projects',
                              project.id,
                              'description',
                              e.target.value
                            )
                          }
                          placeholder="Description du projet"
                        />
                      </div>
                    )}
                  </SortableItem>
                )
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* =====================================================
          CENTRES D'INTÉRÊT
      ====================================================== */}

      <section className="space-y-3">
        <SectionEditorTitle
          sectionId="interests"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
        />

        <div className="flex flex-wrap gap-2">
          {data.interests.map(
            (
              interest,
              index
            ) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 pl-3 pr-1.5 py-1 text-xs font-medium text-slate-700"
              >
                {interest}

                <button
                  type="button"
                  onClick={() =>
                    update(
                      'interests',
                      data.interests.filter(
                        (
                          _,
                          itemIndex
                        ) =>
                          itemIndex !==
                          index
                      )
                    )
                  }
                  className="rounded-full p-0.5 hover:bg-slate-300 transition text-slate-500"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            )
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const input =
              e.currentTarget
                .elements
                .namedItem(
                  'interest'
                ) as HTMLInputElement;

            const value =
              input.value.trim();

            if (
              value &&
              !data.interests.includes(
                value
              )
            ) {
              update(
                'interests',
                [
                  ...data.interests,
                  value,
                ]
              );
            }

            input.value = '';
          }}
          className="flex gap-2"
        >
          <input
            name="interest"
            className={inputCls}
            placeholder="Ajouter (ex: Photographie)"
          />

          <button
            type="submit"
            className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">
              Ajouter
            </span>
            <span className="sm:hidden">
              +
            </span>
          </button>
        </form>
      </section>
    </div>
  );
}