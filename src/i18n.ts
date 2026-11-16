import type { Language } from './types';

export interface CopyBundle {
  headline: string;
  placeholder: string;
  submitLabel: string;
  platformLabels: {
    both: string;
    fiverr: string;
    malt: string;
  };
  examplesTitle: string;
  examples: string[];
  loadingTitle: string;
  loadingSteps: string[];
  resultsTitle: string;
  resultsSubtitle: string;
  newPitch: string;
  editPitch: string;
  filterAll: string;
  rateLabel: string;
  descriptionLabel: string;
  matchLabel: string;
  responseLabel: string;
  viewDetails: string;
  openOnPlatform: (platform: 'Fiverr' | 'Malt') => string;
  modal: {
    whyMatch: string;
    about: string;
    deliverables: string;
    skills: string;
    experience: string;
    responseTime: string;
    location: string;
    rate: string;
    rating: string;
    close: string;
    visitProfile: (platform: 'Fiverr' | 'Malt') => string;
  };
  errorGeneric: string;
  retry: string;
}

export const COPY: Record<Language, CopyBundle> = {
  fr: {
    headline: 'Pitch nous ton idée, on s’occupe du reste',
    placeholder:
      'Décris ton idée de projet, tes objectifs, ton budget ou les compétences que tu recherches...',
    submitLabel: 'Trouver les 10 meilleurs freelances',
    platformLabels: {
      both: 'Fiverr & Malt',
      fiverr: 'Fiverr uniquement',
      malt: 'Malt uniquement',
    },
    examplesTitle: 'Exemples de pitchs :',
    examples: [
      'Application mobile iOS & Android de coaching sportif IA avec paiements Stripe',
      'Identité visuelle complète, logo et design system Figma pour une fintech B2B',
      'SaaS B2B Next.js + Supabase pour automatiser la facturation des artisans',
      'Campagne de lancement vidéo 3D Motion Design et publicités TikTok / Meta Ads',
    ],
    loadingTitle: 'Recherche des meilleurs profils en cours',
    loadingSteps: [
      'Analyse approfondie de ton pitch et des besoins techniques',
      'Identification des expertises et livrables critiques',
      'Exploration des profils vérifiés sur Fiverr et Malt',
      'Classement final du Top 10 sur-mesure',
    ],
    resultsTitle: 'Top 10 Freelances sélectionnés',
    resultsSubtitle: 'Profils classés par pertinence pour ton projet',
    newPitch: 'Nouveau pitch',
    editPitch: 'Modifier le pitch',
    filterAll: 'Tous',
    rateLabel: 'Tarif',
    descriptionLabel: 'Présentation',
    matchLabel: 'Pourquoi ce profil',
    responseLabel: 'Réponse',
    viewDetails: 'Voir la fiche complète',
    openOnPlatform: (platform) => `Voir sur ${platform}`,
    modal: {
      whyMatch: 'Pourquoi ce profil correspond à ton idée',
      about: 'Présentation du freelance',
      deliverables: 'Livrables clés pour ton projet',
      skills: 'Compétences principales',
      experience: 'Expérience',
      responseTime: 'Temps de réponse',
      location: 'Localisation',
      rate: 'Tarif indicatif',
      rating: 'Note',
      close: 'Fermer',
      visitProfile: (platform) => `Accéder à sa page sur ${platform}`,
    },
    errorGeneric: 'Impossible de finaliser la recherche pour le moment.',
    retry: 'Réessayer',
  },
  en: {
    headline: 'Pitch us your idea, we handle the rest',
    placeholder:
      'Describe your project idea, goals, timeline, budget, or the skills you are looking for...',
    submitLabel: 'Find the top 10 freelancers',
    platformLabels: {
      both: 'Fiverr & Malt',
      fiverr: 'Fiverr only',
      malt: 'Malt only',
    },
    examplesTitle: 'Examples of pitches:',
    examples: [
      'iOS & Android AI fitness coaching app with Stripe subscriptions',
      'Complete visual identity, logo, and Figma design system for a B2B fintech',
      'Next.js + Supabase B2B SaaS to automate invoicing for independent contractors',
      '3D motion design launch video and high-converting Meta / TikTok ad creatives',
    ],
    loadingTitle: 'Sourcing your top matching talent',
    loadingSteps: [
      'Analyzing your pitch and core project requirements',
      'Mapping essential skills and key deliverables',
      'Scanning verified freelancer profiles on Fiverr and Malt',
      'Ranking your personalized Top 10 shortlist',
    ],
    resultsTitle: 'Top 10 Selected Freelancers',
    resultsSubtitle: 'Ranked by relevance to your project pitch',
    newPitch: 'New pitch',
    editPitch: 'Edit pitch',
    filterAll: 'All',
    rateLabel: 'Rate',
    descriptionLabel: 'Overview',
    matchLabel: 'Why they fit',
    responseLabel: 'Response',
    viewDetails: 'View full profile',
    openOnPlatform: (platform) => `View on ${platform}`,
    modal: {
      whyMatch: 'Why this profile fits your pitch',
      about: 'About the freelancer',
      deliverables: 'Key deliverables for your project',
      skills: 'Core skills',
      experience: 'Experience',
      responseTime: 'Response time',
      location: 'Location',
      rate: 'Indicative rate',
      rating: 'Rating',
      close: 'Close',
      visitProfile: (platform) => `Open profile on ${platform}`,
    },
    errorGeneric: 'Unable to complete the search right now.',
    retry: 'Try again',
  },
};
