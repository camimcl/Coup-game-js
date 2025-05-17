import Player from '../core/entities/Player.ts';
import GameState from '../core/GameState.ts';
import { PromptService } from './PromptService.ts';

export default abstract class BaseCase {
  protected gameState: GameState;

  private caseName: string;

  protected currentPlayer: Player;

  protected promptService: PromptService;

  public constructor(caseName: string, gameState: GameState) {
    this.gameState = gameState;
    this.caseName = caseName;
    this.currentPlayer = gameState.getCurrentTurnPlayer();
    this.promptService = new PromptService(gameState.getNamespace());
  }

  public getCaseName() {
    return this.caseName;
  }

  public canExecute(): boolean {
    return this.gameState.getCurrentTurnPlayer().getCoinsAmount() < 10;
  }

  public async runCase() {
    throw new Error(`${this.caseName} is not implemented`);
  }

  protected finishTurn(): void {
    this.gameState.goToNextTurn();
  }
}
