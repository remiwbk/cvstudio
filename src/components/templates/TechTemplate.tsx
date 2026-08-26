import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Terminal,
  Calendar,
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
 * ORDRE PAR DÉFAUT
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
 * COLONNES PAR DÉFAUT
 * =========================================================
 *
 * TECH :
 * - gauche  → profil + compétences + langues + intérêts
 * - droite  → expériences + formation + projets + certifications
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
 * TYPES DES ZONES DROPPABLES
 * =========================================================
 */

type TechColumnId =
  | 'section-column-left'
  | 'section-column-right';

/**
 * =========================================================
 * COLONNE DROPPABLE
 * =========================================================
 */

function TechColumn({
  id,
  children,
  captureMode,
}: {
  id: TechColumnId;
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

  return age >= 0 ? age : null;
}

/**
 * =========================================================
 * TEMPLATE TECH
 * =========================================================
 */

export default function TechTemplate({
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
    data.softSkills.some(
      (skill) =>
        skill.trim().length > 0
    );

  /**
   * =========================================================
   * LANGUES
   * =========================================================
   */

  const hasLanguages =
    data.languages?.some(
      (language) =>
        Boolean(
          language.name?.trim()
        )
    ) ?? false;

  /**
   * =========================================================
   * CENTRES D'INTÉRÊT
   * =========================================================
   */

  const hasInterests =
    data.interests?.some(
      (interest) =>
        interest.trim().length > 0
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

  const sectionOrder: CVSectionId[] =
    data.sectionOrder?.length
      ? data.sectionOrder
      : DEFAULT_SECTION_ORDER;

  /**
   * =========================================================
   * TITRES PERSONNALISÉS
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
              <Heading
                title={getSectionTitle(
                  'summary'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(14)}
              />

              <p
                style={{
                  fontSize: fs(10.5),
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
              <Heading
                title={getSectionTitle(
                  'technicalSkills'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(14)}
              />

              <div className="space-y-4">
                {data.technicalSkills.map(
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
                              colors.accent,
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

                        <div
                          className="
                            flex
                            flex-wrap
                            gap-1
                          "
                        >
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
                                  borderColor:
                                    colors.border,
                                  color:
                                    colors.text,
                                  fontSize:
                                    fs(9),
                                }}
                                className="
                                  rounded
                                  px-1.5
                                  py-1
                                  border
                                "
                              >
                                {skill}
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
              <Heading
                title={getSectionTitle(
                  'softSkills'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(14)}
              />

              <p
                style={{
                  fontSize: fs(10),
                  color: colors.muted,
                }}
                className="
                  leading-relaxed
                "
              >
                {data.softSkills
                  .filter(
                    (skill) =>
                      skill.trim()
                        .length > 0
                  )
                  .join(' • ')}
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
              <Heading
                title={getSectionTitle(
                  'languages'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(14)}
              />

              <div className="space-y-2">
                {data.languages
                  .filter(
                    (language) =>
                      Boolean(
                        language.name?.trim()
                      )
                  )
                  .map(
                    (language) => (
                      <div
                        key={
                          language.id
                        }
                        className="
                          flex
                          justify-between
                          gap-3
                        "
                      >
                        <span
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
        if (!hasInterests) {
          return null;
        }

        return (
          <SortableSection
            key="interests"
            id="interests"
            enabled={!captureMode}
          >
            <section>
              <Heading
                title={getSectionTitle(
                  'interests'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(14)}
              />

              <p
                style={{
                  fontSize: fs(10),
                  color: colors.muted,
                }}
                className="
                  leading-relaxed
                "
              >
                {data.interests
                  .filter(
                    (interest) =>
                      interest.trim()
                        .length > 0
                  )
                  .join(' • ')}
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
              <Heading
                title={getSectionTitle(
                  'experiences'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(14)}
              />

              <div className="space-y-5">
                {data.experiences.map(
                  (exp) => (
                    <article
                      key={exp.id}
                    >
                      <div
                        className="
                          flex
                          justify-between
                          gap-4
                        "
                      >
                        <div>
                          <h3
                            style={{
                              color:
                                colors.secondary,
                              fontFamily:
                                fonts.heading,
                              fontSize:
                                fs(11),
                            }}
                            className="
                              font-bold
                            "
                          >
                            {exp.role}
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
                              fs(9),
                          }}
                          className="
                            shrink-0
                          "
                        >
                          {exp.period}
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
              <Heading
                title={getSectionTitle(
                  'education'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(14)}
              />

              <div className="space-y-4">
                {data.education.map(
                  (ed) => (
                    <article
                      key={ed.id}
                    >
                      <div
                        className="
                          flex
                          justify-between
                          gap-4
                        "
                      >
                        <div>
                          <h3
                            style={{
                              color:
                                colors.secondary,
                              fontSize:
                                fs(11),
                            }}
                            className="
                              font-bold
                            "
                          >
                            {ed.degree}
                          </h3>

                          <p
                            style={{
                              color:
                                colors.secondary,
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
                              fs(9),
                          }}
                          className="
                            shrink-0
                          "
                        >
                          {ed.period}
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
              <Heading
                title={getSectionTitle(
                  'projects'
                )}
                colors={colors}
                fonts={fonts}
                size={fs(14)}
              />

              <div
                className="
                  grid
                  grid-cols-2
                  gap-x-5
                  gap-y-4
                "
              >
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

                      {project.description && (
                        <p
                          style={{
                            color:
                              colors.muted,
                            fontSize:
                              fs(9),
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
              <Heading
                title={getSectionTitle(
                  'certifications'
                )}
                colors={colors}
                fonts={fonts}
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
                "
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
                        style={{
                          marginBottom:
                            index <
                            data
                              .certifications
                              .length -
                              1
                              ? fs(3)
                              : undefined,
                        }}
                      >
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
        px-9
        py-9
      "
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          flex
          gap-6
          items-center
        "
      >
        <div
          className="
            w-14
            h-14
            rounded-xl
            flex
            items-center
            justify-center
            shrink-0
          "
          style={{
            background:
              colors.primary,
            color: '#fff',
          }}
        >
          <Terminal className="w-7 h-7" />
        </div>

        <div className="flex-1">
          <h1
            style={{
              fontFamily:
                fonts.heading,
              color:
                colors.primary,
              fontSize:
                fs(35),
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
              color:
                colors.accent,
              fontSize:
                fs(15),
            }}
            className="
              font-semibold
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
              rounded-xl
              object-cover
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
      </header>

      {/* =====================================================
          CONTACT
      ====================================================== */}

      <div
        className="
          flex
          flex-wrap
          gap-x-4
          gap-y-1.5
          mt-5
          pb-5
          border-b
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
          <a
            href={`mailto:${data.email}`}
            className="
              flex
              gap-1.5
              items-center
              hover:underline
            "
            style={{
              color:
                'inherit',
            }}
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
            className="
              flex
              gap-1.5
              items-center
              hover:underline
            "
            style={{
              color:
                'inherit',
            }}
          >
            <Phone className="w-3 h-3" />
            {data.phone}
          </a>
        )}

        {data.location && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              data.location
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              gap-1.5
              items-center
              hover:underline
            "
            style={{
              color:
                'inherit',
            }}
          >
            <MapPin className="w-3 h-3" />
            {data.location}
          </a>
        )}

        {age !== null && (
          <span
            className="
              flex
              gap-1.5
              items-center
            "
            style={{
              color:
                'inherit',
            }}
          >
            <Calendar className="w-3 h-3" />
            {age} ans
          </span>
        )}

        {data.hasDrivingLicense && (
          <span
            className="
              flex
              gap-1.5
              items-center
            "
            style={{
              color:
                'inherit',
            }}
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
              gap-1.5
              items-center
              hover:underline
            "
            style={{
              color:
                'inherit',
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
              gap-1.5
              items-center
              hover:underline
            "
            style={{
              color:
                'inherit',
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
              gap-1.5
              items-center
              hover:underline
            "
            style={{
              color:
                'inherit',
            }}
          >
            <Github className="w-3 h-3" />
            {data.github}
          </a>
        )}
      </div>

      {/* =====================================================
          CONTENT MULTI-COLONNES
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-[0.62fr_1.38fr]
          gap-8
          mt-6
          items-start
        "
      >

        {/* ===================================================
            COLONNE GAUCHE
        ==================================================== */}

        <TechColumn
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
                space-y-6
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
        </TechColumn>

        {/* ===================================================
            COLONNE DROITE
        ==================================================== */}

        <TechColumn
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
                space-y-6
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
        </TechColumn>

      </div>
    </div>
  );
}

/**
 * =========================================================
 * HEADING
 * =========================================================
 */

function Heading({
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
        color:
          colors.primary,
        fontFamily:
          fonts.heading,
        fontSize:
          size,
      }}
      className="
        font-bold
        uppercase
        tracking-[0.2em]
        mb-4
        flex
        items-center
        gap-2
      "
    >
      <span
        className="
          w-1.5
          h-1.5
          rounded-full
        "
        style={{
          background:
            colors.accent,
        }}
      />

      {title}
    </h2>
  );
}