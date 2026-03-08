/**
 * Difficulty presets.
 *
 * sp  — fall speed in seconds per level [1..5]
 * si  — spawn interval in ms per level [1..5]
 * ms  — max misses before game over
 * wc  — word count per level
 */
export const DIFFICULTY = {
  easy:   { sp: [22, 20, 17, 14, 12], si: [4800, 4200, 3600, 3200, 2800], ms: 5, wc: 5 },
  normal: { sp: [18, 15, 12, 10, 9],  si: [4000, 3400, 2900, 2500, 2200], ms: 3, wc: 7 },
  hard:   { sp: [14, 12, 10, 8, 7],   si: [3200, 2700, 2300, 2000, 1700], ms: 2, wc: 9 },
};
