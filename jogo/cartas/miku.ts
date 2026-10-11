// Peças e notas de rulings repetidas nas cartas do deck Hatsune Miku (ganho de vida, fichas e popular).
import { addMana, and, chooseOne, is, isLand, lkiChars, on, staticAbility, toughness, triggered } from '../motor/api.ts';
import type { AbilityDef, TriggerSpec } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ManaType, ObjId } from '../motor/types.ts';

const NOME_DA_MANA: Record<string, string> = { W: 'Branca', U: 'Azul', B: 'Preta', R: 'Vermelha', G: 'Verde', C: 'Incolor' };

/**
 * "Sempre que você vira um terreno para gerar mana, adicione uma mana de qualquer tipo que esse terreno produziu"
 * (Mirari's Wake; Vorinclex, Voice of Hunger). Habilidade de mana desencadeada (CR 605.1b): não usa a pilha. Com mais
 * de um tipo produzido, você escolhe um; a mana a mais não carrega as restrições da original.
 */
export function manaAMaisDeTerreno(): AbilityDef[] {
  return [
    // avisa o pagamento automático da mana a mais
    staticAbility({ rules: { extraManaForPlanning: (c, player, source, produced, tapped) => (player === c.you && tapped && !!c.g.state.objects[source] && isLand(c.g, source) && produced.length ? [produced[0]] : []) } }),
    triggered(on.custom((e, c) => e.type === 'mana' && e.player === c.you && !!e.tappedForMana && !!c.g.state.objects[e.source] && isLand(c.g, e.source) && e.produced.length > 0), function* (c) {
      const tipos = [...new Set(c.event.produced as ManaType[])];
      let tipo = tipos[0];
      if (tipos.length > 1) tipo = (yield* chooseOne(c.g, c.you, 'Adicione uma mana de qual tipo que o terreno produziu?', tipos.map((t) => ({ id: t, label: NOME_DA_MANA[t] ?? t })))) as ManaType;
      addMana(c.g, c.you, [tipo], { source: c.source });
    }, { mana: true, text: 'Sempre que você vira um terreno para gerar mana, adicione uma mana de qualquer tipo que esse terreno produziu.' }),
  ];
}

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
