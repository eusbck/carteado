// Hazel's Brewmaster
// Menace
// Whenever this creature enters or attacks, exile up to one target card from a graveyard and create a Food token.
// Foods you control have all activated abilities of all creature cards exiled with this creature.
import { controllerOf, createTokens, defineCard, exile, keywords, linkedExiled, on, printedChars, registry, staticAbility, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { abilitiesOfDef } from '../../motor/chars.ts';
import type { Mod } from '../../motor/types.ts';
import { COMIDA, ehComida } from '../esquilos.ts';

const CHAVE = 'brewmaster';

export default defineCard({
  name: "Hazel's Brewmaster",
  faces: [{
    abilities: [
      ...keywords('menace'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), function* (c) {
        // ruling 5: sem alvo, só a Food; com alvo ilegal, a habilidade não resolve (CR 608.2b)
        const id = tgt(c);
        if (id !== null) yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
        yield* createTokens(c.g, c.you, 'Food', 1);
      }, {
        targets: [upTo(1, t.card('graveyard', undefined, 'até uma carta alvo de um cemitério', 'any'))],
        text: 'Sempre que esta criatura entra ou ataca, exile até uma carta alvo de um cemitério e crie uma ficha Food.',
      }),
      // ruling 7: só as habilidades ativadas (as de mana também são ativadas, CR 605.1a); ruling 8: valem como se fossem
      // da própria Food (CR 607: as cartas exiladas por ela, enquanto continuarem no exílio)
      staticAbility({
        affects: (c, o) => o.zone === 'battlefield' && controllerOf(c.g, o.id) === c.you && ehComida(c.g, o.id),
        mods: (c) => {
          const mods: Mod[] = [];
          for (const carta of linkedExiled(c.g, c.source, CHAVE)) {
            const o = c.g.state.objects[carta];
            if (!o || !printedChars(o.def, 0, o.owner).types.includes('Creature')) continue;
            for (const inst of abilitiesOfDef(o.def, 0)) {
              const kind = registry.abilities.get(inst.id)?.kind;
              if (kind === 'activated' || kind === 'mana') mods.push({ k: 'addAbility', id: inst.id });
            }
          }
          return mods;
        },
        text: 'As Foods que você controla têm todas as habilidades ativadas de todas as cartas de criatura exiladas com esta criatura.',
      }),
    ],
  }],
  rulings: {
    1: COMIDA.piada,
    2: COMIDA.qualquer,
    3: COMIDA.tipo,
    4: COMIDA.umCusto,
    5: 'teste: ao entrar, exila Chittering Witch de um cemitério e cria uma Food; a Food ganha a habilidade ativada da Witch',
    6: 'regra geral: CR 602.1 — habilidades ativadas são as que têm "[custo]: [efeito]"',
    7: 'teste: ao entrar, exila Chittering Witch de um cemitério e cria uma Food; a Food ganha a habilidade ativada da Witch',
    8: 'teste: ao entrar, exila Chittering Witch de um cemitério e cria uma Food; a Food ganha a habilidade ativada da Witch',
  },
});
