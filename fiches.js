/* IzyCréa — base de connaissances
   Chaque fiche : id, titre, theme, badge, maj (date de vérification), resume, motscles, contenu (HTML), sources.
   Badges : vigueur = texte en vigueur ; decret = nouvelles règles / décrets récents ;
            variable = pratique variable selon les agences France Travail ; discussion = texte en discussion. */
window.IZY_THEMES = [
  { id: 'aides', label: 'Aides & chômage', icon: '💶' },
  { id: 'statuts', label: 'Statuts', icon: '🏛️' },
  { id: 'fiscal', label: 'Fiscalité & TVA', icon: '🧾' },
  { id: 'social', label: 'Protection sociale & retraite', icon: '🛡️' },
  { id: 'pse', label: 'PSE, RCC & congés', icon: '🧭' },
  { id: 'financement', label: 'Financement', icon: '🏦' },
  { id: 'methode', label: 'Méthode consultant', icon: '🧩' },
  { id: 'gestion', label: 'Gestion & obligations', icon: '📎' }
];

window.IZY_FICHES = [
{
  id: 'arce',
  titre: "ARCE : toucher 60 % de ses droits en capital",
  theme: 'aides', badge: 'vigueur', maj: '2026-11-23',
  resume: "Capital égal à 60 % des droits ARE restants, versé en deux fois. Réservé aux créations faites après la fin du contrat de travail.",
  motscles: 'arce capital chômage france travail are 60% 40% versement création reprise',
  contenu: `
  <h3>En bref</h3>
  <ul>
    <li><strong>Montant :</strong> 60 % des droits ARE restants à la date de début d'activité, moins une participation de 3 % au financement des retraites complémentaires.</li>
    <li><strong>Versement :</strong> 50 % au démarrage de l'activité (ou à l'ouverture des droits si elle est plus tardive), le solde 6 mois après le premier versement.</li>
    <li><strong>Condition clé :</strong> avoir créé ou repris l'entreprise <em>après</em> la fin du contrat de travail (terme du préavis).</li>
  </ul>
  <div class="callout warn"><strong>Point de vigilance PSE / congé de reclassement :</strong> une création immatriculée <em>pendant</em> le contrat (donc pendant un congé de reclassement ou de mobilité) ne permet pas l'ARCE. Vérifier la date d'immatriculation avant de conseiller.</div>
  <h3>Le second versement</h3>
  <p>Il est versé si le bénéficiaire justifie que l'activité existe toujours (attestation sur l'honneur ou autre justificatif demandé par France Travail) et qu'il n'occupe pas un emploi en CDI à temps plein.</p>
  <h3>Et les 40 % restants ?</h3>
  <p>En cas de cessation d'activité, les 40 % de droits non consommés peuvent être récupérés en se réinscrivant à France Travail, après application d'un différé.</p>
  <h3>Exemple chiffré</h3>
  <p>18 000 € de droits restants → 60 % = 10 800 € → moins 3 % = 10 476 € net → premier versement de 5 238 €.</p>
  <h3>ARCE ou maintien de l'ARE ?</h3>
  <p>L'ARCE convient au porteur qui a besoin de trésorerie au démarrage et prévoit de se rémunérer vite. Le maintien de l'ARE (fiche dédiée) sécurise un revenu mensuel quand l'activité démarre lentement. Le choix se fait auprès de France Travail : utiliser son simulateur avec le porteur.</p>`,
  sources: [
    { t: "Service-public — Arce (vérifié le 13/08/2026)", u: 'https://entreprendre.service-public.gouv.fr/vosdroits/F15252' },
    { t: "Unédic — fiche ARCE", u: 'https://www.unedic.org/indemnisation/fiches-thematiques/aide-la-reprise-ou-la-creation-dentreprise-arce' },
    { t: "France Travail — guide ARE, ARCE, Acre 2026", u: 'https://www.francetravail.fr/actualites/a-laffiche/2026/are-arce-acre-creer-son-entrepri.html' }
  ]
},
{
  id: 'maintien-are',
  titre: "Maintien de l'ARE : cumuler chômage et revenus de l'entreprise",
  theme: 'aides', badge: 'variable', maj: '2026-11-23',
  resume: "Cumul possible dans la limite de 60 % des droits restants à la date de création (fins de contrat depuis le 1er avril 2025).",
  motscles: 'maintien are cumul allocation chômage revenus non salarié 60% activité conservée actualisation',
  contenu: `
  <h3>La règle depuis le 1er avril 2025</h3>
  <p>Le cumul de l'ARE avec les revenus de l'entreprise est plafonné à <strong>60 % du reliquat de droits</strong> existant à la date de création ou de reprise. Une fois ce plafond atteint, les versements s'arrêtent.</p>
  <ul>
    <li>Le cumul est ouvert à tous les allocataires créateurs, même sans Acre.</li>
    <li>Chaque mois, France Travail recalcule l'ARE en fonction des revenus d'activité déclarés à l'actualisation.</li>
    <li>Si le dirigeant ne se rémunère pas, il doit justifier la poursuite de l'activité et attester l'absence de revenus, dividendes compris.</li>
  </ul>
  <h3>L'exception de « l'activité conservée »</h3>
  <p>Une activité non salariée exercée <em>avant</em> la perte de l'emploi salarié peut être considérée comme conservée : les règles de cumul sont alors différentes et plus favorables. Le site de France Travail indique que le créateur sera « peut-être » dans cette situation : <strong>c'est le conseiller France Travail qui apprécie</strong>.</p>
  <div class="callout warn"><strong>Ce qu'on peut dire au porteur :</strong> donner l'information, ne jamais garantir. Aucun texte ne permet au consultant d'assurer un résultat ; la décision appartient à France Travail.</div>
  <h3>Les retenues sur l'ARE</h3>
  <p>L'ARE supporte des prélèvements sociaux (CSG, CRDS selon la situation) et une participation de 3 % au financement des retraites complémentaires. Ordre de grandeur souvent utilisé en prévisionnel : un peu moins de 10 % de l'allocation brute.</p>`,
  sources: [
    { t: "Service-public — Créer une entreprise et percevoir le chômage", u: 'https://entreprendre.service-public.gouv.fr/vosdroits/F36613' },
    { t: "Unédic — Cumul allocation et rémunération", u: 'https://www.unedic.org/indemnisation/fiches-thematiques/cumul-allocation-salaire' },
    { t: "France Travail — guide ARE, ARCE, Acre 2026", u: 'https://www.francetravail.fr/actualites/a-laffiche/2026/are-arce-acre-creer-son-entrepri.html' }
  ]
},
{
  id: 'creer-pendant-cr',
  titre: "Créer pendant un congé de reclassement ou de mobilité",
  theme: 'pse', badge: 'variable', maj: '2026-11-23',
  resume: "Possible, mais avec des conséquences sur l'ARCE et une part d'appréciation de France Travail. À sécuriser avant l'immatriculation.",
  motscles: 'congé de reclassement congé de mobilité pse rcc créer pendant immatriculation are arce activité conservée prime création',
  contenu: `
  <h3>Les trois questions à poser avant d'immatriculer</h3>
  <ol>
    <li><strong>L'accord prévoit-il une prime à la création ?</strong> Conditions, calendrier, pièces à fournir (Kbis, prévisionnel, attestation d'un réseau…). La date d'immatriculation conditionne souvent le versement.</li>
    <li><strong>Le porteur veut-il l'ARCE ?</strong> L'ARCE suppose une création <em>après</em> la fin du contrat. Créer pendant le congé ferme cette option.</li>
    <li><strong>Va-t-il se rémunérer pendant le congé ?</strong> Sans rémunération, France Travail peut considérer l'activité comme « conservée », mais c'est une appréciation au cas par cas.</li>
  </ol>
  <div class="callout warn"><strong>Pas de garantie possible :</strong> aucun texte ne permet d'assurer au porteur qu'il percevra l'ARE en ayant créé pendant le congé. Si le doute est bloquant, il peut être pertinent de demander au client un délai de création compatible avec l'incertitude.</div>
  <h3>Bon réflexe</h3>
  <p>Faire valider la stratégie par écrit avec le conseiller France Travail du porteur, et conserver la trace des informations données.</p>
  <h3>Dans IzyCréa</h3>
  <p>Les deux prévisionnels ont une ligne <em>Prime création PSE / RCC</em> à saisir manuellement : elle apparaît dans les ressources du porteur et dans l'export.</p>`,
  sources: [
    { t: "Unédic — conditions de l'ARCE (création après fin de contrat)", u: 'https://www.unedic.org/indemnisation/fiches-thematiques/aide-la-reprise-ou-la-creation-dentreprise-arce' },
    { t: "France Travail — guide ARE, ARCE, Acre 2026", u: 'https://www.francetravail.fr/actualites/a-laffiche/2026/are-arce-acre-creer-son-entrepri.html' }
  ]
},
{
  id: 'acre-2026',
  titre: "Acre 2026 : ce qui a changé",
  theme: 'aides', badge: 'decret', maj: '2026-11-23',
  resume: "Plus automatique, réservée à certains publics, et exonération réduite à 25 % pour les micro-entrepreneurs depuis le 1er juillet 2026.",
  motscles: 'acre exonération cotisations urssaf demande 2026 micro-entrepreneur 25% 75% zfrr qpv demandeur emploi',
  contenu: `
  <h3>Les trois changements</h3>
  <ol>
    <li><strong>Demande obligatoire :</strong> l'Acre n'est plus automatique. Le créateur dépose sa demande à l'Urssaf avec le justificatif de création téléchargé sur le guichet unique (délai indiqué par France Travail : 60 jours).</li>
    <li><strong>Publics ciblés :</strong> l'aide est réservée à certaines situations (voir ci-dessous).</li>
    <li><strong>Exonération réduite :</strong> pour les micro-entrepreneurs, depuis le <strong>1er juillet 2026</strong>, le taux minoré est de 75 % du taux normal (exonération de 25 % au lieu de 50 %). Pour les autres statuts, les nouvelles règles s'appliquent depuis le 1er janvier 2026.</li>
  </ol>
  <h3>Qui peut en bénéficier ?</h3>
  <ul>
    <li>bénéficiaires de l'ARE ou de l'ASP (CSP) ;</li>
    <li>demandeurs d'emploi non indemnisés inscrits depuis plus de 6 mois sur les 18 derniers mois ;</li>
    <li>bénéficiaires de l'ASS, du RSA ou de la PreParE ;</li>
    <li>jeunes de 18 à 25 ans (29 ans en situation de handicap), moins de 30 ans non indemnisés ;</li>
    <li>salariés repreneurs d'une entreprise en procédure collective ;</li>
    <li>titulaires d'un CAPE ;</li>
    <li>création en QPV ou en zone France ruralités revitalisation (ZFRR / ZFRR+).</li>
  </ul>
  <h3>Durée pour un micro-entrepreneur</h3>
  <p>Jusqu'à la fin du 3e trimestre civil qui suit le début d'activité : la date de démarrage change donc la durée réelle (de 10 à 12 mois environ).</p>
  <h3>À ne pas oublier</h3>
  <ul>
    <li>Pas d'Acre si le créateur en a bénéficié dans les 3 années précédentes.</li>
    <li>En société, le créateur doit exercer le contrôle effectif.</li>
    <li>Changer de structure (micro → société) avec un nouveau SIRET fait perdre l'Acre en cours.</li>
  </ul>`,
  sources: [
    { t: "Service-public — modification de l'Acre (décret du 6 février 2026)", u: 'https://entreprendre.service-public.gouv.fr/actualites/A18795' },
    { t: "Economie.gouv — cotisations du micro-entrepreneur", u: 'https://www.economie.gouv.fr/entreprises/micro-entreprise-auto-entreprise-charges-sociales' },
    { t: "France Travail — guide 2026 (démarches Acre)", u: 'https://www.francetravail.fr/actualites/a-laffiche/2026/are-arce-acre-creer-son-entrepri.html' }
  ]
},
{
  id: 'micro-2026',
  titre: "Micro-entreprise : seuils et taux 2026",
  theme: 'statuts', badge: 'vigueur', maj: '2026-11-23',
  resume: "Seuils 2026-2028 : 203 100 € (ventes, hébergement) et 83 600 € (services). Taux de cotisations 2026 par activité.",
  motscles: 'micro-entreprise auto-entrepreneur seuils plafond chiffre affaires 2026 taux cotisations urssaf bic bnc cipav abattement versement libératoire',
  contenu: `
  <h3>Seuils de chiffre d'affaires 2026-2028</h3>
  <table class="tbl"><thead><tr><th>Activité</th><th>Seuil annuel HT</th></tr></thead><tbody>
    <tr><td>Ventes de marchandises, hébergement</td><td>203 100 €</td></tr>
    <tr><td>Prestations de services (BIC et BNC)</td><td>83 600 €</td></tr>
    <tr><td>Activité mixte</td><td>203 100 € dont 83 600 € de services au maximum</td></tr>
  </tbody></table>
  <p>Seuils proratisés la première année. Le régime reste applicable tant que le seuil n'est pas dépassé deux années civiles consécutives.</p>
  <h3>Taux de cotisations sociales 2026 (métropole)</h3>
  <table class="tbl"><thead><tr><th>Activité</th><th>Taux</th><th>Abattement fiscal</th><th>Versement libératoire</th></tr></thead><tbody>
    <tr><td>Achat-revente (BIC)</td><td>12,3 %</td><td>71 %</td><td>1 %</td></tr>
    <tr><td>Services commerciaux et artisanaux (BIC)</td><td>21,2 %</td><td>50 %</td><td>1,7 %</td></tr>
    <tr><td>Autres prestations de services (BNC)</td><td>25,6 %</td><td>34 %</td><td>2,2 %</td></tr>
    <tr><td>Professions libérales Cipav</td><td>23,2 %</td><td>34 %</td><td>2,2 %</td></tr>
  </tbody></table>
  <p>S'ajoute la contribution à la formation professionnelle (de 0,1 % à 0,3 % selon l'activité). Avec l'Acre, depuis le 1er juillet 2026 : 75 % du taux normal.</p>
  <div class="callout">Le versement libératoire n'est possible que si le revenu fiscal de référence du foyer reste sous un plafond : à vérifier sur l'avis d'imposition du porteur.</div>`,
  sources: [
    { t: "Service-public — nouveaux seuils de la micro-entreprise (26/02/2026)", u: 'https://entreprendre.service-public.gouv.fr/actualites/A18813' },
    { t: "Economie.gouv — montant des cotisations sociales (06/03/2026)", u: 'https://www.economie.gouv.fr/entreprises/gerer-sa-micro-entreprise/micro-entreprises-quel-est-le-montant-de-vos-cotisations-sociales' },
    { t: "Urssaf — autoentrepreneur.urssaf.fr", u: 'https://www.autoentrepreneur.urssaf.fr' }
  ]
},
{
  id: 'franchise-tva',
  titre: "Franchise en base de TVA : seuils 2026",
  theme: 'fiscal', badge: 'vigueur', maj: '2026-11-23',
  resume: "Seuils inchangés en 2026 : 85 000 € / 93 500 € pour les ventes, 37 500 € / 41 250 € pour les services. Le seuil unique à 25 000 € a été abandonné.",
  motscles: 'tva franchise en base seuil majoré 2026 micro 85000 37500 facturer tva',
  contenu: `
  <table class="tbl"><thead><tr><th>Activité</th><th>Seuil de base</th><th>Seuil majoré</th></tr></thead><tbody>
    <tr><td>Ventes de marchandises, hébergement</td><td>85 000 €</td><td>93 500 €</td></tr>
    <tr><td>Prestations de services</td><td>37 500 €</td><td>41 250 €</td></tr>
  </tbody></table>
  <ul>
    <li>Sous le seuil de base : pas de TVA facturée (mention obligatoire sur les factures).</li>
    <li>Entre les deux seuils : la franchise continue jusqu'au 31 décembre de l'année, si l'année précédente est restée sous le seuil de base.</li>
    <li>Au-delà du seuil majoré : TVA due dès le jour du dépassement.</li>
  </ul>
  <div class="callout">Attention à la confusion fréquente : un micro-entrepreneur peut rester au régime micro tout en devenant redevable de la TVA (seuils TVA plus bas que les seuils micro).</div>
  <p>Le projet de seuil unique à 25 000 € a été abandonné ; aucune modification n'a été retenue dans la loi de finances 2026.</p>`,
  sources: [
    { t: "Justice.fr / Service-public — franchise en base de TVA", u: 'https://www.justice.fr/fiche/franchise-base-tva' },
    { t: "Bpifrance Création — franchise en base", u: 'https://bpifrance-creation.fr/encyclopedie/fiscalite-lentreprise/tva/franchise-base-tva' }
  ]
},
{
  id: 'facturation-electronique',
  titre: "Facturation électronique : le calendrier",
  theme: 'gestion', badge: 'vigueur', maj: '2026-11-23',
  resume: "Réception obligatoire pour toutes les entreprises depuis le 1er septembre 2026 ; émission obligatoire pour les PME, TPE et micro-entreprises au 1er septembre 2027.",
  motscles: 'facturation électronique facture e-invoicing plateforme agréée 2026 2027 réception émission e-reporting micro outils gratuits',
  contenu: `
  <table class="tbl"><thead><tr><th>Entreprise</th><th>Réception</th><th>Émission</th></tr></thead><tbody>
    <tr><td>Grandes entreprises et ETI</td><td>1er sept. 2026</td><td>1er sept. 2026</td></tr>
    <tr><td>PME, TPE, micro-entreprises</td><td>1er sept. 2026</td><td>1er sept. 2027</td></tr>
  </tbody></table>
  <h3>Ce que doit faire un créateur</h3>
  <ul>
    <li>Choisir dès la création une <strong>plateforme agréée</strong> (liste officielle publiée par l'administration).</li>
    <li>Être capable de recevoir des factures électroniques dès maintenant.</li>
    <li>Préparer l'émission au plus tard pour le 1er septembre 2027, avec les nouvelles mentions obligatoires (SIREN du client notamment).</li>
  </ul>
  <h3>Outils gratuits cités par les consultants</h3>
  <p>Henrri, Tiime, ou l'offre gratuite de la banque du porteur : vérifier systématiquement qu'ils passent par une plateforme agréée.</p>`,
  sources: [
    { t: "Service-public — calendrier de la facturation électronique", u: 'https://entreprendre.service-public.gouv.fr/actualites/A15683' },
    { t: "Service-public — liste des plateformes agréées", u: 'https://entreprendre.service-public.gouv.fr/actualites/A17450' }
  ]
},
{
  id: 'cumul-emploi-retraite',
  titre: "Créer en étant retraité : le cumul emploi-retraite change en 2027",
  theme: 'social', badge: 'decret', maj: '2026-11-23',
  resume: "Nouvelles règles pour toute première pension de base prenant effet à partir du 1er janvier 2027. Les retraités partis avant ne sont pas concernés.",
  motscles: 'cumul emploi retraite 2027 retraité créer entreprise indépendant pension âge légal réforme lfss 2026',
  contenu: `
  <h3>Qui est concerné ?</h3>
  <p>Uniquement les personnes dont la <strong>première retraite de base</strong> prend effet à compter du 1er janvier 2027, quel que soit le régime (salarié, indépendant, libéral). Un porteur déjà retraité, ou dont la pension démarre au plus tard le 1er décembre 2026, reste aux règles actuelles.</p>
  <h3>Le principe des nouvelles règles</h3>
  <ul>
    <li>Le cumul dépend désormais de l'âge du retraité pendant qu'il travaille.</li>
    <li><strong>Avant l'âge légal</strong> : les revenus d'activité sont déduits de la pension dès le premier euro.</li>
    <li>Pour un indépendant, les revenus retenus sont ceux qui servent au calcul de ses cotisations sociales.</li>
    <li>Un indépendant n'est pas tenu de cesser son activité pour percevoir sa retraite.</li>
  </ul>
  <div class="callout warn"><strong>Enjeu fort pour nos publics :</strong> un salarié en fin de PSE / RCC qui prévoit de liquider sa retraite et de créer doit comparer les deux calendriers (liquidation avant ou après le 1er janvier 2027). Orienter vers une étude retraite personnalisée et le simulateur de l'Assurance retraite.</div>`,
  sources: [
    { t: "Service-public — nouvelles règles du cumul emploi-retraite (22/05/2026)", u: 'https://www.service-public.gouv.fr/particuliers/actualites/A18914' },
    { t: "L'Assurance retraite — cumul emploi-retraite", u: 'https://www.lassuranceretraite.fr/portail-info/sites/pub/hors-menu/actualites-nationales/retraite/2026/cumul-emploi-retraite.html' },
    { t: "Bpifrance Création — créer en étant retraité", u: 'https://bpifrance-creation.fr/encyclopedie/etapes-creation-dune-entreprise/definir-son-projet-personnel-createur/retraite' }
  ]
},
{
  id: 'choisir-statut',
  titre: "Choisir son statut : micro, EI, EURL ou SASU",
  theme: 'statuts', badge: 'vigueur', maj: '2026-11-23',
  resume: "Les critères qui comptent pour nos publics : chômage, protection sociale, rémunération, crédibilité et coût de gestion.",
  motscles: 'statut juridique choisir micro ei eurl sasu sas sarl tns assimilé salarié dividendes comparatif',
  contenu: `
  <table class="tbl"><thead><tr><th></th><th>Micro-entreprise</th><th>EI au réel</th><th>EURL (IS)</th><th>SASU</th></tr></thead><tbody>
    <tr><td>Régime social du dirigeant</td><td>Indépendant, cotisations sur le CA</td><td>Indépendant, sur le bénéfice</td><td>Indépendant (gérant associé unique)</td><td>Assimilé salarié</td></tr>
    <tr><td>Coût social</td><td>Faible et proportionnel</td><td>Moyen</td><td>Moyen</td><td>Élevé sur la rémunération</td></tr>
    <tr><td>Charges déductibles</td><td>Non (abattement forfaitaire)</td><td>Oui</td><td>Oui</td><td>Oui</td></tr>
    <tr><td>Pas de rémunération au démarrage</td><td>—</td><td>—</td><td>Possible</td><td>Possible, aucune cotisation</td></tr>
    <tr><td>Formalisme et comptabilité</td><td>Très léger</td><td>Moyen</td><td>Plus lourd</td><td>Plus lourd</td></tr>
    <tr><td>Associés plus tard</td><td>Non</td><td>Non</td><td>Oui (devient SARL)</td><td>Oui (devient SAS)</td></tr>
  </tbody></table>
  <h3>Les questions à poser au porteur</h3>
  <ol>
    <li>A-t-il des droits ARE et veut-il les préserver ? (la SASU sans rémunération est souvent choisie pour maximiser le maintien)</li>
    <li>Quel niveau de charges réelles ? Au-delà de l'abattement forfaitaire, la micro devient pénalisante.</li>
    <li>A-t-il besoin d'une bonne couverture sociale (prévoyance, retraite) ?</li>
    <li>Ses clients exigent-ils une société ? Prévoit-il des associés ou une levée de fonds ?</li>
  </ol>
  <p>Toute recommandation de statut doit être confirmée par un expert-comptable avant immatriculation.</p>`,
  sources: [
    { t: "Bpifrance Création — choisir son statut", u: 'https://bpifrance-creation.fr' },
    { t: "Urssaf — simulateurs mon-entreprise", u: 'https://mon-entreprise.urssaf.fr' }
  ]
},
{
  id: 'prets-honneur',
  titre: "Financer le démarrage : prêts d'honneur, garanties et microcrédit",
  theme: 'financement', badge: 'vigueur', maj: '2026-11-23',
  resume: "Les leviers qui font effet levier sur la banque : prêt d'honneur à taux zéro, garantie Bpifrance / France Active, microcrédit Adie.",
  motscles: 'financement prêt honneur initiative france réseau entreprendre france active adie microcrédit bpifrance garantie banque apport',
  contenu: `
  <h3>Les réseaux à connaître</h3>
  <ul>
    <li><strong>Initiative France</strong> : prêt d'honneur personnel à taux zéro, sans garantie, accordé après passage en comité, et parrainage.</li>
    <li><strong>Réseau Entreprendre</strong> : prêt d'honneur plus élevé pour des projets créateurs d'emplois, avec accompagnement par un chef d'entreprise.</li>
    <li><strong>France Active</strong> : garanties bancaires et financements solidaires, notamment pour les demandeurs d'emploi et l'ESS.</li>
    <li><strong>Adie</strong> : microcrédit pour les porteurs qui n'ont pas accès au crédit bancaire classique.</li>
    <li><strong>Bpifrance</strong> : garantie des prêts bancaires de création.</li>
  </ul>
  <h3>Ce qui rend un dossier finançable</h3>
  <ul>
    <li>Un apport personnel visible (la prime création PSE/RCC et l'ARCE peuvent y contribuer).</li>
    <li>Un prévisionnel cohérent : trésorerie positive, seuil de rentabilité atteignable, rémunération réaliste du dirigeant.</li>
    <li>Une étude de marché qui justifie le chiffre d'affaires.</li>
  </ul>
  <p>Le <a href="#/outils/previsionnel-complet">prévisionnel complet IzyCréa</a> produit les tableaux attendus par ces réseaux.</p>`,
  sources: [
    { t: "Initiative France", u: 'https://www.initiative-france.fr' },
    { t: "Réseau Entreprendre", u: 'https://www.reseau-entreprendre.org' },
    { t: "France Active", u: 'https://www.franceactive.org' },
    { t: "Adie", u: 'https://www.adie.org' }
  ]
},
{
  id: 'indemnites-pse-fiscalite',
  titre: "Indemnités de départ et création : points de fiscalité",
  theme: 'pse', badge: 'discussion', maj: '2026-11-23',
  resume: "Le régime fiscal des indemnités de rupture fait l'objet de discussions dans le projet de loi de finances 2027. Ne rien affirmer avant le vote définitif.",
  motscles: 'indemnités licenciement pse rcc fiscalité impôt exonération plf 2027 amendement date de rupture',
  contenu: `
  <h3>Ce qu'il faut savoir aujourd'hui</h3>
  <ul>
    <li>Les indemnités versées dans le cadre d'un PSE bénéficient aujourd'hui d'un régime fiscal et social spécifique.</li>
    <li>Le projet de loi de finances pour 2027 contient des dispositions sur le régime des indemnités de rupture ; un amendement discuté à l'automne 2026 prévoit que la date de la rupture (adhésion individuelle au dispositif collectif) déterminerait le régime applicable.</li>
  </ul>
  <div class="callout warn"><strong>Texte en discussion :</strong> tant que la loi de finances n'est pas promulguée, ne pas présenter ces règles comme acquises. Renvoyer le porteur vers un expert-comptable ou un avocat fiscaliste pour son cas.</div>
  <h3>Lien avec la création</h3>
  <p>Les indemnités sont souvent la principale source d'apport du porteur : dans le prévisionnel, distinguer ce qui est réellement mobilisable (après impôt éventuel et réserve de sécurité) de ce qui est apporté au capital.</p>`,
  sources: [
    { t: "Assemblée nationale — projet de loi de finances 2027", u: 'https://www.assemblee-nationale.fr' },
    { t: "Service-public — indemnité de licenciement", u: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F987' }
  ]
},
{
  id: 'handicap-adequation',
  titre: "Créer avec un handicap : questions pour valider l'adéquation personne / projet",
  theme: 'methode', badge: 'vigueur', maj: '2026-11-23',
  resume: "Une grille de questions pour aborder la santé et le handicap sans s'improviser médecin, et des relais à mobiliser.",
  motscles: 'handicap rqth santé aménagement invalidité prévoyance adéquation homme projet agefiph questions entretien',
  contenu: `
  <h3>Questions à poser en entretien</h3>
  <ol>
    <li>Avez-vous une reconnaissance administrative de handicap en cours de validité ?</li>
    <li>Au vu de cette reconnaissance, quels seraient vos besoins spécifiques pour exercer votre activité dans de bonnes conditions ?</li>
    <li>Avez-vous déjà bénéficié d'un aménagement de poste ? Qu'est-ce qui a bien ou moins bien fonctionné ?</li>
    <li>Quelles étaient les recommandations du médecin du travail ou du médecin traitant ?</li>
    <li>Quelles conséquences votre situation de santé peut-elle avoir sur l'activité (missions, trajets, installation, rythme) ?</li>
    <li>Quelles mesures avez-vous identifiées pour préserver votre santé dans ce projet ? Comment comptez-vous vous organiser ?</li>
    <li>Percevez-vous une pension d'invalidité ? Connaissez-vous les règles de cumul avec des revenus d'activité ?</li>
    <li>Quelle est la prise en charge de la prévoyance de votre employeur actuel, et que deviendra-t-elle après la création ?</li>
  </ol>
  <h3>Relais</h3>
  <p>L'Agefiph propose des aides spécifiques à la création d'entreprise par des personnes handicapées : à vérifier en amont du plan de financement.</p>`,
  sources: [
    { t: "Agefiph — créer son entreprise", u: 'https://www.agefiph.fr' },
    { t: "Service-public — RQTH", u: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1650' }
  ]
},
{
  id: 'protection-sociale-dirigeant',
  titre: "Protection sociale du dirigeant : mutuelle, prévoyance, retraite",
  theme: 'social', badge: 'vigueur', maj: '2026-11-23',
  resume: "En quittant le salariat, le porteur perd la mutuelle et la prévoyance de l'employeur. À intégrer dans le prévisionnel dès le départ.",
  motscles: 'protection sociale dirigeant mutuelle prévoyance retraite indépendant tns assimilé salarié portabilité madelin per',
  contenu: `
  <ul>
    <li><strong>Mutuelle :</strong> la portabilité de la mutuelle d'entreprise peut couvrir une période après la rupture ; prévoir ensuite un contrat individuel.</li>
    <li><strong>Prévoyance :</strong> les indépendants ont des indemnités journalières limitées ; une prévoyance individuelle (arrêt de travail, invalidité, décès) est souvent indispensable, surtout si le foyer dépend de ce revenu.</li>
    <li><strong>Retraite :</strong> en micro-entreprise, les droits dépendent du chiffre d'affaires déclaré ; un faible CA valide peu de trimestres.</li>
    <li><strong>Statut :</strong> le président de SASU rémunéré relève du régime général (meilleure couverture, coût plus élevé) ; le gérant d'EURL et l'entrepreneur individuel relèvent du régime des indépendants.</li>
  </ul>
  <p>Dans le prévisionnel : prévoir une ligne <em>Assurances personnelles</em> dans les charges.</p>`,
  sources: [
    { t: "Bpifrance Création — protection sociale du dirigeant", u: 'https://bpifrance-creation.fr' },
    { t: "Urssaf — indépendants", u: 'https://www.urssaf.fr/accueil/independant.html' }
  ]
},
{
  id: 'etapes-creation',
  titre: "Les étapes d'une création, de l'idée à l'immatriculation",
  theme: 'methode', badge: 'vigueur', maj: '2026-11-23',
  resume: "Le fil conducteur d'un accompagnement création, avec les outils IzyCréa à chaque étape.",
  motscles: 'étapes création entreprise parcours idée étude de marché business model prévisionnel immatriculation guichet unique',
  contenu: `
  <ol class="steps">
    <li><strong>Valider l'adéquation personne / projet</strong> : motivations, compétences, contraintes familiales et financières, santé.</li>
    <li><strong>Étudier le marché</strong> : clients, concurrents, prix pratiqués. Le dossier projecteur Bpifrance du métier est un bon point de départ (<a href="#/projecteurs">annuaire</a>).</li>
    <li><strong>Construire le modèle économique</strong> avec le <a href="#/outils/bmc">business model canvas</a>.</li>
    <li><strong>Chiffrer</strong> avec le <a href="#/outils/previsionnel-micro">prévisionnel simple</a> ou le <a href="#/outils/previsionnel-complet">prévisionnel complet</a>.</li>
    <li><strong>Choisir le statut</strong> et sécuriser les aides (ARCE ou maintien ARE, Acre, prime PSE/RCC).</li>
    <li><strong>Financer</strong> : apport, prêt d'honneur, banque.</li>
    <li><strong>Formaliser</strong> avec le <a href="#/outils/dossier">dossier de présentation</a> pour la commission ou le financeur.</li>
    <li><strong>Immatriculer</strong> sur le guichet unique, puis demander l'Acre dans les délais.</li>
  </ol>`,
  sources: [
    { t: "Guichet unique des formalités d'entreprises", u: 'https://formalites.entreprises.gouv.fr' },
    { t: "Bpifrance Création", u: 'https://bpifrance-creation.fr' }
  ]
}
];
