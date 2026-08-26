import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Calendar,
  Car,
} from 'lucide-react';

import {
  useDroppable,
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  DEFAULT_SECTION_TITLES,
  type CVData,
  type ThemeColors,
  type CVSectionId,
  type CVSectionColumn,
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
  'languages',
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
  projects: 'left',
  certifications: 'left',
  languages: 'left',

  experiences: 'right',
  education: 'right',
};

/**
 * =========================================================
 * TYPES COLONNES
 * =========================================================
 */

type ModernColumnId =
  | 'section-column-left'
  | 'section-column-right';

/**
 * =========================================================
 * COLONNE DROPPABLE
 * =========================================================
 */

function ModernColumn({
  id,
  children,
  className,
}: {
  id: ModernColumnId;
  children: React.ReactNode;
  className?: string;
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id,
  });

  const bottomId =
    id === 'section-column-left'
      ? 'section-column-bottom-left'
      : 'section-column-bottom-right';

  const {
    setNodeRef: setBottomNodeRef,
    isOver: isBottomOver,
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

        ${className ?? ''}
      `}
    >
      {children}

      {!className?.includes('hidden') && (
        <div
          ref={setBottomNodeRef}
          className="
            relative
            w-full
            h-4
            mt-0
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

  const birth = new Date(
    birthDate
  );

  if (
    Number.isNaN(
      birth.getTime()
    )
  ) {
    return null;
  }

  const today = new Date();

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
 * TEMPLATE
 * =========================================================
 */

export default function ModernTemplate({
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

  /**
   * =========================================================
   * ORDRE DES SECTIONS
   * =========================================================
   */

  const sectionOrder: CVSectionId[] =
    data.sectionOrder?.length
      ? data.sectionOrder
      : DEFAULT_SECTION_ORDER;

  /**
   * =========================================================
   * COLONNE D'UNE SECTION
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
   * TITRE DE SECTION
   * =========================================================
   */

  const getSectionTitle = (
    sectionId: CVSectionId
  ): string => {
    return (
      data.sectionTitles?.[
        sectionId
      ] ??
      DEFAULT_SECTION_TITLES[
        sectionId
      ]
    );
  };

  const SectionTitle = ({
    sectionId,
  }: {
    sectionId: CVSectionId;
  }) => (
    <h2
      style={{
        color: colors.primary,
        fontFamily: fonts.heading,
        fontSize: fs(13),
      }}
      className="
        font-bold
        uppercase
        tracking-widest
        mb-3
        pb-2
        border-b-2
      "
    >
      {getSectionTitle(sectionId)}
    </h2>
  );

  /**
   * =========================================================
   * RENDER SECTION
   * =========================================================
   */

  const renderSection = (
    sectionId: CVSectionId
  ) => {
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
                sectionId="summary"
              />

              <p
                style={{
                  fontSize: fs(13),
                  color: colors.muted,
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
                sectionId="skills"
              />

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
                            fontSize:
                              fs(12),
                            color:
                              colors.secondary,
                          }}
                          className="
                            font-semibold
                            mb-1.5
                          "
                        >
                          {
                            category.name
                          }
                        </h3>

                        <div className="
                          flex
                          flex-wrap
                          gap-1.5
                        ">
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
                                  background:
                                    colors.surface,
                                  color:
                                    colors.secondary,
                                  borderColor:
                                    colors.border,
                                  fontSize:
                                    fs(11),
                                }}
                                className="
                                  font-medium
                                  px-2
                                  py-0.5
                                  rounded-full
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
                sectionId="interests"
              />

              <div className="
                flex
                flex-wrap
                gap-1.5
              ">
                {data.interests.map(
                  (
                    interest,
                    index
                  ) => (
                    <span
                      key={index}
                      style={{
                        background:
                          colors.surface,
                        color:
                          colors.secondary,
                        borderColor:
                          colors.border,
                        fontSize:
                          fs(11),
                      }}
                      className="
                        font-medium
                        px-2
                        py-0.5
                        rounded-full
                        border
                      "
                    >
                      {
                        interest
                      }
                    </span>
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
                sectionId="projects"
              />

              <div className="
                space-y-3
              ">
                {data.projects.map(
                  (project) => (
                    <div
                      key={
                        project.id
                      }
                    >
                      <h3
                        style={{
                          fontSize:
                            fs(13),
                          color:
                            colors.text,
                        }}
                        className="
                          font-semibold
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
                            fontSize:
                              fs(11),
                            color:
                              colors.accent,
                            textDecoration:
                              'underline',
                          }}
                          className="
                            inline-block
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
                            fontSize:
                              fs(11),
                            color:
                              colors.muted,
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            mt-1
                            leading-snug
                          "
                        >
                          {
                            project.description
                          }
                        </p>
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
                sectionId="experiences"
              />

              <div className="
                space-y-4
              ">
                {data.experiences.map(
                  (exp) => (
                    <div
                      key={
                        exp.id
                      }
                      className="
                        relative
                        pl-5
                        border-l-2
                      "
                      style={{
                        borderColor:
                          colors.border,
                      }}
                    >
                      <span
                        className="
                          absolute
                          -left-[5px]
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

                      <div className="
                        flex
                        items-baseline
                        justify-between
                        gap-3
                      ">
                        <h3
                          style={{
                            fontSize:
                              fs(15),
                            color:
                              colors.text,
                          }}
                          className="
                            font-semibold
                          "
                        >
                          {
                            exp.role
                          }
                        </h3>

                        <span
                          style={{
                            fontSize:
                              fs(11),
                            color:
                              colors.muted,
                          }}
                          className="
                            flex
                            items-center
                            gap-1
                            shrink-0
                          "
                        >
                          <Calendar className="w-3 h-3" />
                          {
                            exp.period
                          }
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize:
                            fs(13),
                          color:
                            colors.secondary,
                        }}
                        className="
                          font-medium
                        "
                      >
                        {
                          exp.company
                        }
                      </p>

                      {exp.description && (
                        <p
                          style={{
                            fontSize:
                              fs(13),
                            color:
                              colors.muted,
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            mt-1
                            leading-relaxed
                          "
                        >
                          {
                            exp.description
                          }
                        </p>
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
                sectionId="education"
              />

              <div className="
                space-y-3
              ">
                {data.education.map(
                  (education) => (
                    <div
                      key={
                        education.id
                      }
                    >
                      <div className="
                        flex
                        items-baseline
                        justify-between
                        gap-3
                      ">
                        <h3
                          style={{
                            fontSize:
                              fs(15),
                            color:
                              colors.text,
                          }}
                          className="
                            font-semibold
                          "
                        >
                          {
                            education.degree
                          }
                        </h3>

                        <span
                          style={{
                            fontSize:
                              fs(11),
                            color:
                              colors.muted,
                          }}
                          className="
                            shrink-0
                          "
                        >
                          {
                            education.period
                          }
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize:
                            fs(13),
                          color:
                            colors.secondary,
                        }}
                        className="
                          font-medium
                        "
                      >
                        {
                          education.school
                        }
                      </p>

                      {education.description && (
                        <p
                          style={{
                            fontSize:
                              fs(13),
                            color:
                              colors.muted,
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            mt-1
                            leading-relaxed
                          "
                        >
                          {
                            education.description
                          }
                        </p>
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
       * LANGUES
       * =====================================================
       */

      case 'languages':
        if (
          !data.languages?.length
        ) {
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
                sectionId="languages"
              />

              <div className="
                space-y-2
              ">
                {data.languages.map(
                  (language) => (
                    <div
                      key={
                        language.id
                      }
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <span
                        style={{
                          fontSize:
                            fs(12),
                          color:
                            colors.text,
                        }}
                        className="
                          font-semibold
                        "
                      >
                        {
                          language.name
                        }
                      </span>

                      <span
                        style={{
                          fontSize:
                            fs(11),
                          color:
                            colors.muted,
                        }}
                        className="
                          text-right
                        "
                      >
                        {
                          language.level
                        }
                      </span>
                    </div>
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
                sectionId="certifications"
              />

              <div className="
                space-y-1.5
              ">
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
                        style={{
                          fontSize:
                            fs(11),
                          color:
                            colors.muted,
                        }}
                        className="
                          leading-relaxed
                        "
                      >
                        <span
                          style={{
                            color:
                              colors.text,
                          }}
                          className="
                            font-semibold
                          "
                        >
                          {
                            certification.name
                          }
                        </span>

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
      "
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          px-10
          py-8
          flex
          items-center
          justify-between
          gap-6
        "
        style={{
          background:
            `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          color: '#fff',
        }}
      >
        {data.photo && (
          <img
            src={data.photo}
            alt={data.name}
            crossOrigin="anonymous"
            className="
              rounded-full
              object-cover
              border-4
              border-white/30
              shadow-lg
              shrink-0
            "
            style={{
              width: `${
                96 *
                (data.photoScale ??
                  1)
              }px`,
              height: `${
                96 *
                (data.photoScale ??
                  1)
              }px`,
            }}
          />
        )}

        <div
          className={
            data.photo
              ? 'flex-1 text-center'
              : 'flex-1'
          }
        >
          <h1
            style={{
              fontFamily:
                fonts.heading,
              fontSize:
                fs(36),
            }}
            className="
              font-bold
              tracking-tight
              leading-tight
            "
          >
            {data.name}
          </h1>

          <p
            style={{
              fontSize:
                fs(18),
            }}
            className="
              font-medium
              mt-1
              opacity-90
            "
          >
            {data.title}
          </p>
        </div>

        <div
          style={{
            fontSize:
              fs(13),
          }}
          className="
            space-y-1.5
            opacity-95
            shrink-0
          "
        >
          {data.email && (
            <a
              href={`mailto:${data.email}`}
              style={{
                color: 'inherit',
                textDecoration:
                  'none',
              }}
              className="
                flex
                items-center
                gap-2
                justify-end
              "
            >
              <Mail className="w-4 h-4" />
              <span>
                {data.email}
              </span>
            </a>
          )}

          {data.phone && (
            <a
              href={`tel:${data.phone.replace(
                /\s/g,
                ''
              )}`}
              style={{
                color: 'inherit',
                textDecoration:
                  'none',
              }}
              className="
                flex
                items-center
                gap-2
                justify-end
              "
            >
              <Phone className="w-4 h-4" />
              <span>
                {data.phone}
              </span>
            </a>
          )}

          {data.location && (
            <span
              className="
                flex
                items-center
                gap-2
                justify-end
              "
            >
              <MapPin className="w-4 h-4" />
              <span>
                {data.location}
              </span>
            </span>
          )}

          {age !== null && (
            <span
              className="
                flex
                items-center
                gap-2
                justify-end
              "
            >
              <Calendar className="w-4 h-4" />
              <span>
                {age} ans
              </span>
            </span>
          )}

          {data.hasDrivingLicense && (
            <span
              className="
                flex
                items-center
                gap-2
                justify-end
              "
            >
              <Car className="w-4 h-4" />
              <span>
                Permis B
              </span>
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
              style={{
                color: 'inherit',
                textDecoration:
                  'none',
              }}
              className="
                flex
                items-center
                gap-2
                justify-end
              "
            >
              <Globe className="w-4 h-4" />
              <span>
                {data.website}
              </span>
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
              style={{
                color: 'inherit',
                textDecoration:
                  'none',
              }}
              className="
                flex
                items-center
                gap-2
                justify-end
              "
            >
              <Linkedin className="w-4 h-4" />
              <span>
                {data.linkedin}
              </span>
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
              style={{
                color: 'inherit',
                textDecoration:
                  'none',
              }}
              className="
                flex
                items-center
                gap-2
                justify-end
              "
            >
              <Github className="w-4 h-4" />
              <span>
                {data.github}
              </span>
            </a>
          )}
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
          grid-cols-3
          gap-8
        "
      >
        {/* ===================================================
            LEFT — 1/3
        ==================================================== */}

        <ModernColumn
          id="section-column-left"
          className="col-span-1"
        >
          <SortableContext
            items={leftOrder}
            strategy={
              verticalListSortingStrategy
            }
          >
            <aside className="
              space-y-7
            ">
              {leftOrder.map(
                (sectionId) =>
                  renderSection(
                    sectionId
                  )
              )}
            </aside>
          </SortableContext>
        </ModernColumn>

        {/* ===================================================
            RIGHT — 2/3
        ==================================================== */}

        <ModernColumn
          id="section-column-right"
          className="col-span-2"
        >
          <SortableContext
            items={rightOrder}
            strategy={
              verticalListSortingStrategy
            }
          >
            <main className="
              space-y-7
            ">
              {rightOrder.map(
                (sectionId) =>
                  renderSection(
                    sectionId
                  )
              )}
            </main>
          </SortableContext>
        </ModernColumn>
      </div>
    </div>
  );
}