export enum Color {
  BLACK = 1,
  WHITE = -1,
  EMPTY = 0,
}

export function fromString(str: string): Color {
  if (str == 'BLACK') {
    return Color.BLACK
  } else if (str == 'WHITE') {
    return Color.WHITE
  } else if (str == 'EMPTY') {
    return Color.EMPTY
  }
  throw new Error('invalid color string found: ' + str)
}

export function opposite(color: Color): Color {
  if (color === Color.BLACK) return Color.WHITE;
  if (color === Color.WHITE) return Color.BLACK;
  else return color;
}
