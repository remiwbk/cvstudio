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

function CorporateColumn({
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

  const {
    active,
  } = useDndContext();

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

export default function CorporateTemplate({
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
      (category) =>
        category.items.length > 0
    );

  const age =
    calculateAge(
      data.birthDate
    );

  const sectionOrder: CVSectionId[] =
    data.sectionOrder?.length
      ? data.sectionOrder
      : DEFAULT_SECTION_ORDER;

  /**
   * =========================================================
   * ORDRE / COLONNES
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
              <Title
                text={sectionTitle}
                fonts={fonts}
                colors={colors}
                size={fs(14)}
              />

              <p
                style={{
                  color:
                    colors.muted,
                  fontSize:
                    fs(11),
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
              <Title
                text={sectionTitle}
                fonts={fonts}
                colors={colors}
                size={fs(14)}
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
                              fs(10.5),
                          }}
                          className="
                            font-bold
                            uppercase
                            tracking-wide
                            mb-1.5
                          "
                        >
                          {
                            category.name
                          }
                        </h3>

                        <div className="flex flex-wrap gap-1.5">
                          {category.items.map(
                            (
                              skill,
                              index
                            ) => (
                              <span
                                key={
                                  index
                                }
                                style={{
                                  color:
                                    colors.text,
                                  background:
                                    colors.surface,
                                  borderColor:
                                    colors.border,
                                  fontSize:
                                    fs(9.5),
                                }}
                                className="
                                  px-2
                                  py-1
                                  rounded
                                  border
                                "
                              >
                                {
                                  skill
                                }
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    ) : null
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
          data.interests.length === 0
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
              <Title
                text={sectionTitle}
                fonts={fonts}
                colors={colors}
                size={fs(14)}
              />

              <div className="space-y-1.5">
                {data.interests.map(
                  (
                    interest,
                    index
                  ) => (
                    <div
                      key={index}
                      style={{
                        fontSize:
                          fs(10.5),
                        color:
                          colors.muted,
                      }}
                    >
                      • {interest}
                    </div>
                  )
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
          data.experiences.length === 0
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
              <Title
                text={sectionTitle}
                fonts={fonts}
                colors={colors}
                size={fs(14)}
              />

              <div className="space-y-5">
                {data.experiences.map(
                  (exp) => (
                    <article
                      key={exp.id}
                      className="
                        relative
                        pl-5
                      "
                    >
                      <div
                        className="
                          absolute
                          left-0
                          top-1.5
                          w-2
                          h-2
                          rounded-full
                        "
                        style={{
                          background:
                            colors.accent,
                        }}
                      />

                      <div
                        className="
                          absolute
                          left-[3px]
                          top-4
                          bottom-0
                          w-px
                        "
                        style={{
                          background:
                            colors.border,
                        }}
                      />

                      <div className="flex justify-between gap-4">
                        <div>
                          <h3
                            style={{
                              fontFamily:
                                fonts.heading,
                              color:
                                colors.secondary,
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
                                fs(11),
                            }}
                            className="
                              font-medium
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
                            flex
                            items-center
                            gap-1
                          "
                        >
                          <CalendarDays className="w-3 h-3" />

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
          data.education.length === 0
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
              <Title
                text={sectionTitle}
                fonts={fonts}
                colors={colors}
                size={fs(14)}
              />

              <div className="space-y-4">
                {data.education.map(
                  (ed) => (
                    <article
                      key={ed.id}
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3
                            style={{
                              fontFamily:
                                fonts.heading,
                              color:
                                colors.secondary,
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
                                fs(10.5),
                            }}
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
                              fs(9.5),
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
                              fs(10.5),
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
              <Title
                text={sectionTitle}
                fonts={fonts}
                colors={colors}
                size={fs(14)}
              />

              <div
                style={{
                  fontSize:
                    fs(9.5),
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
                                colors.secondary,
                              fontWeight:
                                700,
                              textDecoration:
                                'underline',
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
                                colors.secondary,
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

      /**
       * =====================================================
       * PROJETS
       * =====================================================
       */

      case 'projects':
        if (
          data.projects.length === 0
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
              <Title
                text={sectionTitle}
                fonts={fonts}
                colors={colors}
                size={fs(14)}
              />

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
                            colors.secondary,
                          fontSize:
                            fs(10.5),
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
                              'http://'
                            ) ||
                            project.url.startsWith(
                              'https://'
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
                            cursor:
                              'pointer',
                          }}
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
      "
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          px-10
          py-7
        "
        style={{
          background:
            colors.primary,
          color: '#fff',
        }}
      >
        <div className="flex items-center gap-6">
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
                  (data.photoScale ?? 1)
                }px`,
                height: `${
                  112 *
                  (data.photoScale ?? 1)
                }px`,
                border: `3px solid ${colors.primary}`,
              }}
            />
          )}

          <div className="flex-1">
            <h1
              style={{
                fontFamily:
                  fonts.heading,
                fontSize:
                  fs(34),
              }}
              className="
                font-bold
                tracking-tight
              "
            >
              {data.name}
            </h1>

            <p
              style={{
                fontSize:
                  fs(16),
              }}
              className="
                mt-1
                opacity-90
              "
            >
              {data.title}
            </p>

            <div
              style={{
                fontSize:
                  fs(9.5),
              }}
              className="
                flex
                flex-wrap
                gap-x-4
                gap-y-1.5
                mt-4
                opacity-85
              "
            >
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="
                    flex
                    items-center
                    gap-1
                  "
                  style={{
                    color: 'inherit',
                  }}
                >
                  <Mail className="w-3 h-3" />
                  {data.email}
                </a>
              )}

              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="
                    flex
                    items-center
                    gap-1
                  "
                  style={{
                    color: 'inherit',
                  }}
                >
                  <Phone className="w-3 h-3" />
                  {data.phone}
                </a>
              )}

              {data.location && (
                <span
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >
                  <MapPin className="w-3 h-3" />
                  {data.location}
                </span>
              )}

              {age !== null && (
                <span
                  className="
                    flex
                    items-center
                    gap-1
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
                    gap-1
                  "
                >
                  <Car className="w-3 h-3" />
                  Permis B
                </span>
              )}

              {data.website && (
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
                  className="
                    flex
                    items-center
                    gap-1
                  "
                  style={{
                    color: 'inherit',
                  }}
                >
                  <Globe className="w-3 h-3" />
                  {data.website}
                </a>
              )}

              {data.linkedin && (
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
                  className="
                    flex
                    items-center
                    gap-1
                  "
                  style={{
                    color: 'inherit',
                  }}
                >
                  <Linkedin className="w-3 h-3" />
                  {data.linkedin}
                </a>
              )}

              {data.github && (
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
                  className="
                    flex
                    items-center
                    gap-1
                  "
                  style={{
                    color: 'inherit',
                  }}
                >
                  <Github className="w-3 h-3" />
                  {data.github}
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          px-10
          py-8
          grid
          grid-cols-[0.7fr_1.3fr]
          gap-9
        "
      >
        {/* ===================================================
            LEFT COLUMN
        ==================================================== */}

        <CorporateColumn
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
        </CorporateColumn>

        {/* ===================================================
            RIGHT COLUMN
        ==================================================== */}

        <CorporateColumn
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
        </CorporateColumn>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * TITRE
 * =========================================================
 */

function Title({
  text,
  fonts,
  colors,
  size,
}: {
  text: string;
  fonts: {
    heading: string;
    body: string;
  };
  colors: ThemeColors;
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
      {text}
    </h2>
  );
}