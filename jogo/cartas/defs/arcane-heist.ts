// Arcane Heist
// You may cast target instant or sorcery card from an opponent's graveyard without paying its mana cost. If that spell
// would be put into their graveyard, exile it instead.
// Cipher (Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat
// damage to a player, its controller may cast a copy of the encoded card without paying its mana cost.)
import {
  addEffect, chooseItems, createObject, creaturesOf, defineAbility, defineCard, is, linkedExiled, mayCastFree, moveObjects, nameOf, objItem, on, t,
  tgt, triggered, yesNo,
} from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';
import { conjuraGratis } from '../roubo.ts';

const CHAVE = 'cifra';

// CR 702.99a: a carta codificada dá esta habilidade à criatura; quem controla a criatura pode conjurar a cópia (ruling 13)
const CODIFICADA = defineAbility('Arcane Heist:codificada', triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
  for (const carta of linkedExiled(c.g, c.source, CHAVE)) {
    const def = c.g.state.objects[carta].def;
    // CR 702.99a, 707.12: a cópia é criada no exílio e conjurada dali durante a resolução (ruling 11: sem conjurar, ela some)
    const copia = createObject(c.g, { def, owner: c.you, controller: c.you, zone: 'exile', isCopy: true, copyOf: { def, face: 0 } });
    yield* mayCastFree(c.g, c.you, copia.id, `Cifra: conjurar uma cópia de ${nameOf(c.g, carta)} sem pagar o custo de mana?`);
  }
}, { text: 'Sempre que esta criatura causa dano de combate a um jogador, quem a controla pode conjurar uma cópia da carta codificada sem pagar o custo de mana.' }));

/** Cifra (CR 702.99a): "depois, você pode exilar esta carta de mágica codificada numa criatura que você controla" */
function* cifrar(c: Ctx): Gen<void> {
  const g = c.g;
  const magica = g.state.objects[c.source];
  // ruling 6: só a carta que está resolvendo; uma cópia da mágica não é carta (CR 707.10)
  if (!magica || magica.zone !== 'stack' || magica.isCopy) return;
  const minhas = creaturesOf(g, c.you);
  if (!minhas.length) return;
  // ruling 5: a criatura é escolhida na resolução, sem alvo
  if (!(yield* yesNo(g, c.you, 'Cifra: codificar Arcane Heist numa criatura que você controla?'))) return;
  const [esc] = yield* chooseItems(g, c.you, 'Cifra: escolha a criatura em que Arcane Heist fica codificada', minhas.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
  const criatura = Number(esc);
  // ruling 4: vai direto da pilha para o exílio
  const [ex] = yield* moveObjects(g, [{ id: c.source, to: 'exile' }], 'cipher', c.you);
  const alvo = g.state.objects[criatura];
  if (ex === null || ex === undefined || !alvo || alvo.zone !== 'battlefield') return;
  alvo.linked[CHAVE] = [...(alvo.linked[CHAVE] ?? []), ex];
  // ruling 7: se a criatura sair do campo, a carta deixa de estar codificada (objeto novo, CR 400.7)
  addEffect(g, { source: criatura, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: criatura }, affected: [criatura], mods: [{ k: 'addAbility', id: CODIFICADA.id! }] });
  g.log(`${g.state.players[c.you].name} codifica Arcane Heist em ${nameOf(g, criatura)}.`, { rule: '702.99a' });
}

export default defineCard({
  name: 'Arcane Heist',
  faces: [{
    spell: {
      targets: [t.card('graveyard', is.instantOrSorcery, 'carta de instantânea ou feitiço alvo do cemitério de um oponente', 'opponent')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null && (yield* yesNo(c.g, c.you, `Arcane Heist: conjurar ${nameOf(c.g, id)} sem pagar o custo de mana?`))) {
          yield* conjuraGratis(c, id, { exilaEmVezDoCemiterio: true });
        }
        yield* cifrar(c);
      },
    },
  }],
  rulings: {
    1: 'teste: conjura a carta do cemitério do oponente de graça; ela é exilada depois de resolver',
    2: 'regra geral: CR 118.9a — sem pagar o custo de mana não se escolhe custo alternativo (motor/stack.ts)',
    3: 'regra geral: CR 107.3b — sem pagar o custo de mana, X vale 0 (motor/stack.ts)',
    4: 'teste: codificada, Arcane Heist vai da pilha para o exílio',
    5: 'regra geral: CR 702.99a — a criatura é escolhida na resolução e não é alvo',
    6: 'regra geral: CR 608.2b — se Arcane Heist não resolve, nada acontece, nem a cifra',
    7: 'teste: se a criatura sai do campo, a carta deixa de estar codificada',
    8: 'regra geral: CR 702.99a — só se codifica numa criatura (a escolha só lista as suas criaturas)',
    9: 'teste: quando a criatura codificada causa dano de combate, você conjura uma cópia de graça',
    10: 'regra geral: CR 608.2g — a cópia é conjurada durante a resolução do gatilho, ignorando o tempo de feitiço',
    11: 'regra geral: CR 704.5e — a cópia que não é conjurada deixa de existir (motor/sba.ts)',
    12: 'regra geral: CR 702.99a — a habilidade é concedida à criatura; se ela perder as habilidades, não dispara',
    13: 'regra geral: CR 702.99a — quem controla a criatura controla o gatilho e conjura a cópia',
    14: 'regra geral: CR 603.2 — dano a dois jogadores dispara duas vezes (on.selfDealsCombatDamageToPlayer, um por evento)',
  },
});
