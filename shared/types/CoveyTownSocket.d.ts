export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: TypedInteractable[];
}

export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'BattleShipArea';
export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';

export type PlayerID = string;
export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
};

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};

export interface ConversationArea extends Interactable {
  topic?: string;
};
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea extends Interactable {
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER';
/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
} 

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winner?: PlayerID;
}
/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

// BattleShip Types

export type BattleShipGameStatus = 'GAME_WAIT' | 'GAME_START' | 'GAME_MAIN' | 'GAME_END';
export type BattleShipBoardPiece = 'Destroyer' | 'Submarine' | 'Cruiser' | 'Battleship' | 'Carrier' | undefined;
export type BattleShipBoardMarker = 'H' | 'M' | undefined;
export type BattleShipGridPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type BattleShipSetupMove = BattleShipBoardPiece[][];
export interface BattleShipAttackMove {
  posX: number;
  posY: number;
}
export type BattleShipMove = BattleShipSetupMove | BattleShipAttackMove;
export interface BattleShipGameState extends WinnableGameState {
  p1?: PlayerID;
  p2?: PlayerID;
  p1Username: string;
  p2Username: string;
  p1InitialBoard: ReadonlyArray<ReadonlyArray<BattleShipBoardPiece>>;
  p2InitialBoard: ReadonlyArray<ReadonlyArray<BattleShipBoardPiece>>;
  p1Board: BattleShipBoardPiece[][];
  p2Board: BattleShipBoardPiece[][];
  p1MarkerBoard: BattleShipBoardMarker[][];
  p2MarkerBoard: BattleShipBoardMarker[][];
  p1SunkenShips: BattleShipBoardPiece[];
  p2SunkenShips: BattleShipBoardPiece[];
  turnPlayer?: PlayerID;
  internalState: BattleShipGameStatus;
  moves: BattleShipAttackMove[];
}

export type InteractableID = string;
export type GameInstanceID = string;

/**
 * Type for the result of a game
 */
export interface GameResult {
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type InteractableCommand =  ViewingAreaUpdateCommand | JoinGameCommand | GameMoveCommand<BattleShipMove> | LeaveGameCommand | JoinSpectatorCommand | LeaveSpectatorCommand;
export interface ViewingAreaUpdateCommand  {
  type: 'ViewingAreaUpdate';
  update: ViewingArea;
}
export interface JoinGameCommand {
  type: 'JoinGame';
}
export interface LeaveSpectatorCommand {
  type: 'LeaveSpectator';
  gameID: GameInstanceID;
}
export interface LeaveGameCommand {
  type: 'LeaveGame';
  gameID: GameInstanceID;
}
export interface GameMoveCommand<MoveType> {
  type: 'GameMove';
  gameID: GameInstanceID;
  move: MoveType;
}
export interface JoinSpectatorCommand{
  type: 'JoinSpectator';
  gameID: GameInstanceID;
}
export type InteractableCommandReturnType<CommandType extends InteractableCommand> = 
  CommandType extends JoinGameCommand ? { gameID: string}:
  CommandType extends JoinSpectatorCommand ? { gameID: string}:
  CommandType extends ViewingAreaUpdateCommand ? undefined :
  CommandType extends GameMoveCommand<BattleShipMove> ? undefined :
  CommandType extends LeaveGameCommand ? undefined :
  never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
}

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (command: InteractableCommand & InteractableCommandBase) => void;
}