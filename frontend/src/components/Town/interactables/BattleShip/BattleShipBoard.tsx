import React, { useCallback, useEffect, useRef, useState } from 'react';

const RESOURCE_PATH = '';

export function BattleShipBoard(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hitMarker] = useState<HTMLImageElement>(new Image());
  const [missMarker] = useState<HTMLImageElement>(new Image());

  const renderBoard = useCallback(() => {
    const context = canvasRef.current?.getContext('2d');
    const cellWidth = (canvasRef.current?.width ?? 0) / 10;
    console.log(`Width: ${cellWidth}`);
    if (context === null || context === undefined) return;
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        context.fillStyle = (i + j) % 2 == 0 ? 'blue' : 'cornflowerblue';
        context.fillRect(i * cellWidth, j * cellWidth, cellWidth, cellWidth);
        console.log(
          `Draw ${context.fillStyle} rect from (${i * cellWidth}, ${
            j * cellWidth
          }) with width = ${cellWidth}`,
        );
        if (i === 5 && j === 7) {
          context.drawImage(hitMarker, i * cellWidth, j * cellWidth, cellWidth, cellWidth);
        }
        if (i === 3 && j === 4) {
          context.drawImage(missMarker, i * cellWidth, j * cellWidth, cellWidth, cellWidth);
        }
      }
    }
  }, [hitMarker, missMarker]);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context === null || context === undefined) return;
    hitMarker.src = RESOURCE_PATH + '/assets/BattleShip/hit.svg';
    missMarker.src = RESOURCE_PATH + '/assets/BattleShip/miss.svg';
    async function waitForImages() {
      // This convenient way to wait for the images to load was created using the following link as a reference:
      // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#creating_images_from_scratch
      await Promise.all(
        [hitMarker, missMarker].map(
          image => new Promise(resolve => image.addEventListener('load', resolve)),
        ),
      );
      console.log('Got the images');
      renderBoard();
    }
    waitForImages();
  }, [hitMarker, renderBoard, missMarker]);
  return <canvas ref={canvasRef} height={400} width={400}></canvas>;
}
