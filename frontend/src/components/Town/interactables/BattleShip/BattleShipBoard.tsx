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
  const [destroyerVertical] = useState<HTMLImageElement>(new Image());
  const [destroyerHorizontal] = useState<HTMLImageElement>(new Image());
  const [submarineVertical] = useState<HTMLImageElement>(new Image());
  const [submarineHorizontal] = useState<HTMLImageElement>(new Image());
  const [cruiserVertical] = useState<HTMLImageElement>(new Image());
  const [cruiserHorizontal] = useState<HTMLImageElement>(new Image());
  const [battleshipVertical] = useState<HTMLImageElement>(new Image());
  const [battleshipHorizontal] = useState<HTMLImageElement>(new Image());
  const [carrierVertical] = useState<HTMLImageElement>(new Image());
  const [carrierHorizontal] = useState<HTMLImageElement>(new Image());
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
    if (displayInitialBoard && initialBoard.length === 10) {
      const missingShips: BattleShipBoardPiece[] = [
        'Destroyer',
        'Submarine',
        'Cruiser',
        'Battleship',
        'Carrier',
      ];
      const shipSizes = new Map<BattleShipBoardPiece, number>([
        ['Destroyer', 2],
        ['Submarine', 3],
        ['Cruiser', 3],
        ['Battleship', 4],
        ['Carrier', 5],
      ]);
      for (let i = 0; i < 10; i++)
        for (let j = 0; j < 10; j++) {
          if (initialBoard[i][j] && missingShips.includes(initialBoard[i][j])) {
            let verticalImage = destroyerVertical;
            let horizontalImage = destroyerHorizontal;
            const ship = initialBoard[i][j];
            const shipLength = shipSizes.get(ship) ?? 0;
            switch (ship) {
              case 'Submarine':
                verticalImage = submarineVertical;
                horizontalImage = submarineHorizontal;
                break;
              case 'Cruiser':
                verticalImage = cruiserVertical;
                horizontalImage = cruiserHorizontal;
                break;
              case 'Battleship':
                verticalImage = battleshipVertical;
                horizontalImage = battleshipHorizontal;
                break;
              case 'Carrier':
                verticalImage = carrierVertical;
                horizontalImage = carrierHorizontal;
                break;
            }
            if (j + 1 < 10 && initialBoard[i][j + 1] === ship)
              context.drawImage(
                verticalImage,
                i * cellWidth,
                j * cellWidth,
                cellWidth,
                cellWidth * shipLength,
              );
            else
              context.drawImage(
                horizontalImage,
                i * cellWidth,
                j * cellWidth,
                cellWidth * shipLength,
                cellWidth,
              );
            missingShips.splice(
              missingShips.findIndex(value => value === ship),
              1,
            );
          }
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
  }, [
    battleshipHorizontal,
    battleshipVertical,
    carrierHorizontal,
    carrierVertical,
    cruiserHorizontal,
    cruiserVertical,
    destroyerHorizontal,
    destroyerVertical,
    displayInitialBoard,
    hitMarker,
    initialBoard,
    markerBoard,
    missMarker,
    submarineHorizontal,
    submarineVertical,
    width,
  ]);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context === null || context === undefined) return;
    destroyerVertical.src = RESOURCE_PATH + '/assets/BattleShip/destroyer_vertical.png';
    destroyerHorizontal.src = RESOURCE_PATH + '/assets/BattleShip/destroyer_horizontal.png';
    submarineVertical.src = RESOURCE_PATH + '/assets/BattleShip/submarine_vertical.png';
    submarineHorizontal.src = RESOURCE_PATH + '/assets/BattleShip/submarine_horizontal.png';
    cruiserVertical.src = RESOURCE_PATH + '/assets/BattleShip/cruiser_vertical.png';
    cruiserHorizontal.src = RESOURCE_PATH + '/assets/BattleShip/cruiser_horizontal.png';
    battleshipVertical.src = RESOURCE_PATH + '/assets/BattleShip/battleship_vertical.png';
    battleshipHorizontal.src = RESOURCE_PATH + '/assets/BattleShip/battleship_horizontal.png';
    carrierVertical.src = RESOURCE_PATH + '/assets/BattleShip/carrier_vertical.png';
    carrierHorizontal.src = RESOURCE_PATH + '/assets/BattleShip/carrier_horizontal.png';
    hitMarker.src = RESOURCE_PATH + '/assets/BattleShip/hit.svg';
    missMarker.src = RESOURCE_PATH + '/assets/BattleShip/miss.svg';
    async function waitForImages() {
      // This compact way of waiting for the images to load was created using the following link as a reference:
      // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#creating_images_from_scratch
      await Promise.all(
        [
          destroyerVertical,
          destroyerHorizontal,
          submarineVertical,
          submarineHorizontal,
          cruiserVertical,
          cruiserHorizontal,
          battleshipVertical,
          battleshipHorizontal,
          carrierVertical,
          carrierHorizontal,
          hitMarker,
          missMarker,
        ].map(image => new Promise(resolve => image.addEventListener('load', resolve))),
      );
      renderBoard();
    }
    waitForImages();
  }, [
    battleshipHorizontal,
    battleshipVertical,
    carrierHorizontal,
    carrierVertical,
    cruiserHorizontal,
    cruiserVertical,
    destroyerHorizontal,
    destroyerVertical,
    hitMarker,
    missMarker,
    renderBoard,
    submarineHorizontal,
    submarineVertical,
  ]);
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={width}
      style={{ border: `${width / 50}px solid`, userSelect: 'none' }}
      onClick={processCanvasClick}
    />
  );
}
