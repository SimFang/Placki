export type Language = 'fr' | 'en';
export type PlatformFilter = 'both' | 'fiverr' | 'malt';

export interface FreelancerProfile {
  rank: number;
  id: string;
  name: string;
  handle: string;
  platform: 'Fiverr' | 'Malt';
  title: string;
  location: string;
  rate: string;
  rating: string;
  reviewsCount: string;
  experience: string;
  responseTime: string;
  skills: string[];
  matchReason: string;
  bio: string;
  deliverables: string[];
  profileUrl: string;
  avatarUrl?: string;
  genderHint?: 'female' | 'male';
}

export interface MatchResponse {
  pitchSummary: string;
  detectedDomains: string[];
  freelancers: FreelancerProfile[];
}
