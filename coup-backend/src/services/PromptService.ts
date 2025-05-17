/* eslint-disable class-methods-use-this */
import { Namespace, Socket } from 'socket.io';
import { PROMPT, PROMPT_RESPONSE } from '../constants/events.ts';
import {
  PROMPT_OPTION_CHALLENGE_ACCEPT,
  PROMPT_OPTION_CHALLENGE_PASS,
  PROMPT_OPTION_VALUE,
} from '../constants/promptOptions.ts';
import Player from '../core/entities/Player.ts';
import { onceEverySocketExceptOne } from '../socket/utils/listen.ts';

export enum PromptVariant {
  OWNED_CARDS_CHOICE = 'OWNED_CARDS_CHOICE',
  OWNED_CARDS_CHOICE_MULTIPLE = 'OWNED_CARDS_CHOICE_MULTIPLE',
  CARDS_CHOICE = 'CARDS_CHOICE',
  CHALLENGE = 'CHALLENGE'
}

export interface PromptOption {
  label: string;
  value: string | boolean | number;
}

export class PromptService {
  private namespace: Namespace;

  constructor(namespace: Namespace) {
    this.namespace = namespace;
  }

  // TODO: use timeoutMillis
  emitToOthers(
    sender: Socket,
    message: string,
    options: PromptOption[],
    variant?: PromptVariant,
    timeoutMillis?: number,
  ): void {
    sender.broadcast.emit(PROMPT, {
      message, options, variant, expiration: 1000000,
    });
  }

  // TODO: use timeoutMillis
  emitToPlayer(
    target: Socket,
    message: string,
    options: PromptOption[],
    variant?: PromptVariant,
    timeoutMillis?: number,
  ): void {
    this.namespace.to(target.id).emit(PROMPT, {
      message, options, variant, expiration: 1000000,
    });
  }

  private waitForResponse(
    socket: Socket,
    defaultValue: string,
    timeoutMillis: number,
  ): Promise<string> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(defaultValue), timeoutMillis);
      socket.once(PROMPT_RESPONSE, (response: string) => {
        clearTimeout(timer);
        resolve(response);
      });
    });
  }

  async askSingleCard(
    player: Player,
    variant: PromptVariant = PromptVariant.CARDS_CHOICE,
    timeoutMillis = 1000000,
  ): Promise<string> {
    const options = player.getCards().map((card) => ({
      label: card.variant,
      value: card.uuid,
    }));

    const defaultUuid = options[0].value as string;

    this.emitToPlayer(player.socket, 'Escolha uma das cartas', options, variant, timeoutMillis);

    return this.waitForResponse(player.socket, defaultUuid, timeoutMillis);
  }

  async askTwoCards(
    player: Player,
    timeoutMillis = 1000000,
  ): Promise<[string, string]> {
    const all = player.getCards();

    const options = all.map((card) => ({ label: card.variant, value: card.uuid }));

    this.emitToPlayer(
      player.socket,
      'Escolha 2 cartas',
      options,
      PromptVariant.OWNED_CARDS_CHOICE_MULTIPLE,
      timeoutMillis,
    );

    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve([options[0].value, options[1].value]), timeoutMillis);

      player.socket.once(PROMPT_RESPONSE, (resp: string[]) => {
        clearTimeout(timer);

        if (Array.isArray(resp) && resp.length >= 2) {
          resolve([resp[0], resp[1]]);
        } else {
          resolve([options[0].value, options[1].value]);
        }
      });
    });
  }

  async challengePlayer(
    target: Socket,
    message: string,
    timeoutMillis = 1000000,
  ): Promise<typeof PROMPT_OPTION_CHALLENGE_ACCEPT | typeof PROMPT_OPTION_CHALLENGE_PASS> {
    const options: PromptOption[] = [
      { label: 'Contestar', value: PROMPT_OPTION_CHALLENGE_ACCEPT },
      { label: 'Passar', value: PROMPT_OPTION_CHALLENGE_PASS },
    ];
    const defaultVal = PROMPT_OPTION_CHALLENGE_PASS;
    this.emitToPlayer(target, message, options, PromptVariant.CHALLENGE, timeoutMillis);
    const response = await this.waitForResponse(target, defaultVal, timeoutMillis);
    return response as typeof PROMPT_OPTION_CHALLENGE_ACCEPT | typeof PROMPT_OPTION_CHALLENGE_PASS;
  }

  async challengeOthers(
    sender: Socket,
    playersCount: number,
    message: string,
    timeoutMillis = 1000000,
  ): Promise<{ challengerId: string; response: PROMPT_OPTION_VALUE }> {
    const options: PromptOption[] = [
      { label: 'Contestar', value: PROMPT_OPTION_CHALLENGE_ACCEPT },
      { label: 'Passar', value: PROMPT_OPTION_CHALLENGE_PASS },
    ];

    this.emitToOthers(sender, message, options, PromptVariant.CHALLENGE, timeoutMillis);

    return new Promise((resolve) => {
      let ignored = 0;

      const timer = setTimeout(() => resolve({ challengerId: '', response: PROMPT_OPTION_CHALLENGE_PASS }), timeoutMillis);

      onceEverySocketExceptOne({
        namespace: this.namespace,
        eventName: PROMPT_RESPONSE,
        excludeSocketId: sender.id,
        callback: (data, id) => {
          const resp = data as PROMPT_OPTION_VALUE;

          if (resp === PROMPT_OPTION_CHALLENGE_PASS) {
            ignored += 1;

            if (ignored === playersCount - 1) {
              clearTimeout(timer);
              resolve({ challengerId: '', response: resp });
            }
          } else {
            clearTimeout(timer);
            resolve({ challengerId: id, response: resp });
          }
        },
      });
    });
  }

  async prompt(
    target: Socket,
    message: string,
    options: PromptOption[],
    defaultValue?: string,
    variant?: PromptVariant,
    timeoutMillis = 1000000,
  ): Promise<string> {
    this.emitToPlayer(target, message, options, variant, timeoutMillis);
    const fallback = defaultValue ?? (options[0]?.value.toString() ?? '');
    return this.waitForResponse(target, fallback, timeoutMillis);
  }
}
