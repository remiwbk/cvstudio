import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Linkedin,
  Github,
  Car,
} from 'lucide-react';

import type { ReactNode } from 'react';

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
 * ORDRE GLOBAL PAR DÉFAUT DE L'APPLICATION
 * =========================================================
 */

const DEFAULT_SECTION_ORDER: CVSectionId[] = [
  'summary',
  'technicalSkills',
  'softSkills',
  'experiences',
  'education',
  'projects',
  'languages',
  'certifications',
  'interests',
];

/**
 * =========================================================
 * ORDRE VISUEL ORIGINAL DU SWISS
 * =========================================================
 */

const DEFAULT_SWISS_LAYOUT_ORDER: CVSectionId[] = [
  'summary',
  'technicalSkills',
  'softSkills',
  'languages',
  'interests',
  'experiences',
  'education',
  'projects',
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

  technicalSkills: 'left',
  softSkills: 'left',
  languages: 'left',
  interests: 'left',
  certifications: 'left',

  experiences: 'right',
  education: 'right',
  projects: 'right',
};

/**
 * =========================================================
 * TYPES DES COLONNES
 * =========================================================
 */

type SwissColumnId =
  | 'section-column-left'
  | 'section-column-right';

/**
 * =========================================================
 * ZONE DROPPABLE D'UNE COLONNE
 * =========================================================
 */

function SwissColumn({
  id,
  children,
  captureMode,
}: {
  id: SwissColumnId;
  children: ReactNode;
  captureMode: boolean;
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id,
    disabled: captureMode,
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
    disabled: captureMode,
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
          isOver && !captureMode
            ? 'bg-slate-50/40'
            : ''
        }
      `}
    >
      {children}

      {!captureMode && (
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

  const birth = new Date(birthDate);

  if (Number.isNaN(birth.getTime())) {
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

  return age >= 0 ? age : null;
}

/**
 * =========================================================
 * TEMPLATE SWISS
 * =========================================================
 */

export default function SwissTemplate({
  data,
  colors,
  fonts,
  fontScale,
  captureMode = false,
}: Props) {
  const fs = (n: number) =>
    `${n * fontScale}px`;

  /**
   * =========================================================
   * COMPÉTENCES TECHNIQUES
   * =========================================================
   */

  const hasTechnicalSkills =
    data.technicalSkills.some(
      (category) =>
        category.items.length > 0
    );

  /**
   * =========================================================
   * COMPÉTENCES GÉNÉRALES
   * =========================================================
   */

  const hasSoftSkills =
    data.softSkills.length > 0;

  /**
   * =========================================================
   * LANGUES
   * =========================================================
   */

  const hasLanguages =
    data.languages?.some(
      (language) =>
        Boolean(language.name)
    ) ?? false;

  /**
   * =========================================================
   * ÂGE
   * =========================================================
   */

  const age =
    calculateAge(
      data.birthDate
    );

  /**
   * =========================================================
   * ORDRE DES SECTIONS
   * =========================================================
   */

  const isDefaultOrder =
    data.sectionOrder?.length ===
      DEFAULT_SECTION_ORDER.length &&
    DEFAULT_SECTION_ORDER.every(
      (sectionId, index) =>
        data.sectionOrder?.[index] ===
        sectionId
    );

  const sectionOrder: CVSectionId[] =
    isDefaultOrder
      ? DEFAULT_SWISS_LAYOUT_ORDER
      : data.sectionOrder?.length
        ? data.sectionOrder
        : DEFAULT_SWISS_LAYOUT_ORDER;

  /**
   * =========================================================
   * COLONNE D'UNE SECTION
   * =========================================================
   */

  const getSectionColumn = (
    sectionId: CVSectionId
  ): CVSectionColumn => {
    return (
      data.sectionColumns?.[sectionId] ??
      DEFAULT_SECTION_COLUMNS[sectionId]
    );
  };

  /**
   * =========================================================
   * ORDRE DANS CHAQUE COLONNE
   * =========================================================
   */

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
   * NUMÉROTATION
   * =========================================================
   */

  const visibleSectionOrder = [
    ...leftOrder,
    ...rightOrder,
  ];

  const getSectionNumber = (
    sectionId: CVSectionId
  ): string => {
    const index =
      visibleSectionOrder.indexOf(
        sectionId
      );

    if (index === -1) {
      return '';
    }

    return String(
      index + 1
    ).padStart(2, '0');
  };

  /**
   * =========================================================
   * TITRES PERSONNALISÉS
   * =========================================================
   */

  const getSectionTitle = (
    sectionId: CVSectionId
  ): string => {
    return (
      data.sectionTitles?.[sectionId] ??
      DEFAULT_SECTION_TITLES[sectionId]
    );
  };

  /**
   * =========================================================
   * RENDER SECTION
   * =========================================================
   */

  const renderSection = (
    sectionId: CVSectionId
  ) => {
    const sectionNumber =
      getSectionNumber(
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
              <NumberTitle
                number={sectionNumber}
                title={getSectionTitle(
                  'summary'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <p
                style={{
                  fontSize: fs(10.5),
                  color: colors.muted,
                  whiteSpace: 'pre-line',
                }}
                className="leading-relaxed"
              >
                {data.summary}
              </p>
            </section>
          </SortableSection>
        );

      /**
       * =====================================================
       * COMPÉTENCES TECHNIQUES
       * =====================================================
       */

      case 'technicalSkills':
        if (!hasTechnicalSkills) {
          return null;
        }

        return (
          <SortableSection
            key="technicalSkills"
            id="technicalSkills"
            enabled={!captureMode}
          >
            <section>
              <NumberTitle
                number={sectionNumber}
                title={getSectionTitle(
                  'technicalSkills'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-3">
                {data.technicalSkills.map(
                  (category) =>
                    category.items.length > 0 ? (
                      <div
                        key={category.id}
                      >
                        <h3
                          style={{
                            fontSize: fs(10),
                            color:
                              colors.secondary,
                          }}
                          className="font-bold"
                        >
                          {category.name}
                        </h3>

                        <p
                          style={{
                            fontSize: fs(9.5),
                            color:
                              colors.muted,
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
       * COMPÉTENCES GÉNÉRALES
       * =====================================================
       */

      case 'softSkills':
        if (!hasSoftSkills) {
          return null;
        }

        return (
          <SortableSection
            key="softSkills"
            id="softSkills"
            enabled={!captureMode}
          >
            <section>
              <NumberTitle
                number={sectionNumber}
                title={getSectionTitle(
                  'softSkills'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <p
                style={{
                  fontSize: fs(10),
                  color: colors.muted,
                  whiteSpace: 'pre-line',
                }}
                className="
                  leading-relaxed
                "
              >
                {data.softSkills.join(
                  ' · '
                )}
              </p>
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
              <NumberTitle
                number={sectionNumber}
                title={getSectionTitle(
                  'languages'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-2">
                {data.languages.map(
                  (language) => (
                    <div
                      key={language.id}
                      className="
                        flex
                        items-baseline
                        justify-between
                        gap-3
                      "
                    >
                      <span
                        style={{
                          fontSize: fs(10),
                          color:
                            colors.secondary,
                          fontWeight: 700,
                        }}
                      >
                        {language.name}
                      </span>

                      {language.level && (
                        <span
                          style={{
                            fontSize: fs(9.5),
                            color:
                              colors.muted,
                          }}
                        >
                          {language.level}
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
              <NumberTitle
                number={sectionNumber}
                title={getSectionTitle(
                  'interests'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <p
                style={{
                  fontSize: fs(10),
                  color: colors.muted,
                  whiteSpace: 'pre-line',
                }}
                className="leading-relaxed"
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
              <NumberTitle
                number={sectionNumber}
                title={getSectionTitle(
                  'experiences'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-5">
                {data.experiences.map(
                  (exp) => (
                    <article
                      key={exp.id}
                    >
                      <div
                        className="
                          grid
                          grid-cols-[1fr_auto]
                          gap-5
                        "
                      >
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
                            className="font-bold"
                          >
                            {exp.role}
                          </h3>

                          <p
                            style={{
                              color:
                                colors.muted,
                              fontSize:
                                fs(10.5),
                            }}
                            className="font-medium"
                          >
                            {exp.company}
                          </p>
                        </div>

                        <span
                          style={{
                            color:
                              colors.muted,
                            fontSize:
                              fs(9.5),
                          }}
                        >
                          {exp.period}
                        </span>
                      </div>

                      {exp.description && (
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
                            mt-2
                          "
                        >
                          {exp.description}
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
              <NumberTitle
                number={sectionNumber}
                title={getSectionTitle(
                  'education'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-4">
                {data.education.map(
                  (ed) => (
                    <article
                      key={ed.id}
                    >
                      <div
                        className="
                          grid
                          grid-cols-[1fr_auto]
                          gap-5
                        "
                      >
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
                            className="font-bold"
                          >
                            {ed.degree}
                          </h3>

                          <p
                            style={{
                              color:
                                colors.muted,
                              fontSize:
                                fs(10),
                            }}
                          >
                            {ed.school}
                          </p>
                        </div>

                        <span
                          style={{
                            color:
                              colors.muted,
                            fontSize:
                              fs(9.5),
                          }}
                        >
                          {ed.period}
                        </span>
                      </div>

                      {ed.description && (
                        <p
                          style={{
                            fontSize:
                              fs(10),
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
                          {ed.description}
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
              <NumberTitle
                number={sectionNumber}
                title={getSectionTitle(
                  'projects'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div className="space-y-3">
                {data.projects.map(
                  (project) => (
                    <article
                      key={project.id}
                    >
                      <h3
                        style={{
                          fontSize:
                            fs(11.5),
                          color:
                            colors.secondary,
                        }}
                        className="font-bold"
                      >
                        {project.name}
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
                          className="inline-block"
                        >
                          {project.url}
                        </a>
                      )}

                      {project.description && (
                        <p
                          style={{
                            fontSize:
                              fs(9.5),
                            color:
                              colors.muted,
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            leading-relaxed
                            mt-1
                          "
                        >
                          {project.description}
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
              <NumberTitle
                number={sectionNumber}
                title={getSectionTitle(
                  'certifications'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(13)}
              />

              <div
                style={{
                  fontSize: fs(9.5),
                  color: colors.muted,
                }}
                className="leading-relaxed"
              >
                {data.certifications.map(
                  (
                    certification,
                    index
                  ) => {
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
                        className={
                          index <
                          data.certifications
                            .length -
                            1
                            ? 'mb-1'
                            : ''
                        }
                      >
                        <span
                          style={{
                            color:
                              colors.secondary,
                            fontWeight: 700,
                          }}
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
        fontFamily: fonts.body,
        color: colors.text,
        fontSize: fs(14),
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
          grid-cols-[auto_1fr_auto]
          gap-7
          items-start
        "
      >
        {data.photo ? (
          <img
            src={data.photo}
            alt={data.name}
            crossOrigin="anonymous"
            className="
              rounded-full
              object-cover
              shrink-0
            "
            style={{
              width: `${
                96 *
                (data.photoScale ?? 1)
              }px`,
              height: `${
                96 *
                (data.photoScale ?? 1)
              }px`,
            }}
          />
        ) : (
          <div
            className="
              w-5
              h-24
            "
            style={{
              background:
                colors.primary,
            }}
          />
        )}

        <div>
          <h1
            style={{
              fontFamily:
                fonts.heading,
              color:
                colors.primary,
              fontSize:
                fs(38),
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
                fs(16),
            }}
            className="
              font-medium
              mt-3
            "
          >
            {data.title}
          </p>
        </div>

        <div
          style={{
            fontSize:
              fs(9.5),
            color:
              colors.muted,
          }}
          className="
            space-y-1.5
            text-right
          "
        >
          {data.email && (
            <a
              href={`mailto:${data.email}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
              className="
                flex
                items-center
                gap-1.5
                justify-end
              "
            >
              <Mail className="w-3 h-3" />
              {data.email}
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
                textDecoration: 'none',
              }}
              className="
                flex
                items-center
                gap-1.5
                justify-end
              "
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
                gap-1.5
                justify-end
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
                gap-1.5
                justify-end
              "
            >
              <Calendar className="w-3 h-3" />
              {age} ans
            </span>
          )}

          {data.hasDrivingLicense && (
            <span
              className="
                flex
                items-center
                gap-1.5
                justify-end
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
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
              className="
                flex
                items-center
                gap-1.5
                justify-end
              "
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
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
              className="
                flex
                items-center
                gap-1.5
                justify-end
              "
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
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
              className="
                flex
                items-center
                gap-1.5
                justify-end
              "
            >
              <Github className="w-3 h-3" />
              {data.github}
            </a>
          )}
        </div>
      </header>

      {/* =====================================================
          SÉPARATEUR
      ====================================================== */}

      <div
        className="
          mt-8
          border-t
        "
        style={{
          borderColor:
            colors.border,
        }}
      />

      {/* =====================================================
          CONTENT MULTI-COLONNES
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-[0.38fr_0.62fr]
          gap-10
          mt-7
          items-start
        "
      >
        {/* ===================================================
            COLONNE GAUCHE
        ==================================================== */}

        <SwissColumn
          id="section-column-left"
          captureMode={captureMode}
        >
          <SortableContext
            items={leftOrder}
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
        </SwissColumn>

        {/* ===================================================
            COLONNE DROITE
        ==================================================== */}

        <SwissColumn
          id="section-column-right"
          captureMode={captureMode}
        >
          <SortableContext
            items={rightOrder}
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
        </SwissColumn>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * TITRE NUMÉROTÉ
 * =========================================================
 */

function NumberTitle({
  number,
  title,
  colors,
  fonts,
  size,
}: {
  number: string;
  title: string;
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
  };
  size: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        mb-3
      "
    >
      <span
        style={{
          color: colors.accent,
          fontSize: fsNumber(size),
        }}
        className="font-bold"
      >
        {number}
      </span>

      <h2
        style={{
          color: colors.primary,
          fontFamily:
            fonts.heading,
          fontSize: size,
        }}
        className="
          font-bold
          uppercase
          tracking-[0.18em]
        "
      >
        {title}
      </h2>
    </div>
  );
}

/**
 * =========================================================
 * TAILLE DES NUMÉROS
 * =========================================================
 */

function fsNumber(
  size: string
): string {
  const value =
    parseFloat(size);

  if (Number.isNaN(value)) {
    return size;
  }

  return `${value * 0.82}px`;
}