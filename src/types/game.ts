export interface Position {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  side: 'left' | 'right';
  position: Position;
  speed: number;
  width: number;
  height: number;
  color: string;
  word: string;
  typedLength: number;
}
