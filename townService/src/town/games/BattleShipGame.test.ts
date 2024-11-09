import { createPlayerForTesting } from '../../TestUtils';
import {
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import BattleShipGame from './BattleShipGame';
import Player from '../../lib/Player';
import { BattleShipMove } from '../../types/CoveyTownSocket';

describe('BattleShipGame', () => {
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
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        it('makes the second player p2', () => {
          expect(game.state.p1).toEqual(player1.id);
          expect(game.state.p2).toEqual(player2.id);
        });
        it('sets the game status to IN_PROGRESS', () => {
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
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
          game.leave(player1);
          expect(game.state.p1).toBeUndefined();
          expect(game.state.p2).toBeUndefined();
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
        })
      });
      describe('when the game is in the setup stage, it should reset itself to inital parameters', () => {
        test('when p1 leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
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
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
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
    });
    //TODO: Create _leave tests for after the setup phase is finished, requires complete applyMove
  });
});