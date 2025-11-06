export interface AdSettings {
  id: string;
  ads_enabled: boolean;
  adsense_client_id: string | null;
  banner_ad_enabled: boolean;
  sidebar_ad_enabled: boolean;
  interstitial_ad_enabled: boolean;
  ad_frequency_games: number;
  updated_at: string;
  updated_by: string | null;
}

export interface AdContextType {
  adSettings: AdSettings | null;
  shouldShowAds: boolean;
  gamesPlayed: number;
  incrementGamesPlayed: () => void;
  shouldShowInterstitial: boolean;
  isLoading: boolean;
}

export type AdSize = 
  | 'horizontal' // 728x90 or 320x50
  | 'vertical' // 300x600 or 120x600
  | 'square' // 300x250 or 250x250
  | 'responsive';
