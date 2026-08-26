import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  CalendarDays,
  Car,
} from 'lucide-react';

import {
  useDroppable,
  useDndContext,
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type {
  CVData,
  ThemeColors,
  CVSectionId,
  CVSectionColumn,
} from '@/types/types';

import {
  DEFAULT_SECTION_TITLES,
} from '@/types/types';

import SortableSection from '@/components/SortableSection';

interface Props {
  data: CVData;
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
  };
  fontScale: number;
  captureMode?: boolean;
}

/**
 * =========================================================
 * ORDRE PAR DÉFAUT
 * =========================================================
 */

const DEFAULT_SECTION_ORDER: CVSectionId[] = [
  'summary',
  'experiences',
  'education',
  'skills',
  'languages',
  'projects',
  'interests',
  'certifications',
];

/**
 * =========================================================
 * COLONNES PAR DÉFAUT
 * =========================================================
 */

const DEFAULT_SECTION_COLUMNS: Record<
  CVSectionId,
  CVSectionColumn
> = {
  summary: 'left',
  skills: 'left',
  languages: 'left',
  interests: 'left',
  certifications: 'left',

  experiences: 'right',
  education: 'right',
  projects: 'right',
};

/**
 * =========================================================
 * IDS DES ZONES DE FIN
 * =========================================================
 */

const SECTION_COLUMN_BOTTOM_IDS = {
  left: 'section-column-bottom-left',
  right: 'section-column-bottom-right',
} as const;

/**
 * =========================================================
 * COLONNE DROPPABLE
 * =========================================================
 */

function EditorialColumn({
  id,
  children,
}: {
  id:
    | 'section-column-left'
    | 'section-column-right';

  children: React.ReactNode;
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id,
  });

  const { active } =
    useDndContext();

  const isDragging =
    Boolean(active);

  const bottomId =
    id === 'section-column-left'
      ? SECTION_COLUMN_BOTTOM_IDS.left
      : SECTION_COLUMN_BOTTOM_IDS.right;

  const {
    setNodeRef:
      setBottomNodeRef,
    isOver:
      isBottomOver,
  } = useDroppable({
    id: bottomId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative
        min-w-0
        min-h-full
        w-full
        rounded-sm
        transition

        ${
          isOver
            ? 'bg-slate-50/40'
            : ''
        }
      `}
    >
      <div className="relative">
        {children}
      </div>

      {isDragging && (
        <div
          ref={setBottomNodeRef}
          className="
            relative
            w-full
            h-5
            mt-1
          "
        >
          {isBottomOver && (
            <div
              className="
                pointer-events-none
                absolute
                left-0
                right-0
                top-1/2
                -translate-y-1/2
                z-[100]
                h-[3px]
                rounded-full
                bg-slate-900
                shadow-sm
              "
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * =========================================================
 * AGE
 * =========================================================
 */

function calculateAge(
  birthDate?: string
): number | null {
  if (!birthDate) {
    return null;
  }

  const birth =
    new Date(birthDate);

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return null;
  }

  const today =
    new Date();

  let age =
    today.getFullYear() -
    birth.getFullYear();

  const hasHadBirthday =
    today.getMonth() >
      birth.getMonth() ||
    (
      today.getMonth() ===
        birth.getMonth() &&
      today.getDate() >=
        birth.getDate()
    );

  if (!hasHadBirthday) {
    age--;
  }

  return age >= 0
    ? age
    : null;
}

/**
 * =========================================================
 * TITRE DE SECTION
 * =========================================================
 */

function getSectionTitle(
  data: CVData,
  sectionId: CVSectionId
): string {
  return (
    data.sectionTitles?.[
      sectionId
    ] ??
    DEFAULT_SECTION_TITLES[
      sectionId
    ]
  );
}

/**
 * =========================================================
 * TEMPLATE
 * =========================================================
 */

export default function EditorialTemplate({
  data,
  colors,
  fonts,
  fontScale,
  captureMode = false,
}: Props) {
  const fs = (
    n: number
  ) =>
    `${n * fontScale}px`;

  const hasSkills =
    data.skills.some(
      (c) =>
        c.items.length > 0
    );

  const hasLanguages =
    data.languages?.some(
      (language) =>
        language.name.trim() ||
        language.level.trim()
    ) ?? false;

  const age =
    calculateAge(
      data.birthDate
    );

  const contactItems = [
    {
      value: data.email,
      icon: Mail,
      href: data.email
        ? `mailto:${data.email}`
        : undefined,
    },

    {
      value: data.phone,
      icon: Phone,
      href: data.phone
        ? `tel:${data.phone}`
        : undefined,
    },

    {
      value: data.location,
      icon: MapPin,
    },

    {
      value: data.website,
      icon: Globe,
      href: data.website
        ? data.website.startsWith(
            'http'
          )
          ? data.website
          : `https://${data.website}`
        : undefined,
    },

    {
      value: data.linkedin,
      icon: Linkedin,
      href: data.linkedin
        ? data.linkedin.startsWith(
            'http'
          )
          ? data.linkedin
          : `https://${data.linkedin}`
        : undefined,
    },

    {
      value: data.github,
      icon: Github,
      href: data.github
        ? data.github.startsWith(
            'http'
          )
          ? data.github
          : `https://${data.github}`
        : undefined,
    },
  ];

  /**
   * =========================================================
   * ORDRE / COLONNES
   * =========================================================
   */

  const sectionOrder: CVSectionId[] =
    data.sectionOrder?.length
      ? data.sectionOrder
      : DEFAULT_SECTION_ORDER;

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

  const leftOrder =
    sectionOrder.filter(
      (sectionId) =>
        getSectionColumn(
          sectionId
        ) === 'left'
    );

  const rightOrder =
    sectionOrder.filter(
      (sectionId) =>
        getSectionColumn(
          sectionId
        ) === 'right'
    );

  /**
   * =========================================================
   * RENDER SECTION
   * =========================================================
   */

  const renderSection = (
    sectionId: CVSectionId
  ) => {
    const sectionTitle =
      getSectionTitle(
        data,
        sectionId
      );

    switch (sectionId) {
      /**
       * =====================================================
       * PROFIL
       * =====================================================
       */

      case 'summary':
        if (!data.summary) {
          return null;
        }

        return (
          <SortableSection
            key="summary"
            id="summary"
            enabled={!captureMode}
          >
            <section>
              <SectionTitle
                fonts={fonts}
                colors={colors}
                fontSize={fs(13)}
              >
                {sectionTitle}
              </SectionTitle>

              <p
                style={{
                  fontSize:
                    fs(11.5),
                  color:
                    colors.muted,
                  whiteSpace:
                    'pre-line',
                }}
                className="
                  leading-relaxed
                "
              >
                {data.summary}
              </p>
            </section>
          </SortableSection>
        );

      /**
       * =====================================================
       * COMPÉTENCES
       * =====================================================
       */

      case 'skills':
        if (!hasSkills) {
          return null;
        }

        return (
          <SortableSection
            key="skills"
            id="skills"
            enabled={!captureMode}
          >
            <section>
              <SectionTitle
                fonts={fonts}
                colors={colors}
                fontSize={fs(13)}
              >
                {sectionTitle}
              </SectionTitle>

              <div className="space-y-3">
                {data.skills.map(
                  (category) =>
                    category.items.length >
                      0 ? (
                      <div
                        key={
                          category.id
                        }
                      >
                        <h3
                          style={{
                            color:
                              colors.primary,
                            fontSize:
                              fs(11),
                          }}
                          className="
                            font-bold
                            mb-1
                          "
                        >
                          {
                            category.name
                          }
                        </h3>

                        <p
                          style={{
                            fontSize:
                              fs(10.5),
                            color:
                              colors.muted,
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            leading-relaxed
                          "
                        >
                          {category.items.join(
                            ' • '
                          )}
                        </p>
                      </div>
                    ) : null
                )}
              </div>
            </section>
          </SortableSection>
        );

      /**
       * =====================================================
       * LANGUES
       * =====================================================
       */

      case 'languages':
        if (!hasLanguages) {
          return null;
        }

        return (
          <SortableSection
            key="languages"
            id="languages"
            enabled={!captureMode}
          >
            <section>
              <SectionTitle
                fonts={fonts}
                colors={colors}
                fontSize={fs(13)}
              >
                {sectionTitle}
              </SectionTitle>

              <div className="space-y-2">
                {data.languages
                  .filter(
                    (language) =>
                      language.name.trim() ||
                      language.level.trim()
                  )
                  .map(
                    (
                      language
                    ) => (
                      <div
                        key={
                          language.id
                        }
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >
                        <span
                          style={{
                            color:
                              colors.primary,
                            fontSize:
                              fs(10.5),
                          }}
                          className="
                            font-semibold
                          "
                        >
                          {
                            language.name
                          }
                        </span>

                        {language.level && (
                          <span
                            style={{
                              color:
                                colors.muted,
                              fontSize:
                                fs(10),
                            }}
                            className="
                              shrink-0
                              text-right
                            "
                          >
                            {
                              language.level
                            }
                          </span>
                        )}
                      </div>
                    )
                  )}
              </div>
            </section>
          </SortableSection>
        );

      /**
       * =====================================================
       * INTÉRÊTS
       * =====================================================
       */

      case 'interests':
        if (
          data.interests.length ===
          0
        ) {
          return null;
        }

        return (
          <SortableSection
            key="interests"
            id="interests"
            enabled={!captureMode}
          >
            <section>
              <SectionTitle
                fonts={fonts}
                colors={colors}
                fontSize={fs(13)}
              >
                {sectionTitle}
              </SectionTitle>

              <p
                style={{
                  fontSize:
                    fs(10.5),
                  color:
                    colors.muted,
                  whiteSpace:
                    'pre-line',
                }}
                className="
                  leading-relaxed
                "
              >
                {data.interests.join(
                  ' • '
                )}
              </p>
            </section>
          </SortableSection>
        );

      /**
       * =====================================================
       * EXPÉRIENCES
       * =====================================================
       */

      case 'experiences':
        if (
          data.experiences.length ===
          0
        ) {
          return null;
        }

        return (
          <SortableSection
            key="experiences"
            id="experiences"
            enabled={!captureMode}
          >
            <section>
              <SectionTitle
                fonts={fonts}
                colors={colors}
                fontSize={fs(13)}
              >
                {sectionTitle}
              </SectionTitle>

              <div className="space-y-5">
                {data.experiences.map(
                  (exp) => (
                    <article
                      key={
                        exp.id
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3
                            style={{
                              fontFamily:
                                fonts.heading,
                              color:
                                colors.accent,
                              fontSize:
                                fs(11),
                            }}
                            className="
                              font-bold
                            "
                          >
                            {
                              exp.role
                            }
                          </h3>

                          <p
                            style={{
                              color:
                                colors.secondary,
                              fontSize:
                                fs(11.5),
                            }}
                            className="
                              font-medium
                              mt-0.5
                            "
                          >
                            {
                              exp.company
                            }
                          </p>
                        </div>

                        <span
                          style={{
                            color:
                              colors.muted,
                            fontSize:
                              fs(10),
                          }}
                          className="
                            shrink-0
                            pt-1
                          "
                        >
                          {
                            exp.period
                          }
                        </span>
                      </div>

                      {exp.description && (
                        <p
                          style={{
                            fontSize:
                              fs(11),
                            color:
                              colors.muted,
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            leading-relaxed
                            mt-2
                          "
                        >
                          {
                            exp.description
                          }
                        </p>
                      )}
                    </article>
                  )
                )}
              </div>
            </section>
          </SortableSection>
        );

      /**
       * =====================================================
       * FORMATION
       * =====================================================
       */

      case 'education':
        if (
          data.education.length ===
          0
        ) {
          return null;
        }

        return (
          <SortableSection
            key="education"
            id="education"
            enabled={!captureMode}
          >
            <section>
              <SectionTitle
                fonts={fonts}
                colors={colors}
                fontSize={fs(13)}
              >
                {sectionTitle}
              </SectionTitle>

              <div className="space-y-4">
                {data.education.map(
                  (ed) => (
                    <article
                      key={
                        ed.id
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3
                            style={{
                              fontFamily:
                                fonts.heading,
                              color:
                                colors.accent,
                              fontSize:
                                fs(11),
                            }}
                            className="
                              font-bold
                            "
                          >
                            {
                              ed.degree
                            }
                          </h3>

                          <p
                            style={{
                              color:
                                colors.secondary,
                              fontSize:
                                fs(11),
                            }}
                            className="
                              font-medium
                              mt-0.5
                            "
                          >
                            {
                              ed.school
                            }
                          </p>
                        </div>

                        <span
                          style={{
                            color:
                              colors.muted,
                            fontSize:
                              fs(10),
                          }}
                          className="
                            shrink-0
                          "
                        >
                          {
                            ed.period
                          }
                        </span>
                      </div>

                      {ed.description && (
                        <p
                          style={{
                            fontSize:
                              fs(11),
                            color:
                              colors.muted,
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            leading-relaxed
                            mt-1.5
                          "
                        >
                          {
                            ed.description
                          }
                        </p>
                      )}
                    </article>
                  )
                )}
              </div>
            </section>
          </SortableSection>
        );

      /**
       * =====================================================
       * PROJETS
       * =====================================================
       */

      case 'projects':
        if (
          data.projects.length ===
          0
        ) {
          return null;
        }

        return (
          <SortableSection
            key="projects"
            id="projects"
            enabled={!captureMode}
          >
            <section>
              <SectionTitle
                fonts={fonts}
                colors={colors}
                fontSize={fs(13)}
              >
                {sectionTitle}
              </SectionTitle>

              <div className="space-y-3">
                {data.projects.map(
                  (project) => (
                    <article
                      key={
                        project.id
                      }
                    >
                      <h3
                        style={{
                          color:
                            colors.primary,
                          fontSize:
                            fs(13),
                        }}
                        className="
                          font-bold
                        "
                      >
                        {
                          project.name
                        }
                      </h3>

                      {project.url && (
                        <a
                          href={
                            project.url.startsWith(
                              'http'
                            )
                              ? project.url
                              : `https://${project.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color:
                              colors.accent,
                            fontSize:
                              fs(9.5),
                            textDecoration:
                              'underline',
                          }}
                          className="
                            inline-block
                            mt-0.5
                          "
                        >
                          {
                            project.url
                          }
                        </a>
                      )}

                      {project.description && (
                        <p
                          style={{
                            color:
                              colors.muted,
                            fontSize:
                              fs(10.5),
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            leading-relaxed
                            mt-1
                          "
                        >
                          {
                            project.description
                          }
                        </p>
                      )}
                    </article>
                  )
                )}
              </div>
            </section>
          </SortableSection>
        );

      /**
       * =====================================================
       * CERTIFICATIONS
       * =====================================================
       */

      case 'certifications':
        if (
          !data.certifications?.length
        ) {
          return null;
        }

        return (
          <SortableSection
            key="certifications"
            id="certifications"
            enabled={!captureMode}
          >
            <section>
              <SectionTitle
                fonts={fonts}
                colors={colors}
                fontSize={fs(13)}
              >
                {sectionTitle}
              </SectionTitle>

              <div
                style={{
                  fontSize:
                    fs(10.5),
                  color:
                    colors.muted,
                }}
                className="
                  leading-relaxed
                  space-y-0.5
                "
              >
                {data.certifications.map(
                  (certification) => {
                    const certificationUrl =
                      certification.url
                        ? certification.url.startsWith(
                            'http://'
                          ) ||
                          certification.url.startsWith(
                            'https://'
                          )
                          ? certification.url
                          : `https://${certification.url}`
                        : null;

                    return (
                      <div
                        key={
                          certification.id
                        }
                      >
                        {certificationUrl ? (
                          <a
                            href={
                              certificationUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color:
                                colors.primary,
                              textDecoration:
                                'underline',
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              certification.name
                            }
                          </a>
                        ) : (
                          <span
                            style={{
                              color:
                                colors.primary,
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              certification.name
                            }
                          </span>
                        )}

                        {certification.organization && (
                          <>
                            {' — '}
                            {
                              certification.organization
                            }
                          </>
                        )}

                        {certification.date && (
                          <>
                            {' — '}
                            {
                              certification.date
                            }
                          </>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          </SortableSection>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        fontFamily:
          fonts.body,
        color:
          colors.text,
        fontSize:
          fs(14),
      }}
      className="
        w-full
        h-full
        px-11
        py-10
      "
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          grid
          grid-cols-[1fr_auto]
          gap-8
          pb-7
          border-b
        "
        style={{
          borderColor:
            colors.border,
        }}
      >
        <div>
          <div
            style={{
              color:
                colors.accent,
              fontSize:
                fs(11),
            }}
            className="
              font-bold
              uppercase
              tracking-[0.3em]
              mb-3
            "
          >
            Curriculum Vitae
          </div>

          <h1
            style={{
              fontFamily:
                fonts.heading,
              fontSize:
                fs(42),
              color:
                colors.primary,
            }}
            className="
              font-bold
              leading-none
              tracking-tight
            "
          >
            {data.name}
          </h1>

          <p
            style={{
              fontSize:
                fs(17),
              color:
                colors.secondary,
            }}
            className="
              mt-3
              font-medium
            "
          >
            {data.title}
          </p>

          <div
            style={{
              fontSize:
                fs(10.5),
              color:
                colors.muted,
            }}
            className="
              flex
              flex-wrap
              gap-x-4
              gap-y-1.5
              mt-5
            "
          >
            {contactItems.map(
              ({
                value,
                icon: Icon,
                href,
              }, index) =>
                value ? (
                  <span
                    key={index}
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <Icon className="w-3 h-3" />

                    {href ? (
                      <a
                        href={href}
                        target={
                          href.startsWith(
                            'http'
                          )
                            ? '_blank'
                            : undefined
                        }
                        rel={
                          href.startsWith(
                            'http'
                          )
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        style={{
                          color:
                            'inherit',
                          textDecoration:
                            'underline',
                        }}
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </span>
                ) : null
            )}

            {age !== null && (
              <span
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <CalendarDays className="w-3 h-3" />

                {age} ans
              </span>
            )}

            {data.hasDrivingLicense && (
              <span
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <Car className="w-3 h-3" />

                Permis B
              </span>
            )}
          </div>
        </div>

        {data.photo && (
          <img
            src={data.photo}
            alt={data.name}
            crossOrigin="anonymous"
            className="
              object-cover
              rounded-xl
              shrink-0
            "
            style={{
              width: `${
                112 *
                (data.photoScale ??
                  1)
              }px`,
              height: `${
                112 *
                (data.photoScale ??
                  1)
              }px`,
              border: `3px solid ${colors.primary}`,
            }}
          />
        )}
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-[0.72fr_1.28fr]
          gap-9
          mt-8
        "
      >
        {/* ===================================================
            LEFT COLUMN
        ==================================================== */}

        <EditorialColumn
          id="section-column-left"
        >
          <SortableContext
            items={
              leftOrder
            }
            strategy={
              verticalListSortingStrategy
            }
          >
            <aside className="space-y-7">
              {leftOrder.map(
                (sectionId) =>
                  renderSection(
                    sectionId
                  )
              )}
            </aside>
          </SortableContext>
        </EditorialColumn>

        {/* ===================================================
            RIGHT COLUMN
        ==================================================== */}

        <EditorialColumn
          id="section-column-right"
        >
          <SortableContext
            items={
              rightOrder
            }
            strategy={
              verticalListSortingStrategy
            }
          >
            <main className="space-y-7">
              {rightOrder.map(
                (sectionId) =>
                  renderSection(
                    sectionId
                  )
              )}
            </main>
          </SortableContext>
        </EditorialColumn>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * TITRE DE SECTION
 * =========================================================
 */

function SectionTitle({
  children,
  fonts,
  colors,
  fontSize,
}: {
  children: React.ReactNode;
  fonts: {
    heading: string;
    body: string;
  };
  colors: ThemeColors;
  fontSize: string;
}) {
  return (
    <h2
      style={{
        fontFamily:
          fonts.heading,
        color:
          colors.primary,
        fontSize,
      }}
      className="
        font-bold
        uppercase
        tracking-[0.16em]
        pb-2
        mb-4
        border-b
      "
    >
      {children}
    </h2>
  );
}