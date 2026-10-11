// Peças e notas de rulings repetidas nas cartas do deck Hatsune Miku (ganho de vida, fichas e popular).
import { and, is, lkiChars, on, toughness } from '../motor/api.ts';
import type { TriggerSpec } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId } from '../motor/types.ts';

/** notas dos rulings de popular, que se repetem em todas as cartas com a palavra */
export const POPULAR = {
  copia: 'regra geral: CR 707.2 — a ficha nova copia as características da ficha original, como o efeito que a criou as definiu (motor/criaturas.ts populate)',
  naoMira: 'regra geral: CR 701.36a — popular não tem alvo: a ficha é escolhida ao popular, e pode ser a que acabou de ser criada (motor/criaturas.ts populate)',
  copiaDeCopia: 'regra geral: CR 707.3 — copiando uma ficha que é cópia de outra criatura, a nova copia o que a original copia (motor/mecanicas.ts copiableValues)',
  semFicha: 'regra geral: CR 701.36a — sem ficha de criatura, popular não faz nada (motor/criaturas.ts populate)',
  semEstado: 'regra geral: CR 707.2 — a cópia não copia virada, marcadores, Auras, Equipamentos nem efeitos que não são de cópia (motor/mecanicas.ts copiableValues)',
  entrar: 'regra geral: CR 603.6a — as habilidades de entrar da ficha copiada disparam para a ficha nova (motor/triggers.ts)',
};

/** notas dos rulings de "sempre que você ganha vida" */
export const GANHO_DE_VIDA = {
  umPorEvento: 'regra geral: CR 119.9 — um gatilho por evento de ganho de vida, seja de quanto for (motor/dsl.ts on.youGainLife)',
  danoLetal: 'regra geral: CR 704.3 — o dano letal é conferido antes de o gatilho resolver: o marcador não chega a tempo de salvar a criatura (motor/sba.ts)',
  vinculo: 'regra geral: CR 702.15e — cada fonte com vínculo com a vida causa um evento de ganho de vida próprio; uma fonte só, um evento só (motor/actions.ts dealDamage)',
  paraCada: 'regra geral: CR 119.9 — ganhar vida "para cada" coisa é um evento só (motor/actions.ts gainLife)',
  duasCabecas: 'não se aplica: Gigante de Duas Cabeças não existe no jogo',
};

/** "sempre que outra criatura que você controla entra" (o evento de entrada fica em c.event, com a criatura em c.event.obj) */
export function entraOutraCriaturaSua(): TriggerSpec {
  return on.enters(and(is.creature, is.yours, is.other));
}

/** resistência da criatura agora, ou a que ela tinha quando saiu do campo (CR 608.2h) */
export function resistenciaDe(g: G, id: ObjId): number {
  return g.state.objects[id]?.zone === 'battlefield' ? toughness(g, id) : (lkiChars(g, id)?.toughness ?? 0);
}
