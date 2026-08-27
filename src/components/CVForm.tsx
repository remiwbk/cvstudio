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
  type Language,
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
    zIndex: isDragging ? 50 : undefined,
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

/*
 * =========================================================
 * STYLES COMMUNS
 * =========================================================
 */

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 bg-white outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-400';

const labelCls =
  'block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider';

const sectionCls =
  'space-y-5 pt-7 first:pt-0';

const sectionHeaderCls =
  'flex items-center justify-between gap-3 pb-4 border-b border-slate-200';

const sectionTitleCls =
  'text-xl font-bold tracking-tight text-slate-950';

const cardCls =
  'rounded-xl border border-slate-200 bg-slate-50/60 p-4';

const subtleCardCls =
  'rounded-xl border border-slate-200 bg-white p-4';

/*
 * =========================================================
 * TEXTAREA REDIMENSIONNABLE
 * =========================================================
 */

function ResizableTextarea({
  value,
  onChange,
  placeholder,
  minHeight = 70,
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
    startY.current = e.clientY;
    startHeight.current = height;

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
      e.clientY - startY.current;

    setHeight(
      Math.max(
        minHeight,
        startHeight.current + delta
      )
    );
  };

  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    resizing.current = false;

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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
 * TITRE DE SECTION
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
    data.sectionTitles?.[sectionId] ??
    DEFAULT_SECTION_TITLES[sectionId];

  const defaultTitle =
    DEFAULT_SECTION_TITLES[sectionId];

  return (
    <div className={sectionHeaderCls}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-1 h-7 rounded-full bg-slate-900 shrink-0" />

        <Pencil className="w-4 h-4 text-slate-400 shrink-0" />

        <input
          className="
            min-w-0
            bg-transparent
            border-none
            outline-none
            p-0
            text-xl
            font-bold
            tracking-tight
            text-slate-950
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
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

/*
 * =========================================================
 * EN-TÊTE DE SOUS-BLOC
 * =========================================================
 */

function SubTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h4 className="text-sm font-bold text-slate-800">
      {children}
    </h4>
  );
}

export default function CVForm({
  data,
  onChange,
}: Props) {
  const [draggedId, setDraggedId] =
    useState<string | null>(null);

  /*
   * =========================================================
   * DND-KIT
   * =========================================================
   */

  const sensors = useSensors(
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
    patch: Partial<CVData['style']>
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
   * TITRES
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
        ...(data.sectionTitles ?? {}),
        [sectionId]: title,
      },
    });
  };

  /*
   * =========================================================
   * DRAG
   * =========================================================
   */

  const handleSortEnd = (
    event: DragEndEvent,
    section:
      | 'technicalSkills'
      | 'experiences'
      | 'education'
      | 'projects'
      | 'certifications'
      | 'languages'
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

    if (activeId === overId) {
      return;
    }

    if (
      section ===
      'technicalSkills'
    ) {
      moveTechnicalSkillCategory(
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

  const handleDragStart = (
    event: any
  ) => {
    setDraggedId(
      String(event.active.id)
    );
  };

  const handleDragCancel = () => {
    setDraggedId(null);
  };

  /*
   * =========================================================
   * MOVE ARRAY
   * =========================================================
   */

  const moveArrayItem = (
    key:
      | 'experiences'
      | 'education'
      | 'projects'
      | 'certifications'
      | 'languages',
    draggedItemId: string,
    targetItemId: string
  ) => {
    if (
      !draggedItemId ||
      draggedItemId === targetItemId
    ) {
      return;
    }

    const items = [...data[key]];

    const fromIndex =
      items.findIndex(
        (item) =>
          item.id === draggedItemId
      );

    const targetIndex =
      items.findIndex(
        (item) =>
          item.id === targetItemId
      );

    if (
      fromIndex === -1 ||
      targetIndex === -1
    ) {
      return;
    }

    const [movedItem] =
      items.splice(fromIndex, 1);

    items.splice(
      targetIndex,
      0,
      movedItem
    );

    update(
      key,
      items as CVData[typeof key]
    );
  };

  /*
   * =========================================================
   * MOVE TECHNICAL SKILLS
   * =========================================================
   */

  const moveTechnicalSkillCategory = (
    draggedItemId: string,
    targetItemId: string
  ) => {
    if (
      draggedItemId === targetItemId
    ) {
      return;
    }

    const items = [
      ...data.technicalSkills,
    ];

    const fromIndex =
      items.findIndex(
        (item) =>
          item.id === draggedItemId
      );

    const targetIndex =
      items.findIndex(
        (item) =>
          item.id === targetItemId
      );

    if (
      fromIndex === -1 ||
      targetIndex === -1
    ) {
      return;
    }

    const [movedItem] =
      items.splice(fromIndex, 1);

    items.splice(
      targetIndex,
      0,
      movedItem
    );

    update(
      'technicalSkills',
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
        | 'certifications'
        | 'languages',
      item:
        | Experience
        | Education
        | Project
        | Certification
        | Language
    ) => {
      const items = [...data[key]];

      const nextSectionOrder =
        data.sectionOrder.includes(key)
          ? [...data.sectionOrder]
          : [
              ...data.sectionOrder,
              key,
            ];

      onChange({
        ...data,
        [key]: [...items, item],
        sectionOrder:
          nextSectionOrder,
        sectionTitles: {
          ...DEFAULT_SECTION_TITLES,
          ...(data.sectionTitles ?? {}),
        },
      } as CVData);
    },

    remove: (
      key:
        | 'experiences'
        | 'education'
        | 'projects'
        | 'certifications'
        | 'languages',
      id: string
    ) => {
      update(
        key,
        data[key].filter(
          (item) =>
            item.id !== id
        ) as CVData[typeof key]
      );
    },

    patch: (
      key:
        | 'experiences'
        | 'education'
        | 'projects'
        | 'certifications'
        | 'languages',
      id: string,
      field: string,
      value: string
    ) => {
      update(
        key,
        data[key].map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ) as CVData[typeof key]
      );
    },
  };

  /*
   * =========================================================
   * COMPÉTENCES TECHNIQUES
   * =========================================================
   */

  const technicalSkillOps = {
    addCategory: () =>
      update(
        'technicalSkills',
        [
          ...data.technicalSkills,
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
        'technicalSkills',
        data.technicalSkills.filter(
          (category) =>
            category.id !== id
        )
      ),

    renameCategory: (
      id: string,
      name: string
    ) =>
      update(
        'technicalSkills',
        data.technicalSkills.map(
          (category) =>
            category.id === id
              ? {
                  ...category,
                  name,
                }
              : category
        )
      ),

    addItem: (
      categoryId: string,
      item: string
    ) => {
      const value =
        item.trim();

      if (!value) {
        return;
      }

      update(
        'technicalSkills',
        data.technicalSkills.map(
          (category) =>
            category.id === categoryId
              ? {
                  ...category,
                  items: [
                    ...category.items,
                    value,
                  ],
                }
              : category
        )
      );
    },

    removeItem: (
      categoryId: string,
      index: number
    ) =>
      update(
        'technicalSkills',
        data.technicalSkills.map(
          (category) =>
            category.id === categoryId
              ? {
                  ...category,
                  items:
                    category.items.filter(
                      (_, itemIndex) =>
                        itemIndex !==
                        index
                    ),
                }
              : category
        )
      ),
  };

  /*
   * =========================================================
   * COMPÉTENCES GÉNÉRALES
   * =========================================================
   */

  const addSoftSkill = (
    value: string
  ) => {
    const skill =
      value.trim();

    if (
      !skill ||
      data.softSkills.includes(skill)
    ) {
      return;
    }

    update(
      'softSkills',
      [
        ...data.softSkills,
        skill,
      ]
    );
  };

  const removeSoftSkill = (
    index: number
  ) => {
    update(
      'softSkills',
      data.softSkills.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="space-y-0 pb-8">

      {/* =====================================================
          STYLE
      ====================================================== */}

      <section className={sectionCls}>
        <div className={sectionHeaderCls}>
          <div className="flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-slate-900" />

            <div>
              <h2 className={sectionTitleCls}>
                Style
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Personnalisez l'apparence de votre CV.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">

          {/* Taille + police */}

          <div className={cardCls}>
            <SubTitle>
              Typographie
            </SubTitle>

            <div className="mt-4 space-y-5">

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>
                    Taille du texte
                  </label>

                  <span className="text-xs font-semibold text-slate-600">
                    {Math.round(
                      data.style.fontScale *
                        100
                    )}
                    %
                  </span>
                </div>

                <input
                  type="range"
                  min={0.8}
                  max={2.5}
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

                <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                  <span>Compact</span>
                  <span>Grand</span>
                </div>
              </div>

              <div>
                <label className={labelCls}>
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
                        className={`rounded-lg border px-3 py-2.5 text-sm transition text-left ${
                          data.style
                            .fontFamily ===
                          font.id
                            ? 'border-slate-900 bg-white text-slate-900 ring-1 ring-slate-900'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {font.label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Couleurs */}

          <div className={cardCls}>
            <div className="flex items-center justify-between gap-3">
              <SubTitle>
                Couleurs
              </SubTitle>

              <Palette className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-4">
              <label className={labelCls}>
                Palette
              </label>

              <div className="grid grid-cols-6 gap-2">
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
                      title={preset.name}
                      className={`h-9 rounded-lg transition border-2 ${
                        data.style.primary ===
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
            </div>

            <div className="mt-5 pt-5 border-t border-slate-200">
              <label className={labelCls}>
                Personnalisation avancée
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  ['primary', 'Principale'],
                  ['secondary', 'Secondaire'],
                  ['accent', 'Accent'],
                  ['text', 'Texte'],
                  ['muted', 'Texte léger'],
                  ['surface', 'Fond clair'],
                  ['border', 'Bordures'],
                ] as [
                  keyof CVStyle,
                  string
                ][]).map(
                  ([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5"
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
                        <span className="text-xs font-medium text-slate-600 block">
                          {label}
                        </span>

                        <input
                          className="w-full text-[10px] text-slate-400 bg-transparent border-none outline-none p-0 mt-0.5"
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

                      {data.style[key] && (
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
                className="mt-3 text-xs text-slate-400 hover:text-slate-700 transition"
              >
                Réinitialiser toutes les couleurs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          IDENTITÉ
      ====================================================== */}

      <section className={sectionCls}>
        <div className={sectionHeaderCls}>
          <div className="flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-slate-900" />

            <div>
              <h2 className={sectionTitleCls}>
                Identité
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Vos informations personnelles et coordonnées.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">

          {/* Photo */}

          <div className={cardCls}>
            <SubTitle>
              Photo de profil
            </SubTitle>

            <div className="mt-4 flex items-center gap-4">
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

                    <span className="text-[9px] font-medium">
                      Ajouter
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file =
                          event.target.files?.[0];

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

              <div className="text-xs text-slate-500 leading-relaxed">
                <p>
                  Ajoutez une photo de profil.
                </p>

                <p className="mt-1 text-slate-400">
                  Un cadrage carré est recommandé.
                </p>
              </div>
            </div>

            {data.photo && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>
                    Taille de la photo
                  </label>

                  <span className="text-[11px] font-medium text-slate-500">
                    {Math.round(
                      (data.photoScale ?? 1) *
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
                    data.photoScale ?? 1
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

          {/* Informations principales */}

          <div className={cardCls}>
            <SubTitle>
              Informations principales
            </SubTitle>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Coordonnées */}

          <div className={cardCls}>
            <SubTitle>
              Coordonnées
            </SubTitle>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Informations complémentaires */}

          <div className={cardCls}>
            <SubTitle>
              Informations complémentaires
            </SubTitle>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center justify-between mb-1.5">
                  <span className={labelCls}>
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
                      className="text-[10px] text-slate-400 hover:text-slate-700"
                    >
                      Effacer
                    </button>
                  )}
                </label>

                <input
                  type="date"
                  className={inputCls}
                  value={
                    data.birthDate || ''
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
                <label className="flex items-center gap-2 h-[42px] px-3 rounded-lg border border-slate-300 bg-white cursor-pointer hover:bg-slate-50 transition w-full">
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
            </div>
          </div>

          {/* Réseaux */}

          <div className={cardCls}>
            <SubTitle>
              Réseaux professionnels
            </SubTitle>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`${labelCls} flex items-center gap-1.5`}>
                  <Linkedin className="w-3.5 h-3.5" />
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
                <label className={`${labelCls} flex items-center gap-1.5`}>
                  <Github className="w-3.5 h-3.5" />
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
          </div>
        </div>
      </section>

      {/* =====================================================
          PROFIL
      ====================================================== */}

      <section className={sectionCls}>
        <SectionEditorTitle
          sectionId="summary"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
        />

        <div className={cardCls}>
          <ResizableTextarea
            value={data.summary}
            onChange={(e) =>
              update(
                'summary',
                e.target.value
              )
            }
            placeholder="Présentez votre profil, vos compétences et vos objectifs..."
            minHeight={110}
          />
        </div>
      </section>

      {/* =====================================================
          COMPÉTENCES TECHNIQUES
      ====================================================== */}

      <section className={sectionCls}>
        <SectionEditorTitle
          sectionId="technicalSkills"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
          action={
            <button
              type="button"
              onClick={
                technicalSkillOps.addCategory
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                Ajouter une catégorie
              </span>
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={(event) =>
            handleSortEnd(
              event,
              'technicalSkills'
            )
          }
        >
          <SortableContext
            items={data.technicalSkills.map(
              (category) =>
                category.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="space-y-3">
              {data.technicalSkills.map(
                (category) => (
                  <SortableItem
                    key={category.id}
                    id={category.id}
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
                        className={`relative rounded-xl border border-slate-200 bg-white p-4 transition ${
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
                            className="cursor-grab active:cursor-grabbing touch-none shrink-0 p-1.5 rounded-lg hover:bg-slate-100"
                            title="Déplacer la catégorie"
                            aria-label="Déplacer la catégorie"
                          >
                            <GripVertical
                              className={`w-4 h-4 ${
                                isDragging
                                  ? 'text-slate-900'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>

                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />

                          <input
                            className={`${inputCls} font-semibold`}
                            value={
                              category.name
                            }
                            onChange={(e) =>
                              technicalSkillOps.renameCategory(
                                category.id,
                                e.target.value
                              )
                            }
                            placeholder="Nom de la catégorie"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              technicalSkillOps.removeCategory(
                                category.id
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-red-500 transition shrink-0"
                            aria-label="Supprimer la catégorie"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-3 pl-9">
                          <div className="flex flex-wrap gap-1.5">
                            {category.items.map(
                              (
                                item,
                                index
                              ) => (
                                <span
                                  key={`${category.id}-${index}`}
                                  className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 pl-2.5 pr-1 py-1 text-xs text-slate-700"
                                >
                                  {item}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      technicalSkillOps.removeItem(
                                        category.id,
                                        index
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

                              technicalSkillOps.addItem(
                                category.id,
                                input.value
                              );

                              input.value =
                                '';
                            }}
                            className="flex gap-2 mt-3"
                          >
                            <input
                              name="item"
                              className={inputCls}
                              placeholder="Ajouter une compétence, ex. Linux"
                            />

                            <button
                              type="submit"
                              className="shrink-0 rounded-lg bg-slate-900 px-3 text-white hover:bg-slate-700 transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </SortableItem>
                )
              )}

              {data.technicalSkills.length ===
                0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <p className="text-sm text-slate-400">
                    Aucune catégorie de compétences.
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Cliquez sur « Ajouter une catégorie » pour commencer.
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* =====================================================
          COMPÉTENCES GÉNÉRALES
      ====================================================== */}

      <section className={sectionCls}>
        <SectionEditorTitle
          sectionId="softSkills"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
        />

        <div className={cardCls}>
          <div className="flex flex-wrap gap-2">
            {data.softSkills.map(
              (
                skill,
                index
              ) => (
                <span
                  key={`${skill}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 pl-3 pr-1.5 py-1.5 text-xs font-medium text-slate-700"
                >
                  {skill}

                  <button
                    type="button"
                    onClick={() =>
                      removeSoftSkill(
                        index
                      )
                    }
                    className="rounded-full p-0.5 hover:bg-slate-200 text-slate-400"
                    aria-label={`Supprimer ${skill}`}
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
                    'softSkill'
                  ) as HTMLInputElement;

              addSoftSkill(
                input.value
              );

              input.value = '';
            }}
            className="flex gap-2 mt-4 pt-4 border-t border-slate-200"
          >
            <input
              name="softSkill"
              className={inputCls}
              placeholder="Ajouter une compétence, ex. Autonomie"
            />

            <button
              type="submit"
              className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />

              <span className="hidden sm:inline">
                Ajouter
              </span>
            </button>
          </form>
        </div>
      </section>

      {/* =====================================================
          EXPÉRIENCES
      ====================================================== */}

      <section className={sectionCls}>
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
                    description: '',
                  } as Experience
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
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
                        className={`relative rounded-xl border border-slate-200 bg-white p-4 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="mt-2 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1.5 rounded-lg hover:bg-slate-100"
                            title="Déplacer l'expérience"
                            aria-label="Déplacer l'expérience"
                          >
                            <GripVertical
                              className="w-4 h-4 text-slate-300"
                            />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className={labelCls}>
                                  Poste
                                </label>

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
                                  placeholder="Poste occupé"
                                />
                              </div>

                              <div>
                                <label className={labelCls}>
                                  Entreprise
                                </label>

                                <input
                                  className={inputCls}
                                  value={
                                    exp.company
                                  }
                                  onChange={(e) =>
                                    arrayOps.patch(
                                      'experiences',
                                      exp.id,
                                      'company',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nom de l'entreprise"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className={labelCls}>
                                  Période
                                </label>

                                <input
                                  className={inputCls}
                                  value={
                                    exp.period
                                  }
                                  onChange={(e) =>
                                    arrayOps.patch(
                                      'experiences',
                                      exp.id,
                                      'period',
                                      e.target.value
                                    )
                                  }
                                  placeholder="2021 — Présent"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className={labelCls}>
                                  Missions et résultats
                                </label>

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
                                  placeholder="Décrivez vos missions, réalisations et résultats..."
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              arrayOps.remove(
                                'experiences',
                                exp.id
                              )
                            }
                            className="mt-2 p-1 text-slate-400 hover:text-red-500 transition shrink-0"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      <section className={sectionCls}>
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
                    description: '',
                  } as Education
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
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
                        className={`relative rounded-xl border border-slate-200 bg-white p-4 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="mt-2 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1.5 rounded-lg hover:bg-slate-100"
                            title="Déplacer la formation"
                            aria-label="Déplacer la formation"
                          >
                            <GripVertical className="w-4 h-4 text-slate-300" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className={labelCls}>
                                  Diplôme / Formation
                                </label>

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
                              </div>

                              <div>
                                <label className={labelCls}>
                                  Établissement
                                </label>

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

                              <div className="sm:col-span-2">
                                <label className={labelCls}>
                                  Période
                                </label>

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
                                  placeholder="2023 — 2025"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className={labelCls}>
                                  Description
                                </label>

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
                                  placeholder="Description complémentaire (optionnelle)"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              arrayOps.remove(
                                'education',
                                ed.id
                              )
                            }
                            className="mt-2 p-1 text-slate-400 hover:text-red-500 transition shrink-0"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      <section className={sectionCls}>
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
                    organization: '',
                    date: '',
                    url: '',
                  } as Certification
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
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
                (certification) => (
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
                        className={`relative rounded-xl border border-slate-200 bg-white p-4 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="mt-2 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1.5 rounded-lg hover:bg-slate-100"
                            title="Déplacer la certification"
                            aria-label="Déplacer la certification"
                          >
                            <GripVertical className="w-4 h-4 text-slate-300" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className={labelCls}>
                                  Certification
                                </label>

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
                              </div>

                              <div>
                                <label className={labelCls}>
                                  Organisme
                                </label>

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

                              <div>
                                <label className={labelCls}>
                                  Date / Année
                                </label>

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
                                  placeholder="2026"
                                />
                              </div>

                              <div>
                                <label className={labelCls}>
                                  URL
                                </label>

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
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              arrayOps.remove(
                                'certifications',
                                certification.id
                              )
                            }
                            className="mt-2 p-1 text-slate-400 hover:text-red-500 transition shrink-0"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </SortableItem>
                )
              )}

              {data.certifications.length ===
                0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <p className="text-sm text-slate-400">
                    Aucune certification.
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Cliquez sur « Ajouter » pour commencer.
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* =====================================================
          LANGUES
      ====================================================== */}

      <section className={sectionCls}>
        <SectionEditorTitle
          sectionId="languages"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
          action={
            <button
              type="button"
              onClick={() =>
                arrayOps.add(
                  'languages',
                  {
                    id: uid(),
                    name: '',
                    level: '',
                  } as Language
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={(event) =>
            handleSortEnd(
              event,
              'languages'
            )
          }
        >
          <SortableContext
            items={data.languages.map(
              (language) =>
                language.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="space-y-3">
              {data.languages.map(
                (language) => (
                  <SortableItem
                    key={language.id}
                    id={language.id}
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
                        className={`relative rounded-xl border border-slate-200 bg-white p-4 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="mt-2 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1.5 rounded-lg hover:bg-slate-100"
                            title="Déplacer la langue"
                            aria-label="Déplacer la langue"
                          >
                            <GripVertical className="w-4 h-4 text-slate-300" />
                          </button>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>
                                Langue
                              </label>

                              <input
                                className={inputCls}
                                value={
                                  language.name
                                }
                                onChange={(e) =>
                                  arrayOps.patch(
                                    'languages',
                                    language.id,
                                    'name',
                                    e.target.value
                                  )
                                }
                                placeholder="Français"
                              />
                            </div>

                            <div>
                              <label className={labelCls}>
                                Niveau
                              </label>

                              <input
                                className={inputCls}
                                value={
                                  language.level
                                }
                                onChange={(e) =>
                                  arrayOps.patch(
                                    'languages',
                                    language.id,
                                    'level',
                                    e.target.value
                                  )
                                }
                                placeholder="Courant, B2, C1..."
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              arrayOps.remove(
                                'languages',
                                language.id
                              )
                            }
                            className="mt-2 p-1 text-slate-400 hover:text-red-500 transition shrink-0"
                            aria-label="Supprimer la langue"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </SortableItem>
                )
              )}

              {data.languages.length ===
                0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <p className="text-sm text-slate-400">
                    Aucune langue.
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Cliquez sur « Ajouter » pour commencer.
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* =====================================================
          PROJETS
      ====================================================== */}

      <section className={sectionCls}>
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
                    description: '',
                  } as Project
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
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
                    key={project.id}
                    id={project.id}
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
                        className={`relative rounded-xl border border-slate-200 bg-white p-4 transition ${
                          isDragging
                            ? 'opacity-60 shadow-xl scale-[1.01] z-50'
                            : 'hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            {...attributes}
                            {...listeners}
                            className="mt-2 cursor-grab active:cursor-grabbing touch-none shrink-0 p-1.5 rounded-lg hover:bg-slate-100"
                            title="Déplacer le projet"
                            aria-label="Déplacer le projet"
                          >
                            <GripVertical className="w-4 h-4 text-slate-300" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className={labelCls}>
                                  Nom du projet
                                </label>

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
                              </div>

                              <div>
                                <label className={labelCls}>
                                  URL
                                </label>

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
                                  placeholder="https://..."
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className={labelCls}>
                                  Description
                                </label>

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
                                  placeholder="Décrivez brièvement le projet..."
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              arrayOps.remove(
                                'projects',
                                project.id
                              )
                            }
                            className="mt-2 p-1 text-slate-400 hover:text-red-500 transition shrink-0"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      <section className={sectionCls}>
        <SectionEditorTitle
          sectionId="interests"
          data={data}
          updateSectionTitle={
            updateSectionTitle
          }
        />

        <div className={cardCls}>
          <div className="flex flex-wrap gap-2">
            {data.interests.map(
              (
                interest,
                index
              ) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 pl-3 pr-1.5 py-1.5 text-xs font-medium text-slate-700"
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
                    className="rounded-full p-0.5 hover:bg-slate-200 transition text-slate-500"
                    aria-label={`Supprimer ${interest}`}
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
            className="flex gap-2 mt-4 pt-4 border-t border-slate-200"
          >
            <input
              name="interest"
              className={inputCls}
              placeholder="Ajouter un centre d'intérêt, ex. Photographie"
            />

            <button
              type="submit"
              className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />

              <span className="hidden sm:inline">
                Ajouter
              </span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}