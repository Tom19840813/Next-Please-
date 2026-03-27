export const vibrate = (pattern: number | number[] = 10) => {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

export const lightTap = () => vibrate(10);
export const mediumTap = () => vibrate(25);
export const successPattern = () => vibrate([10, 50, 10]);
export const errorPattern = () => vibrate([50, 30, 50]);
