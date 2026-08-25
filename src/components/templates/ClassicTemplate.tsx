import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
} from 'lucide-react';

import {
  useDroppable,
  useDndContext,
} from '@dnd-kit/core';

import type {
  CVData,
  ThemeColors,
  CVSectionId,
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
 * CALCUL ÂGE
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
 * ZONE DE FIN DROPPABLE
 * =========================================================
 */

function ClassicBottomDropZone() {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: 'section-column-bottom',
  });

  const {
    active,
  } = useDndContext();

  const isDragging =
    Boolean(active);

  return (
    <div
      ref={setNodeRef}
      className="
        relative
        w-full
        h-6
        mt-1
      "
    >
      {isDragging &&
        isOver && (
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
  );
}

/**
 * =========================================================
 * TEMPLATE
 * =========================================================
 */

export default function ClassicTemplate({
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
            <section
              className="
                relative
                rounded-sm
                transition
                hover:bg-slate-50/50
              "
            >
              <h2
                style={{
                  fontFamily:
                    fonts.heading,
                  color:
                    colors.primary,
                  fontSize:
                    fs(17),
                }}
                className="
                  font-bold
                  uppercase
                  tracking-wider
                  mb-2
                "
              >
                {sectionTitle}
              </h2>

              <p
                style={{
                  fontSize:
                    fs(13),
                  color:
                    colors.text,
                  whiteSpace:
                    'pre-line',
                }}
                className="
                  leading-relaxed
                  text-justify
                "
              >
                {data.summary}
              </p>
            </section>
          </SortableSection>
        );

      /**
       * =====================================================
       * EXPERIENCES
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
            <section
              className="
                relative
                rounded-sm
                transition
                hover:bg-slate-50/50
              "
            >
              <h2
                style={{
                  fontFamily:
                    fonts.heading,
                  color:
                    colors.primary,
                  fontSize:
                    fs(17),
                }}
                className="
                  font-bold
                  uppercase
                  tracking-wider
                  mb-3
                "
              >
                {sectionTitle}
              </h2>

              <div className="space-y-4">
                {data.experiences.map(
                  (exp) => (
                    <div
                      key={exp.id}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3
                          style={{
                            fontFamily:
                              fonts.heading,
                            color:
                              colors.secondary,
                            fontSize:
                              fs(15),
                          }}
                          className="
                            font-bold
                            italic
                          "
                        >
                          {exp.role} —{' '}
                          {exp.company}
                        </h3>

                        <span
                          style={{
                            fontSize:
                              fs(12),
                            color:
                              colors.muted,
                          }}
                          className="
                            italic
                            shrink-0
                          "
                        >
                          {exp.period}
                        </span>
                      </div>

                      {exp.description && (
                        <p
                          style={{
                            fontSize:
                              fs(13),
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            mt-1
                            leading-relaxed
                            text-justify
                          "
                        >
                          {exp.description}
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
            <section
              className="
                relative
                rounded-sm
                transition
                hover:bg-slate-50/50
              "
            >
              <h2
                style={{
                  fontFamily:
                    fonts.heading,
                  color:
                    colors.primary,
                  fontSize:
                    fs(17),
                }}
                className="
                  font-bold
                  uppercase
                  tracking-wider
                  mb-3
                "
              >
                {sectionTitle}
              </h2>

              <div className="space-y-3">
                {data.education.map(
                  (ed) => (
                    <div
                      key={ed.id}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3
                          style={{
                            fontFamily:
                              fonts.heading,
                            color:
                              colors.secondary,
                            fontSize:
                              fs(15),
                          }}
                          className="
                            font-bold
                            italic
                          "
                        >
                          {ed.degree}
                        </h3>

                        <span
                          style={{
                            fontSize:
                              fs(12),
                            color:
                              colors.muted,
                          }}
                          className="
                            italic
                            shrink-0
                          "
                        >
                          {ed.period}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize:
                            fs(13),
                        }}
                        className="
                          font-medium
                        "
                      >
                        {ed.school}
                      </p>

                      {ed.description && (
                        <p
                          style={{
                            fontSize:
                              fs(13),
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            mt-1
                            leading-relaxed
                          "
                        >
                          {ed.description}
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
            <section
              className="
                relative
                rounded-sm
                transition
                hover:bg-slate-50/50
              "
            >
              <h2
                style={{
                  fontFamily:
                    fonts.heading,
                  color:
                    colors.primary,
                  fontSize:
                    fs(17),
                }}
                className="
                  font-bold
                  uppercase
                  tracking-wider
                  mb-2
                "
              >
                {sectionTitle}
              </h2>

              <div className="space-y-2">
                {data.skills.map(
                  (cat) =>
                    cat.items.length >
                      0 && (
                      <div
                        key={
                          cat.id
                        }
                        className="
                          flex
                          gap-2
                        "
                      >
                        <span
                          style={{
                            fontSize:
                              fs(13),
                            color:
                              colors.secondary,
                          }}
                          className="
                            font-bold
                            italic
                            shrink-0
                          "
                        >
                          {cat.name} :
                        </span>

                        <span
                          style={{
                            fontSize:
                              fs(13),
                          }}
                          className="
                            leading-relaxed
                          "
                        >
                          {cat.items.join(
                            ' • '
                          )}
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
            <section
              className="
                relative
                rounded-sm
                transition
                hover:bg-slate-50/50
              "
            >
              <h2
                style={{
                  fontFamily:
                    fonts.heading,
                  color:
                    colors.primary,
                  fontSize:
                    fs(17),
                }}
                className="
                  font-bold
                  uppercase
                  tracking-wider
                  mb-3
                "
              >
                {sectionTitle}
              </h2>

              <div className="space-y-2">
                {data.projects.map(
                  (p) => (
                    <div
                      key={p.id}
                    >
                      <h3
                        style={{
                          fontFamily:
                            fonts.heading,
                          color:
                            colors.secondary,
                          fontSize:
                            fs(15),
                        }}
                        className="
                          font-bold
                          italic
                        "
                      >
                        {p.name}

                        {p.url && (
                          <>
                            {' — '}

                            <a
                              href={
                                p.url.startsWith(
                                  'http'
                                )
                                  ? p.url
                                  : `https://${p.url}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color:
                                  colors.accent,
                                fontSize:
                                  fs(12),
                                textDecoration:
                                  'underline',
                              }}
                              className="
                                not-italic
                              "
                            >
                              {p.url}
                            </a>
                          </>
                        )}
                      </h3>

                      {p.description && (
                        <p
                          style={{
                            fontSize:
                              fs(13),
                            whiteSpace:
                              'pre-line',
                          }}
                          className="
                            leading-relaxed
                          "
                        >
                          {p.description}
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
            <section
              className="
                relative
                rounded-sm
                transition
                hover:bg-slate-50/50
              "
            >
              <h2
                style={{
                  fontFamily:
                    fonts.heading,
                  color:
                    colors.primary,
                  fontSize:
                    fs(17),
                }}
                className="
                  font-bold
                  uppercase
                  tracking-wider
                  mb-2
                "
              >
                {sectionTitle}
              </h2>

              <p
                style={{
                  fontSize:
                    fs(13),
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
            <section
              className="
                relative
                rounded-sm
                transition
                hover:bg-slate-50/50
              "
            >
              <h2
                style={{
                  fontFamily:
                    fonts.heading,
                  color:
                    colors.primary,
                  fontSize:
                    fs(17),
                }}
                className="
                  font-bold
                  uppercase
                  tracking-wider
                  mb-3
                "
              >
                {sectionTitle}
              </h2>

              <div
                className="
                  space-y-1
                  leading-relaxed
                "
                style={{
                  fontSize:
                    fs(13),
                }}
              >
                {data.certifications.map(
                  (
                    certification
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

                            <span
                              style={{
                                color:
                                  colors.text,
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
        py-12
      "
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          pb-6
          border-b-2
          flex
          items-center
          gap-6
        "
        style={{
          borderColor:
            colors.primary,
        }}
      >
        <div
          className={`flex-1 ${
            data.photo
              ? 'text-left'
              : 'text-center'
          }`}
        >
          <h1
            style={{
              fontFamily:
                fonts.heading,
              color:
                colors.primary,
              fontSize:
                fs(36),
            }}
            className="
              font-bold
              tracking-wide
            "
          >
            {data.name}
          </h1>

          <p
            style={{
              fontSize:
                fs(18),
              color:
                colors.muted,
            }}
            className="
              mt-2
              tracking-wider
              uppercase
            "
          >
            {data.title}
          </p>

          <div
            style={{
              fontSize:
                fs(12),
              color:
                colors.muted,
            }}
            className={`flex flex-wrap gap-x-5 gap-y-1 mt-3 ${
              data.photo
                ? ''
                : 'justify-center'
            }`}
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
                href={`tel:${data.phone}`}
                className="
                  flex
                  items-center
                  gap-1
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
              <span>
                {age} ans
              </span>
            )}

            {data.hasDrivingLicense && (
              <span>
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
                  items-center
                  gap-1
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
                  items-center
                  gap-1
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
        </div>

        {data.photo && (
          <img
            src={data.photo}
            alt={data.name}
            crossOrigin="anonymous"
            className="
              rounded-full
              object-cover
              shrink-0
              border-2
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
              borderColor:
                colors.primary,
            }}
          />
        )}
      </header>

      {/* =====================================================
          SECTIONS
      ====================================================== */}

      <div
        className="
          mt-7
          space-y-7
        "
      >
        {sectionOrder.map(
          (sectionId) =>
            renderSection(
              sectionId
            )
        )}

        {!captureMode && (
          <ClassicBottomDropZone />
        )}
      </div>
    </div>
  );
}