import { useFonts } from 'expo-font';
import {
  Cinzel_400Regular,
  Cinzel_700Bold,
  Cinzel_900Black,
} from '@expo-google-fonts/cinzel';
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_300Light_Italic,
  CormorantGaramond_400Regular_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';

export const CINZEL = 'Cinzel_700Bold';
export const CINZEL_BLACK = 'Cinzel_900Black';
export const CORMORANT = 'Cormorant Garamond';
export const CORMORANT_ITALIC = 'Cormorant Garamond Italic';
export const DM = 'DMSans_400Regular';
export const DM_LIGHT = 'DMSans_300Light';
export const DM_MEDIUM = 'DMSans_500Medium';

export const useSutraFonts = (): [boolean, Error | null] =>
  useFonts({
    Cinzel_400Regular,
    [CINZEL]: Cinzel_700Bold,
    [CINZEL_BLACK]: Cinzel_900Black,
    CormorantGaramond_300Light,
    [CORMORANT]: CormorantGaramond_400Regular,
    CormorantGaramond_300Light_Italic,
    [CORMORANT_ITALIC]: CormorantGaramond_400Regular_Italic,
    [DM_LIGHT]: DMSans_300Light,
    [DM]: DMSans_400Regular,
    [DM_MEDIUM]: DMSans_500Medium,
  });
