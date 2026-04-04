export type Lang = 'fr' | 'en';

const translations = {
  fr: {
    // Navigation
    nav_map: 'Carte',
    nav_compare: 'Comparer',
    nav_rankings: 'Classements',
    nav_analytics: 'Analyses',
    nav_contact: 'Contact',
    nav_about: 'À propos',

    // Header
    app_title: 'Leave Network Explorer',
    app_subtitle: 'International Review of Leave Policies 2025',

    // Indicateurs
    ind_maternity_total: 'Congé maternité (total)',
    ind_maternity_wellPaid: 'Congé maternité (bien payé)',
    ind_paternity_total: 'Congé paternité (total)',
    ind_paternity_wellPaid: 'Congé paternité (bien payé)',
    ind_parental_total: 'Congé parental (total)',
    ind_parental_wellPaid: 'Congé parental (bien payé)',
    ind_total_leave: 'Total congés payés (tous types)',
    ind_gender_equality: 'Score égalité des genres',
    ind_generosity: 'Score de générosité',

    // Barre de stats
    stats_countries: 'Pays couverts',
    stats_avg: 'Moyenne',
    stats_median: 'Médiane',
    stats_max: 'Maximum',
    stats_min: 'Minimum',

    // Dashboard
    dashboard_indicator_label: 'Indicateur affiché sur la carte',

    // Liste pays
    search_placeholder: 'Rechercher un pays...',
    all_regions: 'Toutes les régions',
    no_countries: 'Aucun pays trouvé',

    // Détail pays
    federal_state: 'État fédéral',
    variations: 'Variations',
    generosity: 'Générosité',
    gender_equality: 'Égalité des genres',
    leave_timeline: 'Chronologie des congés',
    maternity_leave: 'Congé de maternité',
    paternity_leave: 'Congé de paternité',
    parental_leave: 'Congé parental',
    childcare_leave: "Congé de garde d'enfants",
    entitlement_type: 'Type de droit',
    individual: 'Individuel',
    family: 'Familial',
    mixed: 'Mixte',
    mother_quota: 'Quota mère',
    father_quota: 'Quota père',
    paid: 'Payé',
    unpaid: 'Non payé',
    other_measures: 'Autres mesures',
    sick_child_leave: 'Congé enfant malade',
    breastfeeding: 'Allaitement',
    flexible_work: 'Travail flexible',
    domestic_violence: 'Violence domestique',
    bereavement: 'Congé deuil',
    ecec: "Garde d'enfants (ECEC)",
    universal_entitlement: 'Droit universel',
    entitlement_age: "Âge d'accès",
    gap_after_leave: 'Écart après congé',
    recent_changes: 'Changements récents (2024/25)',
    subnational_variations: 'Variations infranationales',
    total_duration: 'Durée totale',
    paid_duration: 'Durée payée',
    well_paid: 'Bien payé',
    rate: 'Taux',
    mandatory: 'Obligatoire',
    transferable: 'Transférable',
    part_time: 'Temps partiel',
    in_blocks: 'En blocs',
    yes: 'Oui',
    no: 'Non',
    na: 'N/A',
    compare_btn: '+ Comparer',

    // Timeline
    timeline_maternity: 'Maternité',
    timeline_paternity: 'Paternité',
    timeline_parental: 'Parental',
    timeline_childcare: 'Garde',
    timeline_ecec_right: 'Droit à la garde dès',
    timeline_months: 'mois',
    timeline_gap: 'écart',
    timeline_no_leave: 'Aucun congé statutaire disponible',

    // Analyses
    analytics_title: 'Analyses avancées',
    analytics_scatter_title: 'Égalité des genres vs Générosité',
    analytics_scatter_desc:
      'Chaque point représente un pays. Les pays généreux ne sont pas nécessairement égalitaires.',
    analytics_generosity_axis: 'Score de générosité',
    analytics_gender_axis: 'Égalité des genres',
    analytics_gap_title: "Écart congé - garde d'enfants (ECEC)",
    analytics_gap_desc:
      "Mois entre la fin du congé parental et le droit ECEC. Positif = période sans couverture.",
    analytics_gap_months: 'mois',
    analytics_reforms_title: 'Réformes 2024/25 — Direction des changements',
    analytics_reforms_desc: 'Nombre de réformes par type parmi les 52 pays.',
    analytics_expansion: 'Expansion',
    analytics_introduction: 'Introduction',
    analytics_recalibration: 'Recalibration',
    analytics_cutback: 'Restriction',
    analytics_abolition: 'Abolition',
    analytics_no_paternity: 'Pays sans congé de paternité payé',
    analytics_no_leave: 'Pays sans congé payé national',

    // Comparaison
    compare_title: 'Comparer les pays',
    compare_placeholder: 'Ajouter un pays ou une province...',
    compare_hint: "Sélectionnez jusqu'à 5 pays à comparer",
    compare_radar_title: 'Profil comparatif',
    compare_maternity: 'Maternité (mois)',
    compare_paternity: 'Paternité (mois)',
    compare_parental: 'Parental (mois)',
    compare_generosity: 'Générosité',
    compare_gender: 'Égalité genres',
    compare_col_indicator: 'Indicateur',
    compare_row_mat_total: 'Maternité (total)',
    compare_row_mat_wellpaid: 'Maternité (bien payé)',
    compare_row_pat_total: 'Paternité (total)',
    compare_row_par_total: 'Parental (total)',
    compare_row_par_wellpaid: 'Parental (bien payé)',
    compare_row_entitlement: 'Type droit parental',
    compare_row_father_quota: 'Quota père',
    compare_row_sick: 'Congé enfant malade',
    compare_row_flex: 'Travail flexible',
    compare_row_ecec: 'ECEC universel',
    compare_row_generosity: 'Score générosité',
    compare_row_gender: 'Score égalité',
    compare_subnational: 'infranational',

    // Classements
    rankings_title: 'Classements',
    rankings_indicator: 'Indicateur',
    rankings_region: 'Région',
    rankings_count: 'Nombre de pays',
    rankings_include_sub: 'Inclure provinces/états',
    rankings_all: 'Toutes',
    rankings_col_rank: '#',
    rankings_col_country: 'Pays',
    rankings_col_region: 'Région',
    rankings_col_value: 'Valeur',
    rankings_top_all: 'Tous',

    // Types de changements
    change_expansion: 'Expansion',
    change_introduction: 'Introduction',
    change_cutback: 'Restriction',
    change_abolition: 'Abolition',
    change_recalibration: 'Recalibration',

    // Types d'entités
    entity_province: 'Province',
    entity_state: 'État',
    entity_canton: 'Canton',
    entity_entity: 'Entité',
    entity_sector: 'Secteur',
    entity_region: 'Région',
    entity_municipality: 'Municipalité',

    // Pied de page
    footer_indicative:
      'Données à titre indicatif — consulter les notes-pays pour les détails complets.',
    footer_made_by: 'Réalisé par',

    // Chargement / erreur
    loading: 'Chargement des données...',
    error_loading: 'Erreur de chargement des données.',

    // Contact
    contact_title: 'Me contacter',
    contact_subtitle: 'Pour toute question ou remarque, envoyez votre message.',
    contact_name: 'Nom',
    contact_name_placeholder: 'Votre nom',
    contact_email: 'Courriel',
    contact_email_placeholder: 'votre@courriel.com',
    contact_message: 'Message',
    contact_message_placeholder: 'Votre question ou commentaire...',
    contact_send: 'Envoyer le message',
    contact_sending: 'Envoi en cours...',
    contact_success_title: 'Message envoyé !',
    contact_success_desc: 'Merci. Je vous répondrai dans les meilleurs délais.',

    // À propos
    about_title: 'À propos du projet',
    about_subtitle: 'Sources, méthodologie et dictionnaire des données.',

    // Page infranationale
    sub_title: 'Entités infranationales',
    sub_subtitle: 'Provinces, États et régions avec régimes propres',
    sub_quebec_highlight: 'Québec — RQAP',
    sub_vs_federal: 'vs régime fédéral (AE)',
    sub_no_data: 'Aucune entité infranationale disponible.',
    sub_back: '← Retour',
    sub_filter_all: 'Tous les pays',
    sub_col_entity: 'Entité',
    sub_col_country: 'Pays',
    sub_col_maternity: 'Maternité',
    sub_col_paternity: 'Paternité',
    sub_col_parental: 'Parental',
    sub_col_notes: 'Notes',

    // Général
    months: 'mois',
    weeks: 'sem.',
    days_per_year: 'j/an',
    per_100: '/100',
  },

  en: {
    // Navigation
    nav_map: 'Map',
    nav_compare: 'Compare',
    nav_rankings: 'Rankings',
    nav_analytics: 'Analytics',
    nav_contact: 'Contact',
    nav_about: 'About',

    // Header
    app_title: 'Leave Network Explorer',
    app_subtitle: 'International Review of Leave Policies 2025',

    // Indicators
    ind_maternity_total: 'Maternity leave (total)',
    ind_maternity_wellPaid: 'Maternity leave (well-paid)',
    ind_paternity_total: 'Paternity leave (total)',
    ind_paternity_wellPaid: 'Paternity leave (well-paid)',
    ind_parental_total: 'Parental leave (total)',
    ind_parental_wellPaid: 'Parental leave (well-paid)',
    ind_total_leave: 'Total paid leave (all types)',
    ind_gender_equality: 'Gender equality score',
    ind_generosity: 'Generosity score',

    // Stats bar
    stats_countries: 'Countries covered',
    stats_avg: 'Average',
    stats_median: 'Median',
    stats_max: 'Maximum',
    stats_min: 'Minimum',

    // Dashboard
    dashboard_indicator_label: 'Indicator displayed on map',

    // Country list
    search_placeholder: 'Search for a country...',
    all_regions: 'All regions',
    no_countries: 'No countries found',

    // Country detail
    federal_state: 'Federal state',
    variations: 'Variations',
    generosity: 'Generosity',
    gender_equality: 'Gender equality',
    leave_timeline: 'Leave timeline',
    maternity_leave: 'Maternity leave',
    paternity_leave: 'Paternity leave',
    parental_leave: 'Parental leave',
    childcare_leave: 'Childcare leave',
    entitlement_type: 'Entitlement type',
    individual: 'Individual',
    family: 'Family',
    mixed: 'Mixed',
    mother_quota: 'Mother quota',
    father_quota: 'Father quota',
    paid: 'Paid',
    unpaid: 'Unpaid',
    other_measures: 'Other measures',
    sick_child_leave: 'Sick child leave',
    breastfeeding: 'Breastfeeding',
    flexible_work: 'Flexible work',
    domestic_violence: 'Domestic violence leave',
    bereavement: 'Bereavement leave',
    ecec: 'Childcare (ECEC)',
    universal_entitlement: 'Universal entitlement',
    entitlement_age: 'Entitlement age',
    gap_after_leave: 'Gap after leave',
    recent_changes: 'Recent changes (2024/25)',
    subnational_variations: 'Subnational variations',
    total_duration: 'Total duration',
    paid_duration: 'Paid duration',
    well_paid: 'Well-paid',
    rate: 'Rate',
    mandatory: 'Mandatory',
    transferable: 'Transferable',
    part_time: 'Part-time',
    in_blocks: 'In blocks',
    yes: 'Yes',
    no: 'No',
    na: 'N/A',
    compare_btn: '+ Compare',

    // Timeline
    timeline_maternity: 'Maternity',
    timeline_paternity: 'Paternity',
    timeline_parental: 'Parental',
    timeline_childcare: 'Childcare',
    timeline_ecec_right: 'ECEC right from',
    timeline_months: 'months',
    timeline_gap: 'gap',
    timeline_no_leave: 'No statutory leave available',

    // Analytics
    analytics_title: 'Advanced analytics',
    analytics_scatter_title: 'Gender equality vs Generosity',
    analytics_scatter_desc:
      'Each dot represents a country. Generous countries are not necessarily equal.',
    analytics_generosity_axis: 'Generosity score',
    analytics_gender_axis: 'Gender equality',
    analytics_gap_title: 'Leave-to-childcare gap (ECEC)',
    analytics_gap_desc:
      'Months between end of parental leave and ECEC entitlement. Positive = coverage gap.',
    analytics_gap_months: 'months',
    analytics_reforms_title: 'Reforms 2024/25 — Direction of changes',
    analytics_reforms_desc: 'Number of reforms by type across 52 countries.',
    analytics_expansion: 'Expansion',
    analytics_introduction: 'Introduction',
    analytics_recalibration: 'Recalibration',
    analytics_cutback: 'Cutback',
    analytics_abolition: 'Abolition',
    analytics_no_paternity: 'Countries without paid paternity leave',
    analytics_no_leave: 'Countries without national paid leave',

    // Compare
    compare_title: 'Compare countries',
    compare_placeholder: 'Add a country or province...',
    compare_hint: 'Select up to 5 countries to compare',
    compare_radar_title: 'Comparative profile',
    compare_maternity: 'Maternity (months)',
    compare_paternity: 'Paternity (months)',
    compare_parental: 'Parental (months)',
    compare_generosity: 'Generosity',
    compare_gender: 'Gender equality',
    compare_col_indicator: 'Indicator',
    compare_row_mat_total: 'Maternity (total)',
    compare_row_mat_wellpaid: 'Maternity (well-paid)',
    compare_row_pat_total: 'Paternity (total)',
    compare_row_par_total: 'Parental (total)',
    compare_row_par_wellpaid: 'Parental (well-paid)',
    compare_row_entitlement: 'Parental entitlement type',
    compare_row_father_quota: 'Father quota',
    compare_row_sick: 'Sick child leave',
    compare_row_flex: 'Flexible work',
    compare_row_ecec: 'Universal ECEC',
    compare_row_generosity: 'Generosity score',
    compare_row_gender: 'Equality score',
    compare_subnational: 'subnational',

    // Rankings
    rankings_title: 'Rankings',
    rankings_indicator: 'Indicator',
    rankings_region: 'Region',
    rankings_count: 'Number of countries',
    rankings_include_sub: 'Include provinces/states',
    rankings_all: 'All',
    rankings_col_rank: '#',
    rankings_col_country: 'Country',
    rankings_col_region: 'Region',
    rankings_col_value: 'Value',
    rankings_top_all: 'All',

    // Change types
    change_expansion: 'Expansion',
    change_introduction: 'Introduction',
    change_cutback: 'Cutback',
    change_abolition: 'Abolition',
    change_recalibration: 'Recalibration',

    // Entity types
    entity_province: 'Province',
    entity_state: 'State',
    entity_canton: 'Canton',
    entity_entity: 'Entity',
    entity_sector: 'Sector',
    entity_region: 'Region',
    entity_municipality: 'Municipality',

    // Footer
    footer_indicative:
      'Data provided for information purposes — consult country notes for full details.',
    footer_made_by: 'Built by',

    // Loading/error
    loading: 'Loading data...',
    error_loading: 'Failed to load data.',

    // Contact
    contact_title: 'Contact me',
    contact_subtitle: 'For any question or comment, send your message.',
    contact_name: 'Name',
    contact_name_placeholder: 'Your name',
    contact_email: 'Email',
    contact_email_placeholder: 'your@email.com',
    contact_message: 'Message',
    contact_message_placeholder: 'Your question or comment...',
    contact_send: 'Send message',
    contact_sending: 'Sending...',
    contact_success_title: 'Message sent!',
    contact_success_desc: 'Thank you. I will reply as soon as possible.',

    // About
    about_title: 'About the project',
    about_subtitle: 'Sources, methodology and data dictionary.',

    // Subnational page
    sub_title: 'Subnational entities',
    sub_subtitle: 'Provinces, states and regions with their own regimes',
    sub_quebec_highlight: 'Quebec — QPIP',
    sub_vs_federal: 'vs federal regime (EI)',
    sub_no_data: 'No subnational entities available.',
    sub_back: '← Back',
    sub_filter_all: 'All countries',
    sub_col_entity: 'Entity',
    sub_col_country: 'Country',
    sub_col_maternity: 'Maternity',
    sub_col_paternity: 'Paternity',
    sub_col_parental: 'Parental',
    sub_col_notes: 'Notes',

    // General
    months: 'months',
    weeks: 'wk.',
    days_per_year: 'd/yr',
    per_100: '/100',
  },
} as const;

export type TranslationKey = keyof typeof translations.fr;
export default translations;
