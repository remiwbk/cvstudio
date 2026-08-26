import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
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

function ExecutiveColumn({
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
    id ===
    'section-column-left'
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
 * CALCUL ÂGE
 * =========================================================
 */

function calculateAge(
  birthDate: string | undefined
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

export default function ExecutiveTemplate({
  data,
  colors,
  fonts,
  fontScale,
  captureMode = false,
}: Props) {
  const fs = (n: number) =>
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
              <SectionHeader
                title={sectionTitle}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

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
              <SectionHeader
                title={sectionTitle}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-4">
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
                              colors.secondary,
                            fontSize:
                              fs(10),
                          }}
                          className="
                            font-semibold
                          "
                        >
                          {
                            category.name
                          }
                        </h3>

                        <p
                          style={{
                            color:
                              colors.muted,
                            fontSize:
                              fs(9.5),
                          }}
                          className="
                            leading-relaxed
                            mt-1
                          "
                        >
                          {category.items.join(
                            ' · '
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
              <SectionHeader
                title={sectionTitle}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-2">
                {data.languages
                  .filter(
                    (language) =>
                      language.name.trim() ||
                      language.level.trim()
                  )
                  .map(
                    (language) => (
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
                              fs(10),
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
                                fs(9.5),
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
              <SectionHeader
                title={sectionTitle}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <p
                style={{
                  fontSize:
                    fs(9.5),
                  color:
                    colors.muted,
                }}
                className="
                  leading-relaxed
                "
              >
                {data.interests.join(
                  ' · '
                )}
              </p>
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
              <SectionHeader
                title={sectionTitle}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div
                className="
                  space-y-1
                  leading-relaxed
                "
                style={{
                  fontSize:
                    fs(9.5),
                }}
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
                        <span
                          style={{
                            color:
                              colors.accent,
                            fontWeight:
                              700,
                          }}
                        >
                          {
                            certification.name
                          }
                        </span>

                        {certification.organization && (
                          <>
                            {' — '}

                            <span
                              style={{
                                color:
                                  colors.secondary,
                              }}
                            >
                              {
                                certification.organization
                              }
                            </span>
                          </>
                        )}

                        {certification.date && (
                          <>
                            {' — '}

                            <span
                              style={{
                                color:
                                  colors.muted,
                              }}
                            >
                              {
                                certification.date
                              }
                            </span>
                          </>
                        )}

                        {certificationUrl && (
                          <>
                            {' — '}

                            <a
                              href={
                                certificationUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color:
                                  colors.accent,
                                textDecoration:
                                  'underline',
                              }}
                            >
                              Voir
                            </a>
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
              <SectionHeader
                title={sectionTitle}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-5">
                {data.experiences.map(
                  (exp) => (
                    <article
                      key={
                        exp.id
                      }
                    >
                      <div className="flex justify-between gap-5">
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
                                fs(10.5),
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
                              fs(9.5),
                          }}
                          className="
                            shrink-0
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
                            color:
                              colors.muted,
                            fontSize:
                              fs(10.5),
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
              <SectionHeader
                title={sectionTitle}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-4">
                {data.education.map(
                  (ed) => (
                    <article
                      key={
                        ed.id
                      }
                    >
                      <div className="flex justify-between gap-5">
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
                                fs(10),
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
                              fs(9),
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
                            color:
                              colors.muted,
                            fontSize:
                              fs(10),
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
              <SectionHeader
                title={sectionTitle}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-3">
                {data.projects.map(
                  (project) => (
                    <article
                      key={
                        project.id
                      }
                    >
                      <div className="flex items-baseline gap-2">
                        <h3
                          style={{
                            color:
                              colors.primary,
                            fontSize:
                              fs(11.5),
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
                                fs(9),
                              textDecoration:
                                'underline',
                            }}
                          >
                            {
                              project.url
                            }
                          </a>
                        )}
                      </div>

                      {project.description && (
                        <p
                          style={{
                            color:
                              colors.muted,
                            fontSize:
                              fs(9.5),
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

      default:
        return null;
    }
  };

  /**
   * =========================================================
   * RENDER
   * =========================================================
   */

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
        px-12
        py-11
      "
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          flex
          items-end
          justify-between
          gap-8
          pb-7
        "
      >
        <div className="flex-1">
          <p
            style={{
              color:
                colors.accent,
              fontSize:
                fs(10),
            }}
            className="
              uppercase
              tracking-[0.3em]
              font-semibold
              mb-3
            "
          >
            Curriculum Vitae
          </p>

          <h1
            style={{
              fontFamily:
                fonts.heading,
              color:
                colors.primary,
              fontSize:
                fs(40),
            }}
            className="
              font-bold
              leading-none
            "
          >
            {data.name}
          </h1>

          <p
            style={{
              color:
                colors.secondary,
              fontSize:
                fs(17),
            }}
            className="
              mt-3
            "
          >
            {data.title}
          </p>
        </div>

        {data.photo && (
          <img
            src={data.photo}
            alt={data.name}
            crossOrigin="anonymous"
            className="
              object-cover
              rounded-full
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
              border: `4px solid ${colors.surface}`,
            }}
          />
        )}
      </header>

      {/* =====================================================
          CONTACT
      ====================================================== */}

      <div
        className="
          flex
          flex-wrap
          gap-x-5
          gap-y-1.5
          py-3
          border-y
        "
        style={{
          borderColor:
            colors.border,
          color:
            colors.muted,
          fontSize:
            fs(9.5),
        }}
      >
        {data.email && (
          <span className="flex gap-1.5 items-center">
            <Mail className="w-3 h-3" />

            <a
              href={`mailto:${data.email}`}
              style={{
                color:
                  'inherit',
                textDecoration:
                  'underline',
              }}
            >
              {data.email}
            </a>
          </span>
        )}

        {data.phone && (
          <span className="flex gap-1.5 items-center">
            <Phone className="w-3 h-3" />

            <a
              href={`tel:${data.phone}`}
              style={{
                color:
                  'inherit',
                textDecoration:
                  'underline',
              }}
            >
              {data.phone}
            </a>
          </span>
        )}

        {data.location && (
          <span className="flex gap-1.5 items-center">
            <MapPin className="w-3 h-3" />
            {data.location}
          </span>
        )}

        {age !== null && (
          <span>
            {age} ans
          </span>
        )}

        {data.hasDrivingLicense && (
          <span className="flex gap-1.5 items-center">
            <Car className="w-3 h-3" />
            Permis B
          </span>
        )}

        {data.website && (
          <span className="flex gap-1.5 items-center">
            <Globe className="w-3 h-3" />

            <a
              href={
                data.website.startsWith(
                  'http'
                )
                  ? data.website
                  : `https://${data.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color:
                  'inherit',
                textDecoration:
                  'underline',
              }}
            >
              {data.website}
            </a>
          </span>
        )}

        {data.linkedin && (
          <span className="flex gap-1.5 items-center">
            <Linkedin className="w-3 h-3" />

            <a
              href={
                data.linkedin.startsWith(
                  'http'
                )
                  ? data.linkedin
                  : `https://${data.linkedin}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color:
                  'inherit',
                textDecoration:
                  'underline',
              }}
            >
              {data.linkedin}
            </a>
          </span>
        )}

        {data.github && (
          <span className="flex gap-1.5 items-center">
            <Github className="w-3 h-3" />

            <a
              href={
                data.github.startsWith(
                  'http'
                )
                  ? data.github
                  : `https://${data.github}`
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color:
                  'inherit',
                textDecoration:
                  'underline',
              }}
            >
              {data.github}
            </a>
          </span>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-[0.34fr_0.66fr]
          gap-10
          mt-8
        "
      >
        {/* ===================================================
            LEFT COLUMN
        ==================================================== */}

        <ExecutiveColumn
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
            <aside
              className="
                space-y-7
                relative
              "
            >
              {leftOrder.map(
                (sectionId) =>
                  renderSection(
                    sectionId
                  )
              )}
            </aside>
          </SortableContext>
        </ExecutiveColumn>

        {/* ===================================================
            RIGHT COLUMN
        ==================================================== */}

        <ExecutiveColumn
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
            <main
              className="
                space-y-7
                relative
              "
            >
              {rightOrder.map(
                (sectionId) =>
                  renderSection(
                    sectionId
                  )
              )}
            </main>
          </SortableContext>
        </ExecutiveColumn>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * SECTION HEADER
 * =========================================================
 */

function SectionHeader({
  title,
  colors,
  fonts,
  size,
}: {
  title: string;
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
  };
  size: string;
}) {
  return (
    <h2
      style={{
        fontFamily:
          fonts.heading,
        color:
          colors.primary,
        fontSize: size,
      }}
      className="
        font-bold
        uppercase
        tracking-[0.16em]
        pb-2
        mb-4
        border-b-2
      "
    >
      {title}
    </h2>
  );
}