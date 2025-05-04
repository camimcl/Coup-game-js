// buildTree.ts
import {
  GameContext,
  DecisionNode,
  ActionNode,
  PromptNode,
} from "./tree";

export function makeCaptureTree(): DecisionNode<GameContext> {
  // leaf actions
  const cannotCapture = new ActionNode<GameContext>(async ctx => {
    ctx.socket.emit("result", "❌ Não pode desafiar agora");
  });

  const stealTwoCoins = new ActionNode<GameContext>(async ctx => {
    ctx.coins -= 2;
    ctx.socket.emit("result", `💰 Você roubou 2 moedas! (${ctx.coins} restantes)`);
  });

  // a “prompt” where the player must choose Steal vs Pass
  const promptStealOrPass = new PromptNode<GameContext>(
    ctx => {
      ctx.socket.emit("prompt", {
        text: "Você quer roubar 2 moedas ou passar?",
        options: ["Roubar", "Passar"],
      });
    },
    ctx =>
      new Promise<number>(resolve => {
        // listen once for the player's choice (0 or 1)
        ctx.socket.once("choice", (idx: number) => resolve(idx));
      }),
    [
      stealTwoCoins,           // branch 0 → steal
      new ActionNode(async ctx => {
        ctx.socket.emit("result", "✋ Você passou.");
      }),
    ]
  );

  // root decision: does player2 have ≥2 moves left?
  return new DecisionNode<GameContext>(
    ctx => ctx.player2Moves >= 2,
    promptStealOrPass,
    cannotCapture
  );
}
