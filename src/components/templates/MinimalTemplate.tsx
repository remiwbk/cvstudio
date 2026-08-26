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
 * ZONE DE DROP FINALE
 * =========================================================
 *
 * Minimal est un template mono-colonne.
 *
 * Cette zone permet de déposer une section après
 * la dernière section existante.
 * =========================================================
 */

function MinimalBottomDropZone() {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: 'section-column-bottom',
  });

  return (
    <div
      ref={setNodeRef}
      className="
        relative
        w-full
        h-4
      "
    >
      {isOver && (
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
 * CALCUL ÂGE
 * =========================================================
 */

function calculateAge(
  birthDate: string
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
 * TEMPLATE
 * =========================================================
 */

export default function MinimalTemplate({
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
    data.languages?.length > 0;

  const age =
    calculateAge(
      data.birthDate ?? ''
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
        fontFamily:
          fonts.heading,
        color:
          colors.text,
        fontSize:
          fs(16),
      }}
      className="
        font-semibold
        uppercase
        tracking-[0.2em]
        mb-3
      "
    >
      {getSectionTitle(
        sectionId
      )}
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
                  fontSize:
                    fs(13),
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

              <div className="space-y-5">
                {data.experiences.map(
                  (exp) => (
                    <div
                      key={
                        exp.id
                      }
                      className="
                        grid
                        grid-cols-4
                        gap-4
                      "
                    >
                      <div
                        style={{
                          fontSize:
                            fs(11),
                          color:
                            colors.muted,
                        }}
                        className="
                          col-span-1
                          pt-0.5
                        "
                      >
                        {
                          exp.period
                        }
                      </div>

                      <div className="col-span-3">
                        <h3
                          style={{
                            fontSize:
                              fs(13),
                          }}
                          className="
                            font-semibold
                          "
                        >
                          {
                            exp.role
                          }
                        </h3>

                        <p
                          style={{
                            fontSize:
                              fs(13),
                            color:
                              colors.muted,
                          }}
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
                              mt-1.5
                              leading-relaxed
                            "
                          >
                            {
                              exp.description
                            }
                          </p>
                        )}
                      </div>
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

              <div className="space-y-3">
                {data.education.map(
                  (ed) => (
                    <div
                      key={
                        ed.id
                      }
                      className="
                        grid
                        grid-cols-4
                        gap-4
                      "
                    >
                      <div
                        style={{
                          fontSize:
                            fs(11),
                          color:
                            colors.muted,
                        }}
                        className="
                          col-span-1
                          pt-0.5
                        "
                      >
                        {
                          ed.period
                        }
                      </div>

                      <div className="col-span-3">
                        <h3
                          style={{
                            fontSize:
                              fs(13),
                          }}
                          className="
                            font-semibold
                          "
                        >
                          {
                            ed.degree
                          }
                        </h3>

                        <p
                          style={{
                            fontSize:
                              fs(13),
                            color:
                              colors.muted,
                          }}
                        >
                          {
                            ed.school
                          }
                        </p>

                        {ed.description && (
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
                              ed.description
                            }
                          </p>
                        )}
                      </div>
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
            <section>
              <SectionTitle
                sectionId="skills"
              />

              <div className="space-y-2">
                {data.skills.map(
                  (cat) =>
                    cat.items.length >
                      0 ? (
                      <div
                        key={
                          cat.id
                        }
                        className="
                          grid
                          grid-cols-4
                          gap-4
                        "
                      >
                        <div
                          style={{
                            fontSize:
                              fs(12),
                            color:
                              colors.accent,
                          }}
                          className="
                            col-span-1
                            pt-0.5
                            font-medium
                          "
                        >
                          {
                            cat.name
                          }
                        </div>

                        <div
                          style={{
                            fontSize:
                              fs(13),
                            color:
                              colors.muted,
                          }}
                          className="
                            col-span-3
                          "
                        >
                          {cat.items.map(
                            (
                              s,
                              i
                            ) => (
                              <span
                                key={
                                  i
                                }
                              >
                                {s}

                                {i <
                                  cat.items
                                    .length -
                                    1 && (
                                  <span
                                    style={{
                                      color:
                                        colors.border,
                                    }}
                                  >
                                    {' /'}
                                  </span>
                                )}
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

              <div className="space-y-3">
                {data.projects.map(
                  (p) => (
                    <div
                      key={p.id}
                      className="
                        grid
                        grid-cols-4
                        gap-4
                      "
                    >
                      <div
                        style={{
                          fontSize:
                            fs(11),
                          color:
                            colors.accent,
                        }}
                        className="
                          col-span-1
                          pt-0.5
                        "
                      >
                        {p.url && (
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
                              textDecoration:
                                'underline',
                            }}
                          >
                            {
                              p.url
                            }
                          </a>
                        )}
                      </div>

                      <div className="col-span-3">
                        <h3
                          style={{
                            fontSize:
                              fs(13),
                          }}
                          className="
                            font-semibold
                          "
                        >
                          {
                            p.name
                          }
                        </h3>

                        {p.description && (
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
                              p.description
                            }
                          </p>
                        )}
                      </div>
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
                sectionId="languages"
              />

              <div className="space-y-2">
                {data.languages.map(
                  (language) => (
                    <div
                      key={
                        language.id
                      }
                      className="
                        grid
                        grid-cols-4
                        gap-4
                      "
                    >
                      <div
                        style={{
                          fontSize:
                            fs(13),
                          color:
                            colors.text,
                        }}
                        className="
                          col-span-1
                          font-medium
                        "
                      >
                        {
                          language.name
                        }
                      </div>

                      <div
                        style={{
                          fontSize:
                            fs(13),
                          color:
                            colors.muted,
                        }}
                        className="
                          col-span-3
                        "
                      >
                        {
                          language.level
                        }
                      </div>
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
                sectionId="interests"
              />

              <div
                style={{
                  fontSize:
                    fs(13),
                  color:
                    colors.muted,
                }}
                className="
                  flex
                  flex-wrap
                  gap-x-4
                  gap-y-1.5
                "
              >
                {data.interests.map(
                  (
                    it,
                    i
                  ) => (
                    <span
                      key={i}
                    >
                      {it}

                      {i <
                        data
                          .interests
                          .length -
                          1 && (
                        <span
                          style={{
                            color:
                              colors.border,
                          }}
                        >
                          {' /'}
                        </span>
                      )}
                    </span>
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

              <div
                className="
                  space-y-1.5
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
                        style={{
                          fontSize:
                            fs(12.5),
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
                            fontWeight:
                              600,
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
        px-14
        py-14
      "
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          mb-9
          flex
          items-start
          justify-between
          gap-6
        "
      >
        <div className="flex-1">
          <h1
            style={{
              fontFamily:
                fonts.heading,
              fontSize:
                fs(48),
            }}
            className="
              font-bold
              tracking-tight
              leading-none
            "
          >
            {data.name}
          </h1>

          <p
            style={{
              fontSize:
                fs(18),
              color:
                colors.accent,
            }}
            className="
              mt-3
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
            className="
              flex
              flex-wrap
              gap-x-5
              gap-y-1
              mt-4
            "
          >
            {data.email && (
              <span className="flex items-center gap-1.5">
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
              <span className="flex items-center gap-1.5">
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
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />

                {data.location}
              </span>
            )}

            {age !== null && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3 h-3" />

                {age} ans
              </span>
            )}

            {data.hasDrivingLicense && (
              <span className="flex items-center gap-1.5">
                <Car className="w-3 h-3" />

                Permis B
              </span>
            )}

            {data.website && (
              <span className="flex items-center gap-1.5">
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
              <span className="flex items-center gap-1.5">
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
              <span className="flex items-center gap-1.5">
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
          SECTIONS
      ====================================================== */}

      <div
        className="
          space-y-8
        "
      >
        <SortableContext
          items={
            sectionOrder
          }
          strategy={
            verticalListSortingStrategy
          }
        >
          {sectionOrder.map(
            (sectionId) =>
              renderSection(
                sectionId
              )
          )}

          {!captureMode && (
            <MinimalBottomDropZone />
          )}
        </SortableContext>
      </div>
    </div>
  );
}