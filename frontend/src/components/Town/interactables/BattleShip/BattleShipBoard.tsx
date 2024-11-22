import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BattleShipBoardMarker, BattleShipBoardPiece } from '../../../../types/CoveyTownSocket';

const RESOURCE_PATH = '';

interface BattleShipBoardProps {
  initialBoard: readonly (readonly BattleShipBoardPiece[])[];
  displayInitialBoard: boolean;
  markerBoard: readonly (readonly BattleShipBoardMarker[])[];
  width?: number;
  onCellClick?(x: number, y: number): void;
}

/**
 * This component renders a single board for BattleShip. It cannot be used for constructing a board.
 * However, it does support rerendering based on new information, and it wraps click events for simpler handling.
 *
 * Description of props:
 * initialBoard: The ship layout that the board may or may not render
 * displayInitialBoard: A toggle for displaying initialBoard
 * markerBoard: The layout for markers that the board will render
 * width: The width and height of this component in pixels excluding its border (which is an additional 10%
 *   of its width)
 * onCellClick: The callback which is invoked when a cell on the board is clicked (the row and column
 *   (each 0-9) of the clicked cell are passed as arguments)
 *
 * When any of the props change (other than onCellClick), the component is rerendered.
 * @param initialBoard The props for the BattleShipBoard
 */
export function BattleShipBoard({
  initialBoard,
  displayInitialBoard,
  markerBoard,
  width = 400,
  onCellClick = () => {},
}: BattleShipBoardProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hitMarker] = useState<HTMLImageElement>(new Image());
  const [missMarker] = useState<HTMLImageElement>(new Image());

  function processCanvasClick(event: React.MouseEvent<HTMLCanvasElement>): void {
    const canvas = canvasRef?.current;
    if (canvas === null) return;
    const canvasRect = canvas.getBoundingClientRect();
    const borderWidth = width / 50;
    const cellWidth = width / 10;
    const clickX = Math.floor(event.pageX - canvasRect.x) - borderWidth;
    const clickY = Math.floor(event.pageY - canvasRect.y) - borderWidth + 1;
    if (clickX < 0 || clickX >= width || clickY < 0 || clickY >= width) return;
    const cellX = Math.floor(clickX / cellWidth);
    const cellY = Math.floor(clickY / cellWidth);
    onCellClick(cellX, cellY);
  }

  const renderBoard = useCallback(() => {
    const context = canvasRef.current?.getContext('2d');
    const cellWidth = width / 10;
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
    // Note that this is pretty much going to completely change due to not having the sprites yet.
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
  }, [displayInitialBoard, hitMarker, initialBoard, markerBoard, missMarker, width]);

  useEffect(() => {
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
      renderBoard();
    }
    waitForImages();
  }, [hitMarker, renderBoard, missMarker]);
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={width}
      style={{ border: `${width / 50}px solid` }}
      onClick={processCanvasClick}></canvas>
  );
}
