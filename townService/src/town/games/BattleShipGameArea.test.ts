import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameInstanceID,
  BattleShipGameState,
  BattleShipMove,
  BattleShipAttackMove,
  BattleShipBoardPiece,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import BattleShipGameArea from './BattleShipGameArea';
import * as BattleShipGameModule from './BattleShipGame';
import Game from './Game';

class TestingGame extends Game<BattleShipGameState, BattleShipMove> {
  public constructor() {
    super({
      p1: undefined,
      p2: undefined,
      p1Username: 'Player 1',
      p2Username: 'Player 2',
      p1InitialBoard: [],
      p2InitialBoard: [],
      p1Board: [[], [], [], [], [], [], [], [], [], []],
      p2Board: [[], [], [], [], [], [], [], [], [], []],
      p1MarkerBoard: [[], [], [], [], [], [], [], [], [], []],
      p2MarkerBoard: [[], [], [], [], [], [], [], [], [], []],
      p1SunkenShips: [],
      p2SunkenShips: [],
      lastMoveHit: false,
      lastShipHit: undefined,
      turnPlayer: undefined,
      internalState: 'GAME_WAIT',
      status: 'WAITING_TO_START',
      moves: [],
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public applyMove(): void {}

  public endGame(winner?: string) {
    this.state = {
      ...this.state,
      status: 'OVER',
      winner,
    };
  }

  protected _join(player: Player): void {
    if (this.state.p1) {
      this.state.p2 = player.id;
    } else {
      this.state.p1 = player.id;
    }
    this._players.push(player);
  }

  // eslint-disable-next-line class-methods-use-this
  protected _leave(): void {}
}
describe('[T2] BattleShipGameArea', () => {
  let gameArea: BattleShipGameArea;
  let player1: Player;
  let player2: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  let game: TestingGame;
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
    const gameConstructorSpy = jest.spyOn(BattleShipGameModule, 'default');
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);
    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    gameArea = new BattleShipGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(player1);
    gameArea.add(player2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });
  describe('handleCommand', () => {
    describe('[T2.1] when given a JoinGame command', () => {
      describe('when there is no game in progress', () => {
        it('should create a new game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          expect(gameID).toBeDefined();
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(gameID).toEqual(game.id);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
      describe('when there is a game in progress', () => {
        it('should dispatch the join command to the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

          const joinSpy = jest.spyOn(game, 'join');
          const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, player2).gameID;
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(gameID).toEqual(gameID2);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();

          const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() => gameArea.handleCommand({ type: 'JoinGame' }, player2)).toThrowError(
            'Test Error',
          );
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
    describe('[T3.2] when given a GameMove command', () => {
      describe('with a setup move', () => {
        it('should throw an error when there is no game in progress', () => {
          expect(() =>
            gameArea.handleCommand(
              { type: 'GameMove', move: validBoard, gameID: nanoid() },
              player1,
            ),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
        });
        describe('when there is a game in progress', () => {
          let gameID: GameInstanceID;
          beforeEach(() => {
            gameID = gameArea.handleCommand({ type: 'JoinGame' }, player1).gameID;
            gameArea.handleCommand({ type: 'JoinGame' }, player2);
            interactableUpdateSpy.mockClear();
          });
          it('should throw an error when the game ID does not match', () => {
            expect(() =>
              gameArea.handleCommand(
                { type: 'GameMove', move: validBoard, gameID: nanoid() },
                player1,
              ),
            ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
          });
          it('should dispatch the move to the game and call _emitAreaChanged', () => {
            const applyMoveSpy = jest.spyOn(game, 'applyMove');
            gameArea.handleCommand({ type: 'GameMove', move: validBoard, gameID }, player1);
            expect(applyMoveSpy).toHaveBeenCalledWith({
              gameID: game.id,
              playerID: player1.id,
              move: validBoard,
            });
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          });

          it('should not call _emitAreaChanged if the game throws an error', () => {
            const applyMoveSpy = jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
              throw new Error('Test Error');
            });
            expect(() =>
              gameArea.handleCommand({ type: 'GameMove', move: validBoard, gameID }, player1),
            ).toThrowError('Test Error');
            expect(applyMoveSpy).toHaveBeenCalledWith({
              gameID: game.id,
              playerID: player1.id,
              move: validBoard,
            });
            expect(interactableUpdateSpy).not.toHaveBeenCalled();
          });
        });
      });
      describe('with an attack move', () => {
        it('should throw an error when there is no game in progress', () => {
          expect(() =>
            gameArea.handleCommand(
              { type: 'GameMove', move: { posX: 0, posY: 0 }, gameID: nanoid() },
              player1,
            ),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
        });
        describe('when there is a game in progress', () => {
          let gameID: GameInstanceID;
          beforeEach(() => {
            gameID = gameArea.handleCommand({ type: 'JoinGame' }, player1).gameID;
            gameArea.handleCommand({ type: 'JoinGame' }, player2);
            gameArea.handleCommand({ type: 'GameMove', move: validBoard, gameID }, player1);
            gameArea.handleCommand({ type: 'GameMove', move: validBoard, gameID }, player2);
            interactableUpdateSpy.mockClear();
          });
          it('should throw an error when the game ID does not match', () => {
            expect(() =>
              gameArea.handleCommand(
                { type: 'GameMove', move: { posX: 0, posY: 0 }, gameID: nanoid() },
                player1,
              ),
            ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
          });
          it('should dispatch the move to the game and call _emitAreaChanged', () => {
            const move: BattleShipAttackMove = { posX: 0, posY: 0 };
            const applyMoveSpy = jest.spyOn(game, 'applyMove');
            gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
            expect(applyMoveSpy).toHaveBeenCalledWith({
              gameID: game.id,
              playerID: player1.id,
              move,
            });
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          });
          it('should not call _emitAreaChanged if the game throws an error', () => {
            const move: BattleShipAttackMove = { posX: 0, posY: 0 };
            const applyMoveSpy = jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
              throw new Error('Test Error');
            });
            expect(() =>
              gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1),
            ).toThrowError('Test Error');
            expect(applyMoveSpy).toHaveBeenCalledWith({
              gameID: game.id,
              playerID: player1.id,
              move,
            });
            expect(interactableUpdateSpy).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('[T3.3] when given a NewGame command', () => {
      describe('when there is no game in progress', () => {
        it('should throw an error', () => {
          expect(() =>
            gameArea.handleCommand({ type: 'NewGame', prevgameID: nanoid() }, player1),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
      describe('when the game is over, it records a new row in the history and calls _emitAreaChanged', () => {
        let gameID: GameInstanceID;
        beforeEach(() => {
          gameID = gameArea.handleCommand({ type: 'JoinGame' }, player1).gameID;
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          gameArea.handleCommand({ type: 'GameMove', move: validBoard, gameID }, player1);
          gameArea.handleCommand({ type: 'GameMove', move: validBoard, gameID }, player2);
          interactableUpdateSpy.mockClear();
        });
        test('when the game ID does not match, it should throw an error', () => {
          const move: BattleShipAttackMove = { posX: 0, posY: 0 };
          jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
            game.endGame(player1.id);
          });
          gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
          expect(game.state.status).toEqual('OVER');
          interactableUpdateSpy.mockClear();
          expect(() =>
            gameArea.handleCommand({ type: 'NewGame', prevgameID: nanoid() }, player1),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        test('when player 1 wins', () => {
          const move: BattleShipAttackMove = { posX: 0, posY: 0 };
          jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
            game.endGame(player1.id);
          });
          gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
          expect(game.state.status).toEqual('OVER');
          gameArea.handleCommand({ type: 'NewGame', prevgameID: gameID }, player1);
          expect(gameArea.gameHistory.length).toEqual(1);
          expect(gameArea.gameHistory[0].state.winner).toEqual(player1.id);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        test('when player 2 wins', () => {
          const move: BattleShipAttackMove = { posX: 0, posY: 0 };
          jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
            game.endGame(player2.id);
          });
          gameArea.handleCommand({ type: 'GameMove', move, gameID }, player2);
          expect(game.state.status).toEqual('OVER');
          gameArea.handleCommand({ type: 'NewGame', prevgameID: gameID }, player2);
          expect(gameArea.gameHistory.length).toEqual(1);
          expect(gameArea.gameHistory[0].state.winner).toEqual(player2.id);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
      });
    });
    // Make Changes
    describe('[T3.4] when given a LeaveGame command', () => {
      describe('when there is no game in progress', () => {
        it('should throw an error', () => {
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
      describe('when there is a game in progress', () => {
        it('should throw an error when the game ID does not match', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          interactableUpdateSpy.mockClear();
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        it('should dispatch the leave command to the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          const leaveSpy = jest.spyOn(game, 'leave');
          gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
          expect(leaveSpy).toHaveBeenCalledWith(player1);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();
          const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1),
          ).toThrowError('Test Error');
          expect(leaveSpy).toHaveBeenCalledWith(player1);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
    describe('[T3.4] when given an invalid command', () => {
      it('should throw an error', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore (Testing an invalid command, only possible at the boundary of the type system)
        expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, player1)).toThrowError(
          INVALID_COMMAND_MESSAGE,
        );
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
});
