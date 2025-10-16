export type ElementType =
  | "deoxyribose"
  | "phosphate"
  | "adenine"
  | "thymine"
  | "guanine"
  | "cytosine"
  | "hydrogen-bond"
  | "phosphodiester-straight"
  | "phosphodiester-bent"
  | "chemical-bond"

export interface DNAElement {
  id: string
  type: ElementType
  x: number
  y: number
  rotation: number
  scale?: number
}
