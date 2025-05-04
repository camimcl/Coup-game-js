export interface AsyncNode<Ctx> {
  execute(ctx: Ctx): Promise<void>;
}
