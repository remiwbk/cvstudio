import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  FileText,
  Download,
  Image as ImageIcon,
  Loader2,
  LayoutTemplate,
  Edit3,
  Eye,
  FolderOpen,
  Plus,
  Upload,
  Trash2,
  Copy,
  X,
  Check,
} from 'lucide-react';

import html2canvas from 'html2canvas';

import CVForm from '@/components/CVForm';

import CVPreview, {
  type CVPreviewHandle,
} from '@/components/CVPreview';

import {
  themes,
  themeOrder,
} from '@/themes';

import {
  emptyCV,
  DEFAULT_SECTION_TITLES,
  type CVData,
  type CVSectionId,
  type TemplateId,
} from '@/types/types';

import {
  createCVId,
  deleteCV,
  downloadCVGen,
  getAllCVs,
  importCVGen,
  saveCV,
  type SavedCV,
} from '@/lib/cvStorage';

import LandingPage from '@/components/LandingPage';

import LegalPage from '@/pages/LegalPage';

import CVTemplateThumbnail from '@/components/CVTemplateThumbnail';

/**
 * ---------------------------------------------------------
 * ROUTING SIMPLE
 * ---------------------------------------------------------
 */

type AppRoute =
  | 'landing'
  | 'editor'
  | 'legal'
  | 'privacy';

function getRoute(): AppRoute {
  const path = window.location.pathname;

  if (
    path === '/app' ||
    window.location.hash === '#app'
  ) {
    return 'editor';
  }

  if (
    path === '/mentions-legales'
  ) {
    return 'legal';
  }

  if (
    path === '/politique-confidentialite'
  ) {
    return 'privacy';
  }

  return 'landing';
}

/**
 * ---------------------------------------------------------
 * NORMALISATION DES DONNÉES CV
 * ---------------------------------------------------------
 *
 * Permet de charger les anciens CV créés avant l'ajout
 * de nouveaux champs sans faire planter l'application.
 */

function normalizeCVData(
  data: CVData
): CVData {
  const defaultSectionOrder: CVSectionId[] = [
    'summary',
    'experiences',
    'education',
    'skills',
    'projects',
    'interests',
    'certifications',
  ];

  const sectionOrder: CVSectionId[] =
    data.sectionOrder?.length
      ? [...data.sectionOrder]
      : [...defaultSectionOrder];

  const certifications =
    data.certifications ?? [];

  /*
   * Les anciens CV peuvent contenir
   * des certifications sans avoir encore
   * la section dans sectionOrder.
   */
  if (
    certifications.length > 0 &&
    !sectionOrder.includes(
      'certifications'
    )
  ) {
    sectionOrder.push(
      'certifications'
    );
  }

  return {
    ...data,

    certifications,

    sectionOrder,

    /*
     * Compatibilité avec les anciens CV :
     * on conserve leurs éventuels titres
     * et on complète les nouveaux champs manquants
     * avec les titres par défaut.
     */
    sectionTitles: {
      ...DEFAULT_SECTION_TITLES,
      ...(data.sectionTitles ?? {}),
    },
  };
}

export default function App() {
  /**
   * ---------------------------------------------------------
   * ROUTING
   * ---------------------------------------------------------
   */

  const [route, setRoute] =
    useState<AppRoute>(getRoute);

  const openEditor = useCallback(
    (selectedTemplate?: TemplateId) => {
      if (selectedTemplate) {
        setTemplate(selectedTemplate);
      }

      window.history.pushState(
        {},
        '',
        '/app'
      );

      setRoute('editor');

      window.scrollTo(0, 0);
    },
    []
  );

  const goToLanding = useCallback(() => {
    window.history.pushState(
      {},
      '',
      '/'
    );

    setRoute('landing');

    window.scrollTo(0, 0);
  }, []);

  const goToLegal = useCallback(() => {
    window.history.pushState(
      {},
      '',
      '/mentions-legales'
    );

    setRoute('legal');

    window.scrollTo(0, 0);
  }, []);

  const goToPrivacy = useCallback(() => {
    window.history.pushState(
      {},
      '',
      '/politique-confidentialite'
    );

    setRoute('privacy');

    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRoute());

      window.scrollTo(0, 0);
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);

  /**
   * ---------------------------------------------------------
   * ÉTAT CV
   * ---------------------------------------------------------
   */

  const [data, setData] =
    useState<CVData>(emptyCV);

  const [template, setTemplate] =
    useState<TemplateId>('modern');

  const [currentCVId, setCurrentCVId] =
    useState<string | null>(null);

  const [currentCVName, setCurrentCVName] =
    useState('Mon CV');

  const [library, setLibrary] =
    useState<SavedCV[]>([]);

  const [libraryOpen, setLibraryOpen] =
    useState(false);

  const [templateOpen, setTemplateOpen] =
    useState(false);

  const [loadingStorage, setLoadingStorage] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [lastSaved, setLastSaved] =
    useState<number | null>(null);

  const [busy, setBusy] =
    useState<'pdf' | 'png' | null>(null);

  const [mobileView, setMobileView] =
    useState<'edit' | 'preview'>('edit');

  const previewRef =
    useRef<CVPreviewHandle>(null);

  const saveTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /**
   * ---------------------------------------------------------
   * INITIALISATION INDEXEDDB
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const cvs =
          await getAllCVs();

        if (cancelled) {
          return;
        }

        setLibrary(cvs);

        if (cvs.length > 0) {
          const latest = cvs[0];

          setCurrentCVId(
            latest.id
          );

          setCurrentCVName(
            latest.name
          );

          setData(
            normalizeCVData(
              latest.data
            )
          );

          setTemplate(
            latest.template
          );

          setLastSaved(
            latest.updatedAt
          );
        } else {
          const now =
            Date.now();

          const initialCV: SavedCV = {
            id: createCVId(),
            name: 'Mon CV',
            data: {
              ...emptyCV,
              sectionOrder: [
                ...emptyCV.sectionOrder,
              ],
              sectionTitles: {
                ...emptyCV.sectionTitles,
              },
            },
            template: 'modern',
            createdAt: now,
            updatedAt: now,
          };

          await saveCV(
            initialCV
          );

          if (cancelled) {
            return;
          }

          setCurrentCVId(
            initialCV.id
          );

          setCurrentCVName(
            initialCV.name
          );

          setLibrary([
            initialCV,
          ]);

          setLastSaved(
            now
          );
        }
      } catch (error) {
        console.error(
          'Erreur IndexedDB :',
          error
        );

        alert(
          "Impossible d'accéder au stockage local du navigateur. Vérifie que les données du site sont autorisées."
        );
      } finally {
        if (!cancelled) {
          setLoadingStorage(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * ---------------------------------------------------------
   * AUTOSAVE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (
      loadingStorage ||
      !currentCVId
    ) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(
        saveTimerRef.current
      );
    }

    saveTimerRef.current =
      setTimeout(async () => {
        setSaving(true);

        try {
          const existing =
            library.find(
              (cv) =>
                cv.id ===
                currentCVId
            );

          const now =
            Date.now();

          const saved: SavedCV = {
            id: currentCVId,
            name:
              currentCVName ||
              'Mon CV',
            data,
            template,
            createdAt:
              existing?.createdAt ??
              now,
            updatedAt: now,
          };

          await saveCV(
            saved
          );

          setLastSaved(
            now
          );

          setLibrary(
            (previous) => {
              const exists =
                previous.some(
                  (cv) =>
                    cv.id ===
                    saved.id
                );

              const next =
                exists
                  ? previous.map(
                      (cv) =>
                        cv.id ===
                        saved.id
                          ? saved
                          : cv
                    )
                  : [
                      saved,
                      ...previous,
                    ];

              return [
                ...next,
              ].sort(
                (a, b) =>
                  b.updatedAt -
                  a.updatedAt
              );
            }
          );
        } catch (error) {
          console.error(
            'Erreur autosave :',
            error
          );
        } finally {
          setSaving(false);
        }
      }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(
          saveTimerRef.current
        );
      }
    };
  }, [
    data,
    template,
    currentCVId,
    currentCVName,
    loadingStorage,
    library,
  ]);

  /**
   * ---------------------------------------------------------
   * CHANGEMENT DES DONNÉES
   * ---------------------------------------------------------
   */

  const handleDataChange =
    useCallback(
      (nextData: CVData) => {
        setData(nextData);
      },
      []
    );

  /**
   * ---------------------------------------------------------
   * CHANGEMENT DE L'ORDRE DES SECTIONS
   * ---------------------------------------------------------
   */

  const handleSectionOrderChange =
    useCallback(
      (order: CVData['sectionOrder']) => {
        setData((previous) => ({
          ...previous,
          sectionOrder: order,
        }));
      },
      []
    );



  /**
   * ---------------------------------------------------------
   * CHANGEMENT TEMPLATE
   * ---------------------------------------------------------
   */

  const handleTemplateChange =
    useCallback(
      (id: TemplateId) => {
        setTemplate(id);
        setTemplateOpen(false);
      },
      []
    );

  /**
   * ---------------------------------------------------------
   * CRÉER UN NOUVEAU CV
   * ---------------------------------------------------------
   */

  const handleNewCV =
    useCallback(async () => {
      const name =
        window.prompt(
          'Nom du nouveau CV :',
          'Nouveau CV'
        );

      if (
        name === null
      ) {
        return;
      }

      const cleanName =
        name.trim() ||
        'Nouveau CV';

      const now =
        Date.now();

      const newCV: SavedCV = {
        id: createCVId(),
        name: cleanName,
        data: {
          ...emptyCV,
          sectionOrder: [
            ...emptyCV.sectionOrder,
          ],
          sectionTitles: {
            ...DEFAULT_SECTION_TITLES,
          },
        },
        template: 'modern',
        createdAt: now,
        updatedAt: now,
      };

      try {
        await saveCV(
          newCV
        );

        setCurrentCVId(
          newCV.id
        );

        setCurrentCVName(
          newCV.name
        );

        setData({
          ...newCV.data,
          sectionOrder: [
            ...newCV.data.sectionOrder,
          ],
          sectionTitles: {
            ...newCV.data.sectionTitles,
          },
        });

        setTemplate(
          'modern'
        );

        setLastSaved(
          now
        );

        setLibrary(
          (previous) =>
            [
              newCV,
              ...previous,
            ].sort(
              (a, b) =>
                b.updatedAt -
                a.updatedAt
            )
        );

        setLibraryOpen(
          false
        );

        setTemplateOpen(
          false
        );

        setMobileView(
          'edit'
        );
      } catch (error) {
        console.error(
          'Erreur création CV :',
          error
        );

        alert(
          'Impossible de créer le CV.'
        );
      }
    }, []);

  /**
   * ---------------------------------------------------------
   * OUVRIR UN CV
   * ---------------------------------------------------------
   */

  const handleOpenCV =
    useCallback(
      (cv: SavedCV) => {
        if (saveTimerRef.current) {
          clearTimeout(
            saveTimerRef.current
          );
        }

        setCurrentCVId(
          cv.id
        );

        setCurrentCVName(
          cv.name
        );

        setData(
          normalizeCVData(
            cv.data
          )
        );

        setTemplate(
          cv.template
        );

        setLastSaved(
          cv.updatedAt
        );

        setLibraryOpen(
          false
        );

        setTemplateOpen(
          false
        );

        setMobileView(
          'edit'
        );
      },
      []
    );

  /**
   * ---------------------------------------------------------
   * RENOMMER UN CV
   * ---------------------------------------------------------
   */

  const handleRenameCV =
    useCallback(
      async (cv: SavedCV) => {
        const name =
          window.prompt(
            'Nouveau nom du CV :',
            cv.name
          );

        if (
          name === null
        ) {
          return;
        }

        const cleanName =
          name.trim();

        if (!cleanName) {
          return;
        }

        const renamed: SavedCV = {
          ...cv,
          name: cleanName,
          updatedAt:
            Date.now(),
        };

        try {
          await saveCV(
            renamed
          );

          setLibrary(
            (previous) =>
              previous
                .map(
                  (item) =>
                    item.id ===
                    renamed.id
                      ? renamed
                      : item
                )
                .sort(
                  (a, b) =>
                    b.updatedAt -
                    a.updatedAt
                )
          );

          if (
            currentCVId ===
            cv.id
          ) {
            setCurrentCVName(
              cleanName
            );

            setLastSaved(
              renamed.updatedAt
            );
          }
        } catch (error) {
          console.error(
            'Erreur renommage :',
            error
          );

          alert(
            'Impossible de renommer le CV.'
          );
        }
      },
      [currentCVId]
    );

  /**
   * ---------------------------------------------------------
   * DUPLIQUER UN CV
   * ---------------------------------------------------------
   */

  const handleDuplicateCV =
    useCallback(
      async (cv: SavedCV) => {
        const name =
          window.prompt(
            'Nom de la copie :',
            `${cv.name} - Copie`
          );

        if (
          name === null
        ) {
          return;
        }

        const cleanName =
          name.trim() ||
          `${cv.name} - Copie`;

        const now =
          Date.now();

        const duplicate: SavedCV = {
          id: createCVId(),
          name: cleanName,
          data: cv.data,
          template:
            cv.template,
          createdAt: now,
          updatedAt: now,
        };

        try {
          await saveCV(
            duplicate
          );

          setLibrary(
            (previous) =>
              [
                duplicate,
                ...previous,
              ].sort(
                (a, b) =>
                  b.updatedAt -
                  a.updatedAt
              )
          );
        } catch (error) {
          console.error(
            'Erreur duplication :',
            error
          );

          alert(
            'Impossible de dupliquer le CV.'
          );
        }
      },
      []
    );

  /**
   * ---------------------------------------------------------
   * SUPPRIMER UN CV
   * ---------------------------------------------------------
   */

  const handleDeleteCV =
    useCallback(
      async (cv: SavedCV) => {
        if (
          !window.confirm(
            `Supprimer "${cv.name}" ?\n\nCette action est irréversible si tu n'as pas exporté le fichier .cvgen.`
          )
        ) {
          return;
        }

        try {
          await deleteCV(
            cv.id
          );

          const remaining =
            library.filter(
              (item) =>
                item.id !==
                cv.id
            );

          setLibrary(
            remaining
          );

          if (
            currentCVId ===
            cv.id
          ) {
            if (
              remaining.length >
              0
            ) {
              handleOpenCV(
                remaining[0]
              );
            } else {
              await handleNewCV();
            }
          }
        } catch (error) {
          console.error(
            'Erreur suppression :',
            error
          );

          alert(
            'Impossible de supprimer le CV.'
          );
        }
      },
      [
        currentCVId,
        handleNewCV,
        handleOpenCV,
        library,
      ]
    );

  /**
   * ---------------------------------------------------------
   * EXPORT .CVGEN
   * ---------------------------------------------------------
   */

  const handleExportCVGen =
    useCallback(
      (cv: SavedCV) => {
        try {
          downloadCVGen(
            cv
          );
        } catch (error) {
          console.error(
            'Erreur export .cvgen :',
            error
          );

          alert(
            "Impossible d'exporter le CV."
          );
        }
      },
      []
    );

  /**
   * ---------------------------------------------------------
   * IMPORT .CVGEN
   * ---------------------------------------------------------
   */

  const handleImportCVGen =
    useCallback(
      async (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        const file =
          event.target.files?.[0];

        event.target.value = '';

        if (!file) {
          return;
        }

        try {
          const imported =
            await importCVGen(
              file
            );

          const now =
            Date.now();

          const importedCV: SavedCV = {
            id: createCVId(),
            name:
              imported.name ||
              'CV importé',
            data:
              imported.data,
            template:
              imported.template,
            createdAt: now,
            updatedAt: now,
          };

          await saveCV(
            importedCV
          );

          setLibrary(
            (previous) =>
              [
                importedCV,
                ...previous,
              ].sort(
                (a, b) =>
                  b.updatedAt -
                  a.updatedAt
              )
          );

          setCurrentCVId(
            importedCV.id
          );

          setCurrentCVName(
            importedCV.name
          );

          setData(
            normalizeCVData(
              importedCV.data
            )
          );

          setTemplate(
            importedCV.template
          );

          setLastSaved(
            now
          );

          setLibraryOpen(
            false
          );

          setTemplateOpen(
            false
          );

          setMobileView(
            'edit'
          );
        } catch (error) {
          console.error(
            'Erreur import .cvgen :',
            error
          );

          alert(
            error instanceof Error
              ? error.message
              : "Impossible d'importer ce fichier."
          );
        }
      },
      []
    );

  /**
   * ---------------------------------------------------------
   * PDF
   * ---------------------------------------------------------
   */

  const handlePDF =
    useCallback(() => {
      const page =
        previewRef.current?.getPageEl();

      if (!page) {
        alert(
          "Impossible de trouver le CV à exporter."
        );
        return;
      }

      setBusy('pdf');

      try {
        const printWindow =
          window.open(
            '',
            '_blank',
            'width=900,height=1200'
          );

        if (!printWindow) {
          alert(
            "Le navigateur a bloqué la fenêtre d'impression. Autorise les fenêtres pop-up pour ce site."
          );

          setBusy(null);
          return;
        }

        const styles =
          Array.from(
            document.querySelectorAll<
              HTMLStyleElement |
              HTMLLinkElement
            >(
              'style, link[rel="stylesheet"]'
            )
          )
            .map((node) => {
              if (
                node.tagName ===
                'STYLE'
              ) {
                return node.outerHTML;
              }

              const link =
                node as HTMLLinkElement;

              return `<link rel="stylesheet" href="${link.href}">`;
            })
            .join('\n');

        const clonedPage =
          page.cloneNode(
            true
          ) as HTMLElement;

        clonedPage.style.transform =
          'none';

        clonedPage.style.transformOrigin =
          'top left';

        clonedPage.style.width =
          '210mm';

        clonedPage.style.minWidth =
          '210mm';

        clonedPage.style.maxWidth =
          '210mm';

        clonedPage.style.height =
          '297mm';

        clonedPage.style.minHeight =
          '297mm';

        clonedPage.style.maxHeight =
          '297mm';

        clonedPage.style.margin =
          '0';

        clonedPage.style.boxShadow =
          'none';

        clonedPage
          .querySelectorAll<HTMLElement>(
            '[style*="transform"]'
          )
          .forEach(
            (element) => {
              const transform =
                element.style
                  .transform;

              if (
                transform &&
                transform.includes(
                  'scale('
                )
              ) {
                element.style.transform =
                  'none';

                element.style.transformOrigin =
                  'top left';
              }
            }
          );

        printWindow.document.open();

        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="UTF-8" />

              <title>CV - ${escapeHtml(
                data.name ||
                  'Mon CV'
              )}</title>

              ${styles}

              <style>
                @page {
                  size: A4 portrait;
                  margin: 0;
                }

                html,
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 210mm !important;
                  min-width: 210mm !important;
                  background: white !important;
                }

                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }

                *,
                *::before,
                *::after {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }

                .a4-page {
                  width: 210mm !important;
                  min-width: 210mm !important;
                  max-width: 210mm !important;

                  height: 297mm !important;
                  min-height: 297mm !important;
                  max-height: 297mm !important;

                  margin: 0 !important;
                  padding: 0 !important;

                  box-shadow: none !important;

                  overflow: hidden !important;
                }

                img {
                  print-color-adjust: exact !important;
                  -webkit-print-color-adjust: exact !important;
                }

                @media print {
                  html,
                  body {
                    width: 210mm !important;
                    height: 297mm !important;
                  }

                  .a4-page {
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                  }
                }
              </style>
            </head>

            <body>
              ${clonedPage.outerHTML}

              <script>
                window.addEventListener('load', function () {
                  setTimeout(function () {
                    window.focus();
                    window.print();
                  }, 500);
                });

                window.addEventListener('afterprint', function () {
                  setTimeout(function () {
                    window.close();
                  }, 300);
                });
              </script>
            </body>
          </html>
        `);

        printWindow.document.close();
      } catch (error) {
        console.error(
          'Erreur génération PDF :',
          error
        );

        alert(
          'La génération du PDF a échoué.'
        );
      } finally {
        setTimeout(() => {
          setBusy(null);
        }, 500);
      }
    }, [data.name]);

  /**
   * ---------------------------------------------------------
   * PNG
   * ---------------------------------------------------------
   */

  const handlePNG =
    useCallback(async () => {
      const page =
        previewRef.current?.getPageEl();

      if (!page) {
        alert(
          "Impossible de trouver le CV à exporter."
        );
        return;
      }

      setBusy('png');

      let clone: HTMLElement | null =
        null;

      try {
        clone =
          page.cloneNode(
            true
          ) as HTMLElement;

        clone.style.position =
          'fixed';

        clone.style.left =
          '-100000px';

        clone.style.top =
          '0';

        clone.style.transform =
          'none';

        clone.style.transformOrigin =
          'top left';

        clone.style.width =
          '210mm';

        clone.style.minWidth =
          '210mm';

        clone.style.maxWidth =
          '210mm';

        clone.style.height =
          '297mm';

        clone.style.minHeight =
          '297mm';

        clone.style.background =
          'white';

        clone.style.boxShadow =
          'none';

        document.body.appendChild(
          clone
        );

        clone
          .querySelectorAll<HTMLElement>(
            '[style*="transform"]'
          )
          .forEach(
            (element) => {
              if (
                element.style.transform.includes(
                  'scale('
                )
              ) {
                element.style.transform =
                  'none';

                element.style.transformOrigin =
                  'top left';
              }
            }
          );

        const images =
          Array.from(
            clone.querySelectorAll(
              'img'
            )
          );

        await Promise.all(
          images.map((img) => {
            if (img.complete) {
              return Promise.resolve();
            }

            return new Promise<void>(
              (resolve) => {
                img.onload =
                  () =>
                    resolve();

                img.onerror =
                  () =>
                    resolve();
              }
            );
          })
        );

        if (
          'fonts' in
          document
        ) {
          await document.fonts
            .ready;
        }

        const canvas =
          await html2canvas(
            clone,
            {
              scale: 3,
              useCORS: true,
              allowTaint: false,
              backgroundColor:
                '#ffffff',
              logging: false,

              width:
                clone.scrollWidth,

              height:
                clone.scrollHeight,

              windowWidth:
                clone.scrollWidth,

              windowHeight:
                clone.scrollHeight,
            }
          );

        if (
          clone.parentNode
        ) {
          clone.parentNode.removeChild(
            clone
          );
        }

        clone = null;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              alert(
                'Impossible de générer le PNG.'
              );

              setBusy(null);
              return;
            }

            const url =
              URL.createObjectURL(
                blob
              );

            const link =
              document.createElement(
                'a'
              );

            link.href =
              url;

            link.download =
              'mon-cv.png';

            document.body.appendChild(
              link
            );

            link.click();

            link.remove();

            URL.revokeObjectURL(
              url
            );

            setBusy(null);
          },
          'image/png'
        );
      } catch (error) {
        console.error(
          'Erreur génération PNG :',
          error
        );

        if (
          clone?.parentNode
        ) {
          clone.parentNode.removeChild(
            clone
          );
        }

        alert(
          'La génération du PNG a échoué.'
        );

        setBusy(null);
      }
    }, []);

  /**
   * ---------------------------------------------------------
   * FORMAT DATE SAUVEGARDE
   * ---------------------------------------------------------
   */

  const saveLabel =
    saving
      ? 'Sauvegarde…'
      : lastSaved
        ? `Sauvegardé à ${new Date(
            lastSaved
          ).toLocaleTimeString(
            'fr-FR',
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          )}`
        : 'Non sauvegardé';

  /**
   * ---------------------------------------------------------
   * PAGES PUBLIQUES
   * ---------------------------------------------------------
   */

  if (route === 'legal') {
    return (
      <LegalPage
        type="legal"
        onBack={goToLanding}
      />
    );
  }

  if (route === 'privacy') {
    return (
      <LegalPage
        type="privacy"
        onBack={goToLanding}
      />
    );
  }

  /**
   * ---------------------------------------------------------
   * LANDING PAGE
   * ---------------------------------------------------------
   */

  if (route === 'landing') {
    return (
      <LandingPage
        onStart={openEditor}
        onLegal={goToLegal}
        onPrivacy={goToPrivacy}
      />
    );
  }

  /**
   * ---------------------------------------------------------
   * ÉDITEUR
   * ---------------------------------------------------------
   */

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-900">

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="no-print shrink-0 bg-white border-b border-slate-200">

        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* BRAND */}

          <div className="flex items-center gap-2.5 min-w-0">

            <button
              onClick={goToLanding}
              className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 hover:bg-slate-700 transition"
              title="Retour à l'accueil"
            >
              <FileText className="w-4 h-4" />
            </button>

            <div className="leading-tight min-w-0">

              <h1 className="text-sm font-bold tracking-tight">
                CV Studio
              </h1>

              <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block">
                Générateur de CV — format A4
              </p>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-2">

            {/* NOM DU CV */}

            <button
              onClick={() => {
                const name =
                  window.prompt(
                    'Nom du CV :',
                    currentCVName
                  );

                if (
                  name === null
                ) {
                  return;
                }

                const clean =
                  name.trim();

                if (
                  !clean ||
                  !currentCVId
                ) {
                  return;
                }

                setCurrentCVName(
                  clean
                );
              }}
              className="hidden lg:flex max-w-[180px] items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition"
              title="Renommer le CV"
            >
              <span className="truncate">
                {currentCVName}
              </span>

              <Edit3 className="w-3 h-3 shrink-0" />
            </button>

            {/* SAUVEGARDE */}

            <div
              className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400"
              title="Sauvegarde automatique dans le navigateur"
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}

              {saveLabel}
            </div>

            {/* TEMPLATE */}

            <div className="relative">

              <button
                onClick={() =>
                  setTemplateOpen(
                    (open) => !open
                  )
                }
                className="
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-slate-700
                  hover:bg-slate-50
                  hover:border-slate-300
                  transition
                  flex
                  items-center
                  gap-1.5
                "
                title="Choisir un template"
                aria-expanded={
                  templateOpen
                }
              >
                <LayoutTemplate className="w-3.5 h-3.5" />

                <span className="hidden sm:inline">
                  Template
                </span>

                <span className="hidden md:inline text-slate-400">
                  {themes[template].name}
                </span>

                <span
                  className={`
                    text-slate-400
                    transition-transform
                    ${
                      templateOpen
                        ? 'rotate-180'
                        : ''
                    }
                  `}
                >
                  ▾
                </span>
              </button>

              {templateOpen && (
                <>
                  <button
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() =>
                      setTemplateOpen(
                        false
                      )
                    }
                    aria-label="Fermer le menu template"
                  />

                  <div className="
                    absolute
                    top-full
                    mt-2
                    z-50

                    w-[620px]
                    max-w-[calc(100vw-1.5rem)]

                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl

                    overflow-hidden

                    right-0

                    max-h-[calc(100vh-5rem)]
                    flex
                    flex-col

                    sm:right-0

                    max-sm:fixed
                    max-sm:left-1/2
                    max-sm:right-auto
                    max-sm:-translate-x-1/2
                    max-sm:top-14
                    max-sm:mt-0
                    max-sm:w-[calc(100vw-1rem)]
                    max-sm:max-h-[calc(100vh-4.5rem)]
                  ">

                    <div className="px-5 py-4 border-b border-slate-100">

                      <div className="flex items-center justify-between">

                        <div>
                          <h2 className="text-sm font-bold text-slate-900">
                            Choisir un template
                          </h2>

                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Sélectionne le style de ton CV
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            setTemplateOpen(
                              false
                            )
                          }
                          className="
                            w-7
                            h-7
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            text-slate-400
                            hover:bg-slate-100
                            hover:text-slate-700
                          "
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                      </div>

                    </div>

                    <div className="
                      p-3
                      sm:p-4

                      grid
                      grid-cols-2
                      gap-2
                      sm:gap-3

                      overflow-y-auto
                      overscroll-contain

                      min-h-0
                    ">

                      {themeOrder.map(
                        (id) => {
                          const isActive =
                            template ===
                            id;

                          const descriptions: Record<
                            TemplateId,
                            string
                          > = {
                            modern:
                              'Moderne',
                            minimal:
                              'Épuré',
                            classic:
                              'Élégant',
                            corporate:
                              'Professionnel',
                            editorial:
                              'Créatif',
                            executive:
                              'Premium',
                            swiss:
                              'Structuré',
                            tech:
                              'Informatique',
                          };

                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() =>
                                handleTemplateChange(id)
                              }
                              className={`
                                relative
                                text-left
                                rounded-xl
                                border
                                p-2.5
                                transition-all

                                ${
                                  isActive
                                    ? 'border-slate-900 bg-slate-50 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }
                              `}
                            >
                              {/* =================================================
                                  CHECK
                              ================================================== */}

                              {isActive && (
                                <div
                                  className="
                                    absolute
                                    top-3
                                    right-3
                                    z-20

                                    w-5
                                    h-5

                                    rounded-full

                                    bg-slate-900
                                    text-white

                                    flex
                                    items-center
                                    justify-center

                                    shadow-sm
                                  "
                                >
                                  <Check className="w-3 h-3" />
                                </div>
                              )}

                              {/* =================================================
                                  VRAI THUMBNAIL
                              ================================================== */}

                              <div
                                className="
                                  w-full
                                  overflow-hidden
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  shadow-sm
                                "
                              >
                                <CVTemplateThumbnail
                                  data={data}
                                  template={id}
                                  className="w-full"
                                />
                              </div>

                              {/* =================================================
                                  INFOS
                              ================================================== */}

                              <div className="
                                px-1
                                pt-2.5
                                pb-1
                                pr-6
                              ">
                                <div className="
                                  text-xs
                                  font-semibold
                                  text-slate-900
                                ">
                                  {themes[id].name}
                                </div>

                                <div className="
                                  text-[10px]
                                  text-slate-400
                                  mt-0.5
                                ">
                                  {descriptions[id]}
                                </div>
                              </div>
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>
                </>
              )}

            </div>

            {/* BIBLIOTHÈQUE */}

            <button
              onClick={() =>
                setLibraryOpen(
                  true
                )
              }
              className="
                rounded-lg
                border
                border-slate-200
                px-3
                py-1.5
                text-xs
                font-medium
                text-slate-700
                hover:bg-slate-50
                transition
                flex
                items-center
                gap-1.5
              "
              title="Mes CV"
            >
              <FolderOpen className="w-3.5 h-3.5" />

              <span className="hidden sm:inline">
                Mes CV
              </span>
            </button>

            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

            {/* PNG */}

            <button
              onClick={
                handlePNG
              }
              disabled={
                busy !== null ||
                loadingStorage
              }
              className="
                rounded-lg
                border
                border-slate-200
                px-3
                py-1.5
                text-xs
                font-medium
                text-slate-700
                hover:bg-slate-50
                transition
                flex
                items-center
                gap-1.5
                disabled:opacity-50
              "
            >
              {busy ===
              'png' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}

              <span className="hidden sm:inline">
                PNG
              </span>
            </button>

            {/* PDF */}

            <button
              onClick={
                handlePDF
              }
              disabled={
                busy !== null ||
                loadingStorage
              }
              className="
                rounded-lg
                bg-slate-900
                px-3.5
                py-1.5
                text-xs
                font-semibold
                text-white
                hover:bg-slate-700
                transition
                flex
                items-center
                gap-1.5
                disabled:opacity-50
              "
            >
              {busy ===
              'pdf' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}

              PDF
            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          MOBILE VIEW TOGGLE
      ====================================================== */}

      <div className="no-print sm:hidden shrink-0 flex border-b border-slate-200 bg-white">

        <button
          onClick={() =>
            setMobileView(
              'edit'
            )
          }
          className={`
            flex-1
            py-2.5
            text-xs
            font-medium
            flex
            items-center
            justify-center
            gap-1.5
            ${
              mobileView ===
              'edit'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400'
            }
          `}
        >
          <Edit3 className="w-3.5 h-3.5" />

          Éditer
        </button>

        <button
          onClick={() =>
            setMobileView(
              'preview'
            )
          }
          className={`
            flex-1
            py-2.5
            text-xs
            font-medium
            flex
            items-center
            justify-center
            gap-1.5
            ${
              mobileView ===
              'preview'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400'
            }
          `}
        >
          <Eye className="w-3.5 h-3.5" />

          Aperçu
        </button>

      </div>

      {/* =====================================================
          MAIN SPLIT
      ====================================================== */}

      <div className="flex-1 min-h-0 flex">

        {/* EDITOR */}

        <aside
          className={`
            no-print
            w-full
            sm:w-[440px]
            sm:shrink-0
            border-r
            border-slate-200
            bg-white
            overflow-y-auto
            ${
              mobileView ===
              'edit'
                ? 'block'
                : 'hidden sm:block'
            }
          `}
        >

          <div className="p-5">

            <CVForm
              data={data}
              onChange={
                handleDataChange
              }
            />

            <div className="h-8" />

          </div>

        </aside>

        {/* PREVIEW */}

        <main
          className={`
            flex-1
            min-w-0
            ${
              mobileView ===
              'preview'
                ? 'block'
                : 'hidden sm:block'
            }
          `}
        >
          <CVPreview
            ref={previewRef}
            data={data}
            template={template}
            onChange={handleDataChange}
            onSectionOrderChange={
              handleSectionOrderChange
            }
          />
        </main>

      </div>

      {/* =====================================================
          LIBRARY MODAL
      ====================================================== */}

      {libraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <button
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() =>
              setLibraryOpen(
                false
              )
            }
            aria-label="Fermer"
          />

          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">

              <div>

                <h2 className="text-base font-bold text-slate-900">
                  Mes CV
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Stockés uniquement dans ce navigateur
                </p>

              </div>

              <button
                onClick={() =>
                  setLibraryOpen(
                    false
                  )
                }
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

            {/* ACTIONS */}

            <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap gap-2">

              <button
                onClick={
                  handleNewCV
                }
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-slate-900
                  text-white
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  hover:bg-slate-700
                "
              >
                <Plus className="w-3.5 h-3.5" />

                Nouveau CV
              </button>

              <label
                className="
                  cursor-pointer
                  flex
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-slate-200
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-slate-700
                  hover:bg-slate-50
                "
              >
                <Upload className="w-3.5 h-3.5" />

                Importer .cvgen

                <input
                  type="file"
                  accept=".cvgen,application/json"
                  className="hidden"
                  onChange={
                    handleImportCVGen
                  }
                />
              </label>

            </div>

            {/* LISTE */}

            <div className="overflow-y-auto max-h-[55vh] p-5">

              {library.length ===
              0 ? (
                <div className="py-12 text-center text-slate-400">

                  <FolderOpen className="w-8 h-8 mx-auto mb-3 opacity-40" />

                  <p className="text-sm">
                    Aucun CV enregistré.
                  </p>

                </div>
              ) : (
                <div className="space-y-2">

                  {library.map(
                    (cv) => {
                      const isCurrent =
                        cv.id ===
                        currentCVId;

                      return (
                        <div
                          key={
                            cv.id
                          }
                          className={`
                            group
                            rounded-xl
                            border
                            p-4
                            transition
                            ${
                              isCurrent
                                ? 'border-slate-900 bg-slate-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }
                          `}
                        >

                          <div className="flex items-start justify-between gap-4">

                            <button
                              onClick={() =>
                                handleOpenCV(
                                  cv
                                )
                              }
                              className="text-left min-w-0 flex-1"
                            >

                              <div className="flex items-center gap-2">

                                <h3 className="text-sm font-semibold text-slate-900 truncate">
                                  {
                                    cv.name
                                  }
                                </h3>

                                {isCurrent && (
                                  <span className="shrink-0 text-[10px] font-medium bg-slate-900 text-white px-1.5 py-0.5 rounded">
                                    OUVERT
                                  </span>
                                )}

                              </div>

                              <p className="text-[11px] text-slate-400 mt-1">
                                {
                                  themes[
                                    cv.template
                                  ].name
                                }{' '}
                                · Modifié le{' '}
                                {new Date(
                                  cv.updatedAt
                                ).toLocaleDateString(
                                  'fr-FR',
                                  {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  }
                                )}{' '}
                                à{' '}
                                {new Date(
                                  cv.updatedAt
                                ).toLocaleTimeString(
                                  'fr-FR',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </p>

                            </button>

                            <div className="flex items-center gap-1 shrink-0">

                              <button
                                onClick={() =>
                                  handleRenameCV(
                                    cv
                                  )
                                }
                                title="Renommer"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() =>
                                  handleDuplicateCV(
                                    cv
                                  )
                                }
                                title="Dupliquer"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() =>
                                  handleExportCVGen(
                                    cv
                                  )
                                }
                                title="Exporter .cvgen"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteCV(
                                    cv
                                  )
                                }
                                title="Supprimer"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* FOOTER */}

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">

              <p className="text-[11px] text-slate-400">
                💾 Les CV sont sauvegardés localement dans IndexedDB. Ils ne sont pas envoyés à un serveur.
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/**
 * ---------------------------------------------------------
 * ESCAPE HTML
 * ---------------------------------------------------------
 */

function escapeHtml(
  value: string
): string {
  return value
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}