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
        test('when p1 makes a setup move with a dublicate ship, should throw DUPLICATE error', () => {
          expect(() =>
            game.applyMove({
              playerID: player1.id,
              gameID: game.id,
              move: invalidBoard1,
            }),
          ).toThrowError(util.format(BATTLESHIP_SETUP_SHIP_DUPLICATE_MESSAGE, 'Submarine'));
        });
        test('when p2 makes a setup move with a ship too small, should throw INCOMPLETE error', () => {
          expect(() =>
            game.applyMove({
              playerID: player2.id,
              gameID: game.id,
              move: invalidBoard2,
            }),
          ).toThrowError(util.format(BATTLESHIP_SETUP_SHIP_INCOMPLETE_MESSAGE, 'Carrier'));
        });
        test('when p2 makes a setup move with a ship too big, should throw DUPLICATE error', () => {
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
        test('when p1 makes a setup move with a missing ship, should throw MISSING error', () => {
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
        test('when p2 makes a setup move with mutiple missing ships, should throw MISSING error', () => {
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
        test('when p1 makes a setup move with a ship out of bounds, should throw NOT_ENOUGH_SPACE error', () => {
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
        const emptyBoard: BattleShipBoardPiece[][] = [];
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
          expect(game.state.p2InitialBoard).toEqual(emptyBoard);
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
          expect(game.state.p1Board).toEqual(emptyBoard);
          expect(game.state.p2Board).toEqual(emptyBoard);
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
          expect(game.state.p1Board).toEqual(emptyBoard);
          expect(game.state.p2Board).toEqual(emptyBoard);
        });
      });

      describe('when given valid setups', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
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
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.p1InitialBoard).toEqual(validBoardCopy);
          expect(game.state.p2InitialBoard).toEqual(validBoardCopy);
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
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.p1InitialBoard).toEqual(p1Board);
          expect(game.state.p2InitialBoard).toEqual(p2Board);
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
          game.applyMove({
            playerID: player2.id,
            gameID: game.id,
            move: p2Board,
          });
          game.applyMove({
            playerID: player1.id,
            gameID: game.id,
            move: p1Board,
          });
          expect(game.state.internalState).toEqual('GAME_MAIN');
          expect(game.state.p1InitialBoard).toEqual(p1Board);
          expect(game.state.p2InitialBoard).toEqual(p2Board);
        });
      });
    });
  });
});
