import util from 'node:util';
import { createPlayerForTesting } from '../../TestUtils';
import {
  BATTLESHIP_SETUP_SHIP_DUPLICATE_MESSAGE,
  BATTLESHIP_SETUP_SHIP_INCOMPLETE_MESSAGE,
  BATTLESHIP_SETUP_SHIP_MISSING_MESSAGE,
  BATTLESHIP_SETUP_SHIP_NOT_ENOUGH_SPACE_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { BattleShipBoardPiece } from '../../types/CoveyTownSocket';
import BattleShipGame from './BattleShipGame';
import Player from '../../lib/Player';

describe('[T1] BattleShipGame', () => {
  let game: BattleShipGame;

  beforeEach(() => {
    game = new BattleShipGame();
  });

  describe('[T1.1] _join', () => {
    it('should throw a PLAYER_ALREADY_IN_GAME_MESSAGE error if player is already in game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw a GAME_FULL_MESSAGE error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });
    describe('When the player can be added', () => {
      it('makes the first player p1 and initializes the state with status WAITING_TO_START', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.p1).toEqual(player.id);
        expect(game.state.p2).toBeUndefined();
        expect(game.state.p1InitialBoard).toHaveLength(0);
        expect(game.state.p2InitialBoard).toHaveLength(0);
        expect(game.state.internalState).toEqual('GAME_WAIT');
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
      describe('When the second player joins', () => {
        it('makes the second player p2 and sets the game status to IN_PROGRESS', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toEqual(player2.id);
          expect(game.state.internalState).toEqual('GAME_START');
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.winner).toBeUndefined();
          expect(game.state.p1InitialBoard).toHaveLength(0);
          expect(game.state.p2InitialBoard).toHaveLength(0);
        });
      });
    });
  });

  describe('[T1.2] _leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      describe('when only one player has joined. game is in waiting state', () => {
        test('when p1 leaves', () => {
          const player1 = createPlayerForTesting();
          game.join(player1);
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toBeUndefined();
          expect(game.state.internalState).toEqual('GAME_WAIT');
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
          game.leave(player1);
          expect(game.state.p1).toBeUndefined();
          expect(game.state.p2).toBeUndefined();
          expect(game.state.internalState).toEqual('GAME_WAIT');
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
        });
      });
      describe('when the game is in the setup stage, it should reset itself to inital parameters', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        test('when p1 leaves', () => {
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toEqual(player2.id);

          game.leave(player1);

          expect(game.state.internalState).toEqual('GAME_WAIT');
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
          expect(game.state.p1).toEqual(player2.id);
          expect(game.state.p2).toBeUndefined();
        });
        test('when p2 leaves', () => {
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toEqual(player2.id);

          game.leave(player2);

          expect(game.state.internalState).toEqual('GAME_WAIT');
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toBeUndefined();
        });
      });
      describe('when the game is in the main gameplay stage, it should end the game and set the remaining player as the winner', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const validBoard: BattleShipBoardPiece[][] = [
          [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            'Destroyer',
          ],
          [
            undefined,
            'Carrier',
            undefined,
            undefined,
            undefined,
            'Submarine',
            'Submarine',
            'Submarine',
            undefined,
            'Destroyer',
          ],
          [
            undefined,
            'Carrier',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
          ],
          [
            undefined,
            'Carrier',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
          ],
          [
            undefined,
            'Carrier',
            undefined,
            undefined,
            undefined,
            undefined,
            'Cruiser',
            undefined,
            undefined,
            undefined,
          ],
          [
            undefined,
            'Carrier',
            undefined,
            undefined,
            undefined,
            undefined,
            'Cruiser',
            undefined,
            undefined,
            undefined,
          ],
          [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            'Cruiser',
            undefined,
            undefined,
            undefined,
          ],
          [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
          ],
          [
            'Battleship',
            'Battleship',
            'Battleship',
            'Battleship',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
          ],
          [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
          ],
        ];
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: validBoard,
          });
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: validBoard,
          });
        });
        test('when p1 leaves', () => {
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toEqual(player2.id);
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.status).toEqual('IN_PROGRESS');

          game.leave(player1);

          expect(game.state.internalState).toEqual('GAME_END');
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toEqual(player2.id);
        });
        test('when p2 leaves', () => {
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toEqual(player2.id);
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.status).toEqual('IN_PROGRESS');

          game.leave(player2);

          expect(game.state.internalState).toEqual('GAME_END');
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toEqual(player2.id);
        });
      });
    });
    // TODO Create _leave tests for after the setup phase is finished, requires complete applyMove
  });

  describe('[T1.3] _applyMove', () => {
    function placeShip(
      board: BattleShipBoardPiece[][],
      ship: BattleShipBoardPiece,
      pos: number,
      orntDown: boolean,
    ) {
      let xPos = Math.floor(Math.abs(pos % 10));
      let yPos = Math.floor(Math.abs((pos / 10) % 10));
      let i;
      let g = 5;
      if (ship === 'Battleship') {
        g = 4;
      } else if (ship === 'Cruiser' || ship === 'Submarine') {
        g = 3;
      } else if (ship === 'Destroyer') {
        g = 2;
      }
      for (i = 0; i < g; i++) {
        if (orntDown) {
          if (yPos > 9) {
            throw new Error(`${yPos} Not a valid postion`);
          }
          if (board[yPos][xPos] !== undefined && board[yPos][xPos] !== null) {
            throw new Error(`${pos} Postion Conflict`);
          }
          board[yPos][xPos] = ship;
          yPos++;
        } else {
          if (xPos > 9) {
            throw new Error(`${xPos} Not a valid postion`);
          }
          if (board[yPos][xPos] !== undefined && board[yPos][xPos] !== null) {
            throw new Error(`${pos} Postion Conflict`);
          }
          board[yPos][xPos] = ship;
          xPos++;
        }
      }
    }

    function generateSetupBoard(
      carPos: number,
      carOrnt: boolean,
      batPos: number,
      batOrnt: boolean,
      cruPos: number,
      cruOrnt: boolean,
      subPos: number,
      subOrnt: boolean,
      desPos: number,
      desOrnt: boolean,
    ) {
      const retBoard: BattleShipBoardPiece[][] = [[], [], [], [], [], [], [], [], [], []];
      placeShip(retBoard, 'Carrier', carPos, carOrnt);
      placeShip(retBoard, 'Battleship', batPos, batOrnt);
      placeShip(retBoard, 'Cruiser', cruPos, cruOrnt);
      placeShip(retBoard, 'Submarine', subPos, subOrnt);
      placeShip(retBoard, 'Destroyer', desPos, desOrnt);
      return retBoard;
    }

    describe('_applySetupMove', () => {
      describe('when given an setup move before game start', () => {
        it('should throw a GAME_NOT_IN_PROGRESS_MESSAGE error', () => {
          const player1 = createPlayerForTesting();
          const validBoard: BattleShipBoardPiece[][] = generateSetupBoard(
            11,
            true,
            80,
            false,
            46,
            true,
            15,
            false,
            9,
            true,
          );
          game.join(player1);
          expect(game.state.internalState).toEqual('GAME_WAIT');
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: validBoard,
            }),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
        });
      });

      describe('when given a setup move by a non-player', () => {
        it('should throw a PLAYER_NOT_IN_GAME_MESSAGE error', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          const player3 = createPlayerForTesting();
          const validBoard: BattleShipBoardPiece[][] = generateSetupBoard(
            11,
            true,
            80,
            false,
            46,
            true,
            15,
            false,
            9,
            true,
          );
          game.join(player1);
          game.join(player2);
          expect(() =>
            game.applyMove({
              playerID: player3.id,
              gameID: game.id,
              move: validBoard,
            }),
          ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
        });
      });

      describe('when given an invalid setup', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const validBoard: BattleShipBoardPiece[][] = generateSetupBoard(
          11,
          true,
          80,
          false,
          46,
          true,
          15,
          false,
          9,
          true,
        );
        const invalidBoard1: BattleShipBoardPiece[][] = generateSetupBoard(
          11,
          true,
          80,
          false,
          46,
          true,
          15,
          false,
          9,
          true,
        );
        placeShip(invalidBoard1, 'Submarine', 58, true);
        const invalidBoard2: BattleShipBoardPiece[][] = generateSetupBoard(
          11,
          true,
          80,
          false,
          46,
          true,
          15,
          false,
          9,
          true,
        );
        invalidBoard2[1][1] = undefined;
        const invalidBoard3: BattleShipBoardPiece[][] = generateSetupBoard(
          11,
          true,
          80,
          false,
          46,
          true,
          15,
          false,
          9,
          true,
        );
        invalidBoard3[8][4] = 'Battleship';
        const invalidBoard4: BattleShipBoardPiece[][] = generateSetupBoard(
          11,
          true,
          80,
          false,
          46,
          true,
          15,
          false,
          9,
          true,
        );
        invalidBoard4[0][9] = undefined;
        invalidBoard4[1][9] = undefined;
        const invalidBoard5: BattleShipBoardPiece[][] = [[], [], [], [], [], [], [], [], [], []];
        placeShip(invalidBoard5, 'Submarine', 58, true);
        const invalidBoard6: BattleShipBoardPiece[][] = generateSetupBoard(
          11,
          true,
          86,
          false,
          46,
          true,
          15,
          false,
          9,
          true,
        );
        invalidBoard6[8][6] = undefined;
        invalidBoard6[8][10] = 'Battleship';
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        test('when p1 makes a setup move with a dublicate ship, should throw a DUPLICATE error', () => {
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: invalidBoard1,
            }),
          ).toThrowError(util.format(BATTLESHIP_SETUP_SHIP_DUPLICATE_MESSAGE, 'Submarine'));
        });
        test('when p2 makes a setup move with a ship too small, should throw a INCOMPLETE error', () => {
          expect(() =>
            game.applyMove({
              playerID: player2.id,
              gameID: game.id,
              move: invalidBoard2,
            }),
          ).toThrowError(util.format(BATTLESHIP_SETUP_SHIP_INCOMPLETE_MESSAGE, 'Carrier'));
        });
        test('when p2 makes a setup move with a ship too big, should throw a DUPLICATE error', () => {
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: validBoard,
          });
          expect(() =>
            game.applyMove({
              playerID: player2.id,
              gameID: game.id,
              move: invalidBoard3,
            }),
          ).toThrowError(util.format(BATTLESHIP_SETUP_SHIP_DUPLICATE_MESSAGE, 'Battleship'));
        });
        test('when p1 makes a setup move with a missing ship, should throw a MISSING error', () => {
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: validBoard,
          });
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: invalidBoard4,
            }),
          ).toThrowError(util.format(BATTLESHIP_SETUP_SHIP_MISSING_MESSAGE, 'Destroyer'));
        });
        test('when p2 makes a setup move with mutiple missing ships, should throw a MISSING error', () => {
          expect(() =>
            game.applyMove({
              playerID: player2.id,
              gameID: game.id,
              move: invalidBoard5,
            }),
          ).toThrowError(
            util.format(
              BATTLESHIP_SETUP_SHIP_MISSING_MESSAGE,
              'Destroyer, Cruiser, Battleship, Carrier',
            ),
          );
        });
        test('when p1 makes a setup move with a ship out of bounds, should throw a NOT_ENOUGH_SPACE error', () => {
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: invalidBoard6,
            }),
          ).toThrowError(util.format(BATTLESHIP_SETUP_SHIP_NOT_ENOUGH_SPACE_MESSAGE, 'Battleship'));
        });
      });

      describe('when given an multiple setup moves by the same player', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const validBoard1: BattleShipBoardPiece[][] = generateSetupBoard(
          11,
          true,
          80,
          false,
          46,
          true,
          15,
          false,
          9,
          true,
        );
        const validBoard2: BattleShipBoardPiece[][] = generateSetupBoard(
          64,
          false,
          17,
          true,
          6,
          false,
          34,
          true,
          10,
          false,
        );
        const emptyBoard: BattleShipBoardPiece[][] = [[], [], [], [], [], [], [], [], [], []];
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        test('when p1 makes two setup moves back to back in the setup phase, should throw an error', () => {
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: validBoard1,
          });
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: validBoard2,
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          expect(game.state.p1InitialBoard).toEqual(validBoard1);
          expect(game.state.p1Board).toEqual(emptyBoard);
          expect(game.state.p2Board).toEqual(emptyBoard);
        });
        test('when p1 makes a setup move during the setup phase and again during the main game phase, should throw an error', () => {
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: validBoard1,
          });
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: validBoard1,
          });
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: validBoard2,
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.p1InitialBoard).toEqual(validBoard1);
          expect(game.state.p2InitialBoard).toEqual(validBoard1);
          expect(game.state.p1Board).toEqual(validBoard1);
          expect(game.state.p2Board).toEqual(validBoard1);
        });
        test('when p2 makes a setup move during the setup phase and again during the main game phase, should throw an error', () => {
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: validBoard1,
          });
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: validBoard1,
          });
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(() =>
            game.applyMove({
              playerID: player2.id,
              gameID: game.id,
              move: validBoard2,
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.p1InitialBoard).toEqual(validBoard1);
          expect(game.state.p2InitialBoard).toEqual(validBoard1);
          expect(game.state.p1Board).toEqual(validBoard1);
          expect(game.state.p2Board).toEqual(validBoard1);
        });
      });

      describe('when given valid setups', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const emptyBoard: BattleShipBoardPiece[][] = [[], [], [], [], [], [], [], [], [], []];
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        test('valid setup #1', () => {
          const validBoard: BattleShipBoardPiece[][] = generateSetupBoard(
            11,
            true,
            80,
            false,
            46,
            true,
            15,
            false,
            9,
            true,
          );
          const validBoardCopy: BattleShipBoardPiece[][] = [
            [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              'Destroyer',
            ],
            [
              undefined,
              'Carrier',
              undefined,
              undefined,
              undefined,
              'Submarine',
              'Submarine',
              'Submarine',
              undefined,
              'Destroyer',
            ],
            [
              undefined,
              'Carrier',
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            [
              undefined,
              'Carrier',
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            [
              undefined,
              'Carrier',
              undefined,
              undefined,
              undefined,
              undefined,
              'Cruiser',
              undefined,
              undefined,
              undefined,
            ],
            [
              undefined,
              'Carrier',
              undefined,
              undefined,
              undefined,
              undefined,
              'Cruiser',
              undefined,
              undefined,
              undefined,
            ],
            [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              'Cruiser',
              undefined,
              undefined,
              undefined,
            ],
            [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            [
              'Battleship',
              'Battleship',
              'Battleship',
              'Battleship',
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
            [
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ],
          ];
          expect(game.state.internalState).toEqual('GAME_START');
          expect(game.state.status).toEqual('IN_PROGRESS');
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: validBoard,
          });
          expect(game.state.p1InitialBoard).toEqual(validBoardCopy);
          expect(game.state.p1Board).toEqual(emptyBoard);
          expect(game.state.p2Board).toEqual(emptyBoard);
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: validBoard,
          });
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.p1InitialBoard).toEqual(validBoardCopy);
          expect(game.state.p2InitialBoard).toEqual(validBoardCopy);
          expect(game.state.p1Board).toEqual(validBoardCopy);
          expect(game.state.p2Board).toEqual(validBoardCopy);
        });
        test('valid setup #2', () => {
          const p1Board: BattleShipBoardPiece[][] = generateSetupBoard(
            50,
            true,
            61,
            true,
            72,
            true,
            73,
            true,
            84,
            true,
          );
          const p2Board: BattleShipBoardPiece[][] = generateSetupBoard(
            5,
            false,
            16,
            false,
            27,
            false,
            37,
            false,
            48,
            false,
          );
          expect(game.state.internalState).toEqual('GAME_START');
          expect(game.state.status).toEqual('IN_PROGRESS');
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: p1Board,
          });
          expect(game.state.p1InitialBoard).toEqual(p1Board);
          expect(game.state.p1Board).toEqual(emptyBoard);
          expect(game.state.p2Board).toEqual(emptyBoard);
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: p2Board,
          });
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.p1InitialBoard).toEqual(p1Board);
          expect(game.state.p2InitialBoard).toEqual(p2Board);
          expect(game.state.p1Board).toEqual(p1Board);
          expect(game.state.p2Board).toEqual(p2Board);
        });
        test('valid setup #3', () => {
          const p1Board: BattleShipBoardPiece[][] = generateSetupBoard(
            57,
            true,
            45,
            false,
            55,
            true,
            58,
            true,
            56,
            true,
          );
          const p2Board: BattleShipBoardPiece[][] = generateSetupBoard(
            10,
            true,
            11,
            false,
            51,
            false,
            34,
            true,
            23,
            false,
          );
          expect(game.state.internalState).toEqual('GAME_START');
          expect(game.state.status).toEqual('IN_PROGRESS');
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: p2Board,
          });
          expect(game.state.p2InitialBoard).toEqual(p2Board);
          expect(game.state.p1Board).toEqual(emptyBoard);
          expect(game.state.p2Board).toEqual(emptyBoard);
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: p1Board,
          });
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.p1InitialBoard).toEqual(p1Board);
          expect(game.state.p2InitialBoard).toEqual(p2Board);
          expect(game.state.p1Board).toEqual(p1Board);
          expect(game.state.p2Board).toEqual(p2Board);
        });
      });
    });

    describe('_applyAttackMove', () => {
      describe('when given an attack move before game has started', () => {
        it('should throw a GAME_NOT_IN_PROGRESS_MESSAGE error', () => {
          const player1 = createPlayerForTesting();
          game.join(player1);
          expect(game.state.internalState).toEqual('GAME_WAIT');
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: {
                posX: 1,
                posY: 2,
              },
            }),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
        });
      });

      describe('when given an attack move during the Setup phase', () => {
        it('should throw a GAME_NOT_IN_PROGRESS_MESSAGE error', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.internalState).toEqual('GAME_START');
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: {
                posX: 1,
                posY: 2,
              },
            }),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
        });
      });

      describe('when given an attack move from not the turnPlayer player', () => {
        it('should throw a MOVE_NOT_YOUR_TURN_MESSAGE error', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          const p1Board: BattleShipBoardPiece[][] = generateSetupBoard(
            16,
            true,
            22,
            false,
            43,
            false,
            65,
            true,
            57,
            false,
          );
          const p2Board: BattleShipBoardPiece[][] = generateSetupBoard(
            52,
            false,
            23,
            false,
            11,
            true,
            61,
            true,
            69,
            true,
          );
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: p1Board,
          });
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: p2Board,
          });
          expect(() =>
            game.applyMove({
              playerID: player2.id,
              gameID: game.id,
              move: {
                posX: 1,
                posY: 2,
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
        });
      });

      describe('when given an attack move from an outside player', () => {
        it('should throw a PLAYER_NOT_IN_GAME_MESSAGE error', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          const player3 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          const p1Board: BattleShipBoardPiece[][] = generateSetupBoard(
            16,
            true,
            22,
            false,
            43,
            false,
            65,
            true,
            57,
            false,
          );
          const p2Board: BattleShipBoardPiece[][] = generateSetupBoard(
            52,
            false,
            23,
            false,
            11,
            true,
            61,
            true,
            69,
            true,
          );
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: p1Board,
          });
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: p2Board,
          });
          expect(() =>
            game.applyMove({
              playerID: player3.id,
              gameID: game.id,
              move: {
                posX: 1,
                posY: 2,
              },
            }),
          ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
        });
      });

      describe('when given an out of bounds attack move', () => {
        it('should throw an error', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          const p1Board: BattleShipBoardPiece[][] = generateSetupBoard(
            16,
            true,
            22,
            false,
            43,
            false,
            65,
            true,
            57,
            false,
          );
          const p2Board: BattleShipBoardPiece[][] = generateSetupBoard(
            52,
            false,
            23,
            false,
            11,
            true,
            61,
            true,
            69,
            true,
          );
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: p1Board,
          });
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: p2Board,
          });
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: {
                posX: 10,
                posY: 2,
              },
            }),
          ).toThrowError(BOARD_POSITION_NOT_EMPTY_MESSAGE); // TODO May need specific error message
        });
      });

      describe('when given an attack move on a previously attack spot', () => {
        it('should throw a BOARD_POSITION_NOT_EMPTY_MESSAGE error', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          const p1Board: BattleShipBoardPiece[][] = generateSetupBoard(
            16,
            true,
            22,
            false,
            43,
            false,
            65,
            true,
            57,
            false,
          );
          const p2Board: BattleShipBoardPiece[][] = generateSetupBoard(
            52,
            false,
            23,
            false,
            11,
            true,
            61,
            true,
            69,
            true,
          );
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: p1Board,
          });
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: p2Board,
          });
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: {
              posX: 1,
              posY: 2,
            },
          });
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: {
              posX: 3,
              posY: 4,
            },
          });
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: {
                posX: 1,
                posY: 2,
              },
            }),
          ).toThrowError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
        });
      });

      describe('valid game', () => {
        let player1: Player;
        let player2: Player;
        const p1Board: BattleShipBoardPiece[][] = generateSetupBoard(
          52,
          false,
          23,
          false,
          11,
          true,
          61,
          true,
          69,
          true,
        );
        const p2Board: BattleShipBoardPiece[][] = generateSetupBoard(
          16,
          true,
          22,
          false,
          43,
          false,
          65,
          true,
          57,
          false,
        );
        let p1SunkShips: BattleShipBoardPiece[];
        let p1CarrierHp: number;
        let p1BattleshipHp: number;
        let p1CruiserHp: number;
        let p1SubmarineHp: number;
        let p1DestroyerHp: number;
        let p2SunkShips: BattleShipBoardPiece[];
        let p2CarrierHp: number;
        let p2BattleshipHp: number;
        let p2CruiserHp: number;
        let p2SubmarineHp: number;
        let p2DestroyerHp: number;
        beforeEach(() => {
          player1 = createPlayerForTesting();
          player2 = createPlayerForTesting();
          p1SunkShips = [];
          p2SunkShips = [];
          p1CarrierHp = 5;
          p2CarrierHp = 5;
          p1BattleshipHp = 4;
          p2BattleshipHp = 4;
          p1CruiserHp = 3;
          p2CruiserHp = 3;
          p1SubmarineHp = 3;
          p2SubmarineHp = 3;
          p1DestroyerHp = 2;
          p2DestroyerHp = 2;
          game.join(player1);
          game.join(player2);
          expect(game.state.status).toEqual('IN_PROGRESS');
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: p1Board,
          });
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: p2Board,
          });
        });
        function makeAttackandCheckResult(
          row: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
          col: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
          player: 'p1' | 'p2',
          expectedResult: 'H' | 'M',
        ) {
          if (player === 'p1') {
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: {
                posX: col,
                posY: row,
              },
            });
            expect(game.state.p2MarkerBoard[row][col]).toEqual(expectedResult);
            if (game.state.p2MarkerBoard[row][col] === 'H') {
              switch (game.state.p2InitialBoard[row][col]) {
                case 'Carrier':
                  p2CarrierHp--;
                  if (p2CarrierHp === 0) p2SunkShips.push('Carrier');
                  break;
                case 'Battleship':
                  p2BattleshipHp--;
                  if (p2BattleshipHp === 0) p2SunkShips.push('Battleship');
                  break;
                case 'Cruiser':
                  p2CruiserHp--;
                  if (p2CruiserHp === 0) p2SunkShips.push('Cruiser');
                  break;
                case 'Submarine':
                  p2SubmarineHp--;
                  if (p2SubmarineHp === 0) p2SunkShips.push('Submarine');
                  break;
                case 'Destroyer':
                  p2DestroyerHp--;
                  if (p2DestroyerHp === 0) p2SunkShips.push('Destroyer');
                  break;
                default:
                  break;
              }
              expect(game.state.p2SunkenShips).toEqual(p2SunkShips);
            }
          } else {
            game.applyMove({
              playerID: player2.id,
              gameID: game.id,
              move: {
                posX: col,
                posY: row,
              },
            });
            expect(game.state.p1MarkerBoard[row][col]).toEqual(expectedResult);
            if (game.state.p1MarkerBoard[row][col] === 'H') {
              switch (game.state.p1InitialBoard[row][col]) {
                case 'Carrier':
                  p1CarrierHp--;
                  if (p1CarrierHp === 0) p1SunkShips.push('Carrier');
                  break;
                case 'Battleship':
                  p1BattleshipHp--;
                  if (p1BattleshipHp === 0) p1SunkShips.push('Battleship');
                  break;
                case 'Cruiser':
                  p1CruiserHp--;
                  if (p1CruiserHp === 0) p1SunkShips.push('Cruiser');
                  break;
                case 'Submarine':
                  p1SubmarineHp--;
                  if (p1SubmarineHp === 0) p1SunkShips.push('Submarine');
                  break;
                case 'Destroyer':
                  p1DestroyerHp--;
                  if (p1DestroyerHp === 0) p1SunkShips.push('Destroyer');
                  break;
                default:
                  break;
              }
              expect(game.state.p1SunkenShips).toEqual(p1SunkShips);
            }
          }
        }
        it('should add Miss value to the p2MarkerBoard', () => {
          makeAttackandCheckResult(0, 2, 'p1', 'M');
        });
        it('should add Miss value to the p1MarkerBoard', () => {
          makeAttackandCheckResult(0, 2, 'p1', 'M');
          makeAttackandCheckResult(1, 0, 'p2', 'M');
        });
        it('should add Hit value to the p2MarkerBoard', () => {
          makeAttackandCheckResult(2, 2, 'p1', 'H');
        });
        it('should add Hit value to the p1MarkerBoard', () => {
          makeAttackandCheckResult(0, 2, 'p1', 'M');
          makeAttackandCheckResult(1, 1, 'p2', 'H');
        });
        it('should switch turnPlayer properly', () => {
          expect(game.state.turnPlayer).toEqual(player1.id);
          makeAttackandCheckResult(0, 2, 'p1', 'M');
          expect(game.state.turnPlayer).toEqual(player2.id);
          makeAttackandCheckResult(1, 1, 'p2', 'H');
          expect(game.state.turnPlayer).toEqual(player1.id);
          makeAttackandCheckResult(2, 2, 'p1', 'H');
          expect(game.state.turnPlayer).toEqual(player2.id);
          makeAttackandCheckResult(1, 0, 'p2', 'M');
          expect(game.state.turnPlayer).toEqual(player1.id);
        });
        describe('when player 1 sinks all of player 2s ships', () => {
          it('should set player 1 to the winner and set status to OVER', () => {
            makeAttackandCheckResult(2, 2, 'p1', 'H'); // Battleship Hit
            makeAttackandCheckResult(0, 0, 'p2', 'M');
            makeAttackandCheckResult(2, 3, 'p1', 'H'); // Battleship Hit
            makeAttackandCheckResult(1, 0, 'p2', 'M');
            makeAttackandCheckResult(2, 4, 'p1', 'H'); // Battleship Hit
            makeAttackandCheckResult(2, 0, 'p2', 'M');
            makeAttackandCheckResult(2, 5, 'p1', 'H'); // Battleship Sunk
            makeAttackandCheckResult(3, 0, 'p2', 'M');
            makeAttackandCheckResult(1, 6, 'p1', 'H'); // Carrier Hit
            makeAttackandCheckResult(4, 0, 'p2', 'M');
            makeAttackandCheckResult(2, 6, 'p1', 'H'); // Carrier Hit
            makeAttackandCheckResult(5, 0, 'p2', 'M');
            makeAttackandCheckResult(3, 6, 'p1', 'H'); // Carrier Hit
            makeAttackandCheckResult(6, 0, 'p2', 'M');
            makeAttackandCheckResult(4, 6, 'p1', 'H'); // Carrier Hit
            makeAttackandCheckResult(7, 0, 'p2', 'M');
            makeAttackandCheckResult(5, 6, 'p1', 'H'); // Carrier Sunk
            makeAttackandCheckResult(8, 0, 'p2', 'M');
            makeAttackandCheckResult(4, 3, 'p1', 'H'); // Cruiser Hit
            makeAttackandCheckResult(9, 0, 'p2', 'M');
            makeAttackandCheckResult(4, 4, 'p1', 'H'); // Cruiser Hit
            makeAttackandCheckResult(2, 3, 'p2', 'H');
            makeAttackandCheckResult(4, 5, 'p1', 'H'); // Cruiser Sunk
            makeAttackandCheckResult(2, 4, 'p2', 'H');
            makeAttackandCheckResult(6, 5, 'p1', 'H'); // Submarine Hit
            makeAttackandCheckResult(2, 6, 'p2', 'H');
            makeAttackandCheckResult(7, 5, 'p1', 'H'); // Submarine Hit
            makeAttackandCheckResult(9, 1, 'p2', 'M');
            makeAttackandCheckResult(8, 5, 'p1', 'H'); // Submarine Sunk
            makeAttackandCheckResult(0, 2, 'p2', 'M');
            makeAttackandCheckResult(5, 7, 'p1', 'H'); // Destroyer Hit
            makeAttackandCheckResult(2, 5, 'p2', 'H');
            makeAttackandCheckResult(5, 8, 'p1', 'H'); // Destroyer Sunk
            expect(game.state.winner).toEqual(player1.id);
            expect(game.state.internalState).toEqual('GAME_END');
            expect(game.state.status).toEqual('OVER');
          });
        });
        describe('when player 2 sinks all of player 1s ships', () => {
          it('should set player 2 to the winner and set status to OVER', () => {
            makeAttackandCheckResult(2, 2, 'p1', 'H');
            makeAttackandCheckResult(2, 3, 'p2', 'H'); // Battleship Hit
            makeAttackandCheckResult(2, 3, 'p1', 'H');
            makeAttackandCheckResult(2, 4, 'p2', 'H'); // Battleship Hit
            makeAttackandCheckResult(2, 4, 'p1', 'H');
            makeAttackandCheckResult(2, 5, 'p2', 'H'); // Battleship Hit
            makeAttackandCheckResult(2, 5, 'p1', 'H');
            makeAttackandCheckResult(2, 6, 'p2', 'H'); // Battleship Sunk
            makeAttackandCheckResult(6, 5, 'p1', 'H');
            makeAttackandCheckResult(5, 2, 'p2', 'H'); // Carrier Hit
            makeAttackandCheckResult(6, 6, 'p1', 'M');
            makeAttackandCheckResult(5, 3, 'p2', 'H'); // Carrier Hit
            makeAttackandCheckResult(7, 5, 'p1', 'H');
            makeAttackandCheckResult(5, 4, 'p2', 'H'); // Carrier Hit
            makeAttackandCheckResult(5, 5, 'p1', 'M');
            makeAttackandCheckResult(5, 5, 'p2', 'H'); // Carrier Hit
            makeAttackandCheckResult(8, 5, 'p1', 'H');
            makeAttackandCheckResult(5, 6, 'p2', 'H'); // Carrier Sunk
            makeAttackandCheckResult(5, 7, 'p1', 'H');
            makeAttackandCheckResult(1, 1, 'p2', 'H'); // Cruiser Hit
            makeAttackandCheckResult(4, 4, 'p1', 'H');
            makeAttackandCheckResult(2, 1, 'p2', 'H'); // Cruiser Hit
            makeAttackandCheckResult(4, 3, 'p1', 'H');
            makeAttackandCheckResult(3, 1, 'p2', 'H'); // Cruiser Sunk
            makeAttackandCheckResult(4, 2, 'p1', 'M');
            makeAttackandCheckResult(6, 1, 'p2', 'H'); // Submarine Hit
            makeAttackandCheckResult(5, 8, 'p1', 'H');
            makeAttackandCheckResult(7, 1, 'p2', 'H'); // Submarine Hit
            makeAttackandCheckResult(9, 1, 'p1', 'M');
            makeAttackandCheckResult(8, 1, 'p2', 'H'); // Submarine Sunk
            makeAttackandCheckResult(9, 9, 'p1', 'M');
            makeAttackandCheckResult(6, 9, 'p2', 'H'); // Destroyer Hit
            makeAttackandCheckResult(0, 9, 'p1', 'M');
            makeAttackandCheckResult(7, 9, 'p2', 'H'); // Destroyer Sunk
            expect(game.state.winner).toEqual(player2.id);
            expect(game.state.internalState).toEqual('GAME_END');
            expect(game.state.status).toEqual('OVER');
          });
        });
      });
    });
  });
});
