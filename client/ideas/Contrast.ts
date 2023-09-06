export interface Contrast {
 rg: number
 by: number
}

export const contrast_ranges = {
 contrast_min: 0,
 contrast_max: 0x7f,
}

export type ContrastColorQuad = [string, string, string, string]

export const contrast_tools = {
 create_contrast(charge: number): Contrast {
  return {
   by: charge * 0x10,
   rg: (0xf - charge) * 0x10,
  }
 },
 to_hex_colors(contrast: Contrast): ContrastColorQuad {
  function hex(value: number) {
   return value.toString(0x10).padStart(2, '0')
  }
  return [
   [0, 0],
   [0, 1],
   [1, 0],
   [1, 1],
  ].map(function ([i, j]) {
   const R = i * contrast.rg + (1 - j) * contrast.by
   const G = (1 - i) * contrast.rg + (1 - j) * contrast.by
   const B = j * contrast.by
   return `#${hex(R)}${hex(G)}${hex(B)}`
  }) as ContrastColorQuad
 },
}
