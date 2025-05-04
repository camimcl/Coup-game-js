import Player from "../Player";
import { ActionTypes } from "./action_types";

export default abstract class Action {
  protected uuid: string;
  protected contestable: boolean;
  protected description: string;
  protected name: string;
  protected player: Player;
  protected targetPlayer: Player | undefined;
  protected type: ActionTypes;

  constructor(contestable: boolean, description: string, name: string, player: Player, type: ActionTypes, targetPlayer?: Player) {
    this.uuid = crypto.randomUUID();
    this.contestable = contestable;
    this.description = description;
    this.name = name;
    this.player = player;
    this.targetPlayer = targetPlayer;
    this.type = type;
  }

  doAction() {
    throw Error("Not implemented")
  }
}
