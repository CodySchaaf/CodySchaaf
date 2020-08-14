const normal = function (big: number, canvasWidth: number, small?: number) {
  if (small === undefined) {
    small = 0;
  }
  return big + small * (canvasWidth / 3000);
};

export const pointsStartFn = function ({
  canvasWidth,
  letterXSize,
  letterYSize,
  baseYOffset,
  cXOffset,
  oXOffset,
  dXOffset,
  yXOffset,
}: {
  canvasWidth: number;
  letterXSize: number;
  letterYSize: number;
  baseYOffset: number;
  cXOffset: number;
  oXOffset: number;
  dXOffset: number;
  yXOffset: number;
}) {
  return {
    c1: [
      cXOffset - normal(letterXSize, canvasWidth),
      baseYOffset - normal(letterYSize, canvasWidth, 50),
    ],
    c2: [
      cXOffset - normal(letterXSize, canvasWidth, 50),
      baseYOffset - normal(letterYSize, canvasWidth),
    ],
    c3: [
      cXOffset - normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(letterYSize, canvasWidth),
    ],

    o1: [
      oXOffset - normal(letterXSize, canvasWidth),
      baseYOffset - normal(0, canvasWidth, 50),
    ],
    o2: [
      oXOffset + normal(letterXSize, canvasWidth),
      baseYOffset - normal(0, canvasWidth, 50),
    ],
    o3: [
      oXOffset - normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(0, canvasWidth),
    ],
    o4: [
      oXOffset - normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(letterYSize, canvasWidth),
    ],

    d1: [
      dXOffset - normal(letterXSize, canvasWidth),
      baseYOffset - normal(0, canvasWidth, 50),
    ],
    d2: [
      dXOffset + normal(letterXSize, canvasWidth),
      baseYOffset - normal(letterYSize, canvasWidth, 50),
    ],
    d3: [
      dXOffset - normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(0, canvasWidth),
    ],
    d4: [
      dXOffset - normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(letterYSize, canvasWidth),
    ],

    y1: [
      yXOffset - normal(letterXSize, canvasWidth),
      baseYOffset - normal(0, canvasWidth, 50),
    ],
    y2: [
      yXOffset + normal(letterXSize, canvasWidth),
      baseYOffset - normal(0, canvasWidth, 50),
    ],
    y3: [
      yXOffset - normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(letterYSize, canvasWidth),
    ],

    y4: [
      yXOffset + normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(letterYSize * 2, canvasWidth),
    ],
  };
};

export const pointsEndFn = function ({
  canvasWidth,
  letterXSize,
  letterYSize,
  baseYOffset,
  cXOffset,
  oXOffset,
  dXOffset,
  yXOffset,
}: {
  canvasWidth: number;
  letterXSize: number;
  letterYSize: number;
  baseYOffset: number;
  cXOffset: number;
  oXOffset: number;
  dXOffset: number;
  yXOffset: number;
}) {
  return {
    c1: [
      cXOffset - normal(letterXSize, canvasWidth),
      baseYOffset + normal(letterYSize, canvasWidth, 50),
    ],
    c2: [
      cXOffset + normal(letterXSize, canvasWidth, 50),
      baseYOffset - normal(letterYSize, canvasWidth),
    ],
    c3: [
      cXOffset + normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(letterYSize, canvasWidth),
    ],

    o1: [
      oXOffset - normal(letterXSize, canvasWidth),
      baseYOffset + normal(letterYSize, canvasWidth, 50),
    ],
    o2: [
      oXOffset + normal(letterXSize, canvasWidth),
      baseYOffset + normal(letterYSize, canvasWidth, 50),
    ],
    o3: [
      oXOffset + normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(0, canvasWidth),
    ],
    o4: [
      oXOffset + normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(letterYSize, canvasWidth),
    ],

    d1: [
      dXOffset - normal(letterXSize, canvasWidth),
      baseYOffset + normal(letterYSize, canvasWidth, 50),
    ],
    d2: [
      dXOffset + normal(letterXSize, canvasWidth),
      baseYOffset + normal(letterYSize, canvasWidth, 50),
    ],
    d3: [
      dXOffset + normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(0, canvasWidth),
    ],
    d4: [
      dXOffset + normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(letterYSize, canvasWidth),
    ],

    y1: [
      yXOffset - normal(letterXSize, canvasWidth),
      baseYOffset + normal(letterYSize, canvasWidth, 50),
    ],
    y2: [
      yXOffset + normal(letterXSize, canvasWidth),
      baseYOffset + normal(letterYSize * 2, canvasWidth, 50),
    ],
    y3: [
      yXOffset + normal(letterXSize, canvasWidth, 50),
      baseYOffset + normal(letterYSize, canvasWidth),
    ],

    y4: [
      yXOffset - normal(letterXSize * 20, canvasWidth, 50),
      baseYOffset + normal(letterYSize * 2, canvasWidth),
    ],
  };
};
