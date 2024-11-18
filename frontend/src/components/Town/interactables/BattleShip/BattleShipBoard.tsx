import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BattleShipBoardMarker, BattleShipBoardPiece } from '../../../../types/CoveyTownSocket';

const RESOURCE_PATH = '';

interface BattleShipBoardProps {
  initialBoard: BattleShipBoardPiece[][];
  displayInitialBoard: boolean;
  markerBoard: BattleShipBoardMarker[][];
  width?: number;
  height?: number;
}

export function BattleShipBoard({
  initialBoard,
  displayInitialBoard,
  markerBoard,
  width = 400,
  height = 400,
}: BattleShipBoardProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hitMarker] = useState<HTMLImageElement>(new Image());
  const [missMarker] = useState<HTMLImageElement>(new Image());

  const renderBoard = useCallback(() => {
    console.log('renderBoard called');
    const context = canvasRef.current?.getContext('2d');
    const cellWidth = (canvasRef.current?.width ?? 0) / 10;
    if (context === null || context === undefined) return;

    // Due to ship sprites taking up more than one cell, we have to use three separate loops
    // (one for each layer) instead of just one loop that does all three layers at once.
    // Render bottom layer: cell backgrounds
    for (let i = 0; i < 10; i++)
      for (let j = 0; j < 10; j++) {
        context.fillStyle = (i + j) % 2 == 0 ? 'blue' : 'cornflowerblue';
        context.fillRect(i * cellWidth, j * cellWidth, cellWidth, cellWidth);
      }
    // Render middle layer: ship sprites
    // Note that this is prety much going to completely change due to not having the sprites yet.
    if (displayInitialBoard && initialBoard.length === 10) {
      context.fillStyle = 'black';
      for (let i = 0; i < 10; i++)
        for (let j = 0; j < 10; j++) {
          if (initialBoard[i][j])
            context.fillRect(i * cellWidth, j * cellWidth, cellWidth, cellWidth);
        }
    }
    // Render top layer: markers
    if (markerBoard.length === 10)
      for (let i = 0; i < 10; i++)
        for (let j = 0; j < 10; j++) {
          if (markerBoard[i][j] === 'H')
            context.drawImage(hitMarker, i * cellWidth, j * cellWidth, cellWidth, cellWidth);
          else if (markerBoard[i][j] === 'M')
            context.drawImage(missMarker, i * cellWidth, j * cellWidth, cellWidth, cellWidth);
        }
  }, [displayInitialBoard, hitMarker, initialBoard, markerBoard, missMarker]);

  useEffect(() => {
    console.log('Initializer called');
    const context = canvasRef.current?.getContext('2d');
    if (context === null || context === undefined) return;
    hitMarker.src = RESOURCE_PATH + '/assets/BattleShip/hit.svg';
    missMarker.src = RESOURCE_PATH + '/assets/BattleShip/miss.svg';
    async function waitForImages() {
      // This compact way of waiting for the images to load was created using the following link as a reference:
      // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#creating_images_from_scratch
      await Promise.all(
        [hitMarker, missMarker].map(
          image => new Promise(resolve => image.addEventListener('load', resolve)),
        ),
      );
      console.log('waitForImages() resolved');
      renderBoard();
    }
    console.log('About to call waitForImages()');
    waitForImages();
  }, [hitMarker, renderBoard, missMarker]);
  return (
    <canvas
      ref={canvasRef}
      height={height}
      width={width}
      style={{ border: `${width / 50}px solid` }}></canvas>
  );
}
