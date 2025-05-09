export const CARD_VARIANT_EMBASSADOR = 'CARD_VARIANT_EMBASSADOR';
export const CARD_VARIANT_ASSASSIN = 'CARD_VARIANT_ASSASSIN';
export const CARD_VARIANT_DUKE = 'CARD_VARIANT_DUKE';
export const CARD_VARIANT_CONDESSA = 'CARD_VARIANT_CONDESSA';

export type CardVariant =
  typeof CARD_VARIANT_ASSASSIN |
  typeof CARD_VARIANT_EMBASSADOR |
  typeof CARD_VARIANT_DUKE |
  typeof CARD_VARIANT_CONDESSA;
