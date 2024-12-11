import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BattleShipBoardPiece } from '../../../../types/CoveyTownSocket';

const RESOURCE_PATH = '';

class Ship {
  private readonly _piece: BattleShipBoardPiece;

  public readonly length: number;

  public x: number;

  public y: number;

  public isVertical: boolean;

  public verticalImage: HTMLImageElement;

  public horizontalImage: HTMLImageElement;

  private _restoreCell: (x: number, y: number) => void;

  private _drawShip: (x: number, y: number, ship: Ship) => void;

  constructor(
    piece: BattleShipBoardPiece,
    length: number,
    x: number,
    y: number,
    restoreCell: (x: number, y: number) => void,
    drawShip: (x: number, y: number, ship: Ship) => void,
    verticalImage: HTMLImageElement,
    horizontalImage: HTMLImageElement,
  ) {
    this._piece = piece;
    this.length = length;
    this.x = x;
    this.y = y;
    this.isVertical = true;
    this._restoreCell = restoreCell;
    this._drawShip = drawShip;
    this.verticalImage = verticalImage;
    this.horizontalImage = horizontalImage;
  }

  get piece() {
    return this._piece;
  }

  public erase() {
    if (this.isVertical)
      for (let i = 0; i < this.length; i++) this._restoreCell(this.x, this.y + i);
    else for (let i = 0; i < this.length; i++) this._restoreCell(this.x + i, this.y);
  }

  public draw() {
    this._drawShip(this.x, this.y, this);
  }
}

interface BattleShipSetupBoardProps {
  width?: number;
  deliverModifiedBoard?(newBoard: BattleShipBoardPiece[][]): void;
}

/**
 * This component renders and controls a setup board for BattleShip. The user can left click and drag ships to
 * move them and right click ships to rotate them. Whenever the setup board changes as a result of either of
 * these actions, the callback prop is invoked with the new board as a standard 2D array.
 *
 * Description of props:
 * width: The width of this component in pixels excluding its border (which is an additional 10%
 *   of its width) (height is derived from width)
 * deliverModifiedBoard: The callback which is invoked when the setup board changes, which may or may not end
 *   up changing the gameplay area of the board (a 2D array of pieces is passed as an argument)
 */
export function BattleShipSetupBoard({
  width = 640,
  deliverModifiedBoard = () => {},
}: BattleShipSetupBoardProps): JSX.Element {
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

  const [cellWidth, setCellWidth] = useState<number>(width / 16);
  useEffect(() => {
    setCellWidth(width / 16);
  }, [width]);

  const restoreCell = useCallback(
    (x: number, y: number) => {
      const context = canvasRef.current?.getContext('2d');
      if (context === null || context === undefined) return;

      if (x >= 0 && x <= 9) context.fillStyle = (x + y) % 2 == 0 ? 'blue' : 'cornflowerblue';
      else context.fillStyle = (x + y) % 2 == 0 ? 'gray' : 'silver';
      context.fillRect((x + 3) * cellWidth, y * cellWidth, cellWidth, cellWidth);
    },
    [cellWidth],
  );

  const drawShip = useCallback(
    (x: number, y: number, ship: Ship) => {
      const context = canvasRef.current?.getContext('2d');
      if (context === null || context === undefined) return;
      if (ship.isVertical)
        context.drawImage(
          ship.verticalImage,
          (x + 3) * cellWidth,
          y * cellWidth,
          cellWidth,
          cellWidth * ship.length,
        );
      else
        context.drawImage(
          ship.horizontalImage,
          (x + 3) * cellWidth,
          y * cellWidth,
          cellWidth * ship.length,
          cellWidth,
        );
    },
    [cellWidth],
  );

  const [ships] = useState<Ship[]>([
    new Ship('Destroyer', 2, -2, 0, restoreCell, drawShip, destroyerVertical, destroyerHorizontal),
    new Ship('Submarine', 3, -2, 3, restoreCell, drawShip, submarineVertical, submarineHorizontal),
    new Ship('Cruiser', 3, -2, 7, restoreCell, drawShip, cruiserVertical, cruiserHorizontal),
    new Ship(
      'Battleship',
      4,
      11,
      0,
      restoreCell,
      drawShip,
      battleshipVertical,
      battleshipHorizontal,
    ),
    new Ship('Carrier', 5, 11, 5, restoreCell, drawShip, carrierVertical, carrierHorizontal),
  ]);

  function generateModifiedBoard() {
    const newBoard: BattleShipBoardPiece[][] = [[], [], [], [], [], [], [], [], [], []];
    for (const ship of ships)
      if (ship.isVertical) {
        for (let i = 0; i < ship.length; i++)
          if (ship.x >= 0 && ship.x <= 9 && ship.y + i >= 0 && ship.y + i <= 9)
            newBoard[ship.x][ship.y + i] = ship.piece;
      } else {
        for (let i = 0; i < ship.length; i++)
          if (ship.y >= 0 && ship.y <= 9 && ship.x + i >= 0 && ship.x + i <= 9)
            newBoard[ship.x + i][ship.y] = ship.piece;
      }
    deliverModifiedBoard(newBoard);
  }

  const [targetX, setTargetX] = useState<number>();
  const [targetY, setTargetY] = useState<number>();

  function targetedShip(
    x: number | undefined = undefined,
    y: number | undefined = undefined,
  ): Ship | undefined {
    if (x === undefined) x = targetX;
    if (y === undefined) y = targetY;
    if (x === undefined || y === undefined) return undefined;
    let targetShip: Ship | undefined;
    for (const ship of ships)
      if (ship.isVertical) {
        if (x === ship.x && y >= ship.y && y < ship.y + ship.length) {
          targetShip = ship;
          break;
        }
      } else {
        if (y === ship.y && x >= ship.x && x < ship.x + ship.length) {
          targetShip = ship;
          break;
        }
      }
    return targetShip;
  }

  function existsSpaceForMove(
    targetShip: Ship,
    newX: number,
    newY: number,
    toBeVertical: boolean,
  ): boolean {
    if (newX < -3 || newX > 12 || newY < 0 || newY > 9) return false;
    const neededX: number[] = [];
    const neededY: number[] = [];
    if (toBeVertical) {
      neededX.push(newX);
      for (let i = 0; i < targetShip.length; i++) neededY.push(newY + i);
    } else {
      neededY.push(newY);
      for (let i = 0; i < targetShip.length; i++) neededX.push(newX + i);
    }
    for (const potentialX of neededX) if (potentialX < -3 || potentialX > 12) return false;
    for (const potentialY of neededY) if (potentialY < 0 || potentialY > 9) return false;
    for (const ship of ships) {
      if (ship === targetShip) continue;
      if (ship.isVertical) {
        for (let i = 0; i < ship.length; i++)
          if (neededX.includes(ship.x) && neededY.includes(ship.y + i)) return false;
      } else {
        for (let i = 0; i < ship.length; i++)
          if (neededY.includes(ship.y) && neededX.includes(ship.x + i)) return false;
      }
    }
    return true;
  }

  function processCellDrag(cellX: number, cellY: number) {
    if (targetX === undefined || targetY === undefined) return;
    if (targetX === cellX && targetY === cellY) return;

    // Find ship that is currently "grabbed"
    const targetShip = targetedShip();
    if (targetShip === undefined) return;

    // Determine whether there is space to move the ship
    const newX = targetShip.x + (cellX - targetX);
    const newY = targetShip.y + (cellY - targetY);
    if (!existsSpaceForMove(targetShip, newX, newY, targetShip.isVertical)) return;

    // Move the ship and deliver updated board
    targetShip.erase();
    targetShip.x = newX;
    targetShip.y = newY;
    targetShip.draw();
    setTargetX(cellX);
    setTargetY(cellY);
    generateModifiedBoard();
  }

  function processCellRotate(cellX: number, cellY: number) {
    // Find ship to try to rotate
    const targetShip = targetedShip(cellX, cellY);
    if (targetShip === undefined) return;

    // Determine whether there is space to move the ship
    let newX: number;
    let newY: number;
    if (targetShip.isVertical) {
      newY = cellY;
      newX = targetShip.x - (cellY - targetShip.y);
    } else {
      newX = cellX;
      newY = targetShip.y - (cellX - targetShip.x);
    }
    if (!existsSpaceForMove(targetShip, newX, newY, !targetShip.isVertical)) return;

    // Move the ship and deliver updated board
    targetShip.erase();
    targetShip.x = newX;
    targetShip.y = newY;
    targetShip.isVertical = !targetShip.isVertical;
    targetShip.draw();
    generateModifiedBoard();
  }

  function processCanvasMouseEvent(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef?.current;
    if (canvas === null) return;
    const canvasRect = canvas.getBoundingClientRect();
    const borderWidth = width / 80;
    const mouseX = Math.floor(event.pageX - canvasRect.x) - borderWidth;
    const mouseY = Math.floor(event.pageY - canvasRect.y) - borderWidth + 1;
    if (mouseX < 0 || mouseX >= width || mouseY < 0 || mouseY >= width) return;
    const cellX = Math.floor(mouseX / cellWidth) - 3;
    const cellY = Math.floor(mouseY / cellWidth);

    switch (event.type) {
      case 'mousedown':
        if (event.buttons === 1) {
          setTargetX(cellX);
          setTargetY(cellY);
        }
        break;
      case 'mouseup':
        if (event.button === 0) {
          setTargetX(undefined);
          setTargetY(undefined);
        } else if (event.button === 2) {
          processCellRotate(cellX, cellY);
        }
        break;
      case 'mousemove':
        if (event.buttons === 1) {
          processCellDrag(cellX, cellY);
        }
        break;
    }
  }

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context === null || context === undefined) return;
    async function waitForImages() {
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
        ].map(image => new Promise(resolve => image.addEventListener('load', resolve))),
      );
      // Render initial squares
      for (let i = -3; i < 13; i++) for (let j = 0; j < 10; j++) restoreCell(i, j);
      // Render initial ships
      for (const ship of ships) {
        ship.draw();
      }
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
    restoreCell,
    ships,
    submarineHorizontal,
    submarineVertical,
  ]);
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={(width * 5) / 8}
      style={{ border: `${width / 80}px solid`, userSelect: 'none' }}
      onMouseDown={processCanvasMouseEvent}
      onMouseMove={processCanvasMouseEvent}
      onMouseUp={processCanvasMouseEvent}
      onContextMenu={event => {
        event.preventDefault();
      }}
    />
  );
}
