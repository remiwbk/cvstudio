import {
  ArrowLeft,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface LegalPageProps {
  type: 'legal' | 'privacy';
  onBack: () => void;
}

export default function LegalPage({
  type,
  onBack,
}: LegalPageProps) {
  const isLegal = type === 'legal';

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-slate-200/70
          bg-white/90
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-16
            max-w-5xl
            items-center
            justify-between
            px-5
            sm:px-8
          "
        >
          <button
            type="button"
            onClick={onBack}
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-slate-500
              transition
              hover:text-slate-900
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-slate-900
                text-white
              "
            >
              <FileText className="h-3.5 w-3.5" />
            </div>

            <span className="text-sm font-bold">
              CV Studio
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">

        {/* HEADER */}

        <div className="mb-16">
          <span
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.2em]
              text-slate-400
            "
          >
            Informations légales
          </span>

          <h1
            className="
              mt-4
              text-4xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-5xl
            "
          >
            {isLegal ? (
              <>
                Mentions légales
              </>
            ) : (
              <>
                Politique de
                <br />
                confidentialité
              </>
            )}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500">
            {isLegal
              ? "Informations concernant l'éditeur, l'hébergement et les conditions d'utilisation de CV Studio."
              : "Informations concernant le traitement et la protection des données personnelles utilisées par CV Studio."}
          </p>
        </div>

        {/* =====================================================
            MENTIONS LEGALES
        ====================================================== */}

        {type === 'legal' && (
          <section
            id="mentions-legales"
            className="scroll-mt-24"
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                "
              >
                <FileText className="h-5 w-5 text-slate-700" />
              </div>

              <h2 className="text-2xl font-bold">
                Mentions légales
              </h2>
            </div>

            <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">

              <div>
                <h3 className="font-bold text-slate-900">
                  Éditeur du site
                </h3>

                <p className="mt-2">
                  Nom / raison sociale :{' '}
                  <strong>Rémi DUPIRE</strong>
                  <br />
                  Email :{' '}
                  <strong>dupire.re@gmail.com</strong>
                  <br />
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Hébergement
                </h3>

                <p className="mt-2">
                  Hébergeur :{' '}
                  <strong>Vercel Inc.</strong>
                  <br />
                  Adresse :{' '}
                  <strong>340 S Lemon Ave #6133, Walnut, CA 91789, États-Unis</strong>
                  <br />
                  Site internet :{' '}
                  <strong>https://vercel.com</strong>
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Propriété intellectuelle
                </h3>

                <p className="mt-2">
                  L'ensemble du contenu présent sur CV Studio,
                  notamment les textes, éléments graphiques,
                  interfaces, logos, illustrations et composants
                  logiciels, est protégé par les dispositions
                  applicables en matière de propriété intellectuelle.
                </p>

                <p className="mt-3">
                  Toute reproduction, représentation ou utilisation
                  non autorisée de tout ou partie du site peut être
                  interdite par la législation en vigueur.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Contact
                </h3>

                <p className="mt-2">
                  Pour toute question concernant le site ou son
                  fonctionnement, vous pouvez contacter l'éditeur à
                  l'adresse suivante :
                </p>

                <p className="mt-2 font-medium text-slate-900">
                  dupire.re@gmail.com
                </p>
              </div>

            </div>
          </section>
        )}

        {/* =====================================================
            CONFIDENTIALITE
        ====================================================== */}

        {type === 'privacy' && (
          <section
            id="politique-confidentialite"
            className="scroll-mt-24"
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-100
                "
              >
                <ShieldCheck className="h-5 w-5 text-slate-700" />
              </div>

              <h2 className="text-2xl font-bold">
                Politique de confidentialité
              </h2>
            </div>

            <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">

              <div>
                <h3 className="font-bold text-slate-900">
                  1. Données traitées
                </h3>

                <p className="mt-2">
                  CV Studio permet notamment de renseigner des
                  informations personnelles dans un CV, telles que
                  le nom, l'adresse email, le numéro de téléphone,
                  l'expérience professionnelle, la formation, les
                  compétences ou encore une photographie.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  2. Stockage local
                </h3>

                <p className="mt-2">
                  Les données saisies dans CV Studio sont stockées
                  localement dans le navigateur de l'utilisateur,
                  notamment au moyen des mécanismes de stockage
                  disponibles sur son appareil.
                </p>

                <p className="mt-3">
                  CV Studio n'envoie pas automatiquement le contenu
                  de votre CV vers un serveur distant pour créer ou
                  sauvegarder votre document.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  3. Finalité du traitement
                </h3>

                <p className="mt-2">
                  Les données renseignées sont utilisées uniquement
                  afin de permettre la création, la modification,
                  l'affichage, la sauvegarde locale et l'export du
                  CV demandé par l'utilisateur.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  4. Absence de compte utilisateur
                </h3>

                <p className="mt-2">
                  CV Studio ne nécessite pas nécessairement la
                  création d'un compte utilisateur pour utiliser les
                  fonctionnalités principales du générateur.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  5. Cookies et technologies similaires
                </h3>

                <p className="mt-2">
                  CV Studio peut utiliser des mécanismes techniques
                  nécessaires au fonctionnement de l'application,
                  notamment pour conserver les données localement
                  dans le navigateur.
                </p>

                <p className="mt-3">
                  Si des services tiers de mesure d'audience,
                  d'analyse ou de publicité sont ajoutés
                  ultérieurement, cette politique devra être mise à
                  jour afin de préciser leur fonctionnement et les
                  données éventuellement collectées.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  6. Sécurité
                </h3>

                <p className="mt-2">
                  L'utilisateur reste responsable de la sécurité de
                  son appareil et de son navigateur ainsi que des
                  fichiers exportés depuis CV Studio.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  7. Suppression des données
                </h3>

                <p className="mt-2">
                  Les données stockées localement peuvent être
                  supprimées par l'utilisateur depuis les
                  fonctionnalités prévues par l'application ou en
                  supprimant les données du site dans les paramètres
                  de son navigateur.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  8. Droits des utilisateurs
                </h3>

                <p className="mt-2">
                  Conformément à la réglementation applicable en
                  matière de protection des données personnelles,
                  notamment le RGPD lorsque celui-ci est applicable,
                  les utilisateurs disposent des droits prévus par
                  la réglementation concernant leurs données
                  personnelles.
                </p>

                <p className="mt-3">
                  Pour toute demande relative à la protection des
                  données, vous pouvez contacter :
                </p>

                <p className="mt-2 font-medium text-slate-900">
                  dupire.re@gmail.com
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  9. Mise à jour
                </h3>

                <p className="mt-2">
                  Cette politique peut être mise à jour afin de
                  tenir compte de l'évolution du service, de ses
                  fonctionnalités ou de la réglementation applicable.
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Dernière mise à jour : 20 août 2026
                </p>
              </div>

            </div>
          </section>
        )}

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-5 py-8 text-center text-xs text-slate-400 sm:px-8">
          CV Studio — Générateur de CV · 2026
        </div>
      </footer>

    </div>
  );
}