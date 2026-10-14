// Nelly Borca, Impulsive Accuser
// Vigilance
// Whenever Nelly Borca attacks, suspect target creature. Then goad all suspected creatures. (A suspected creature has
// menace and can't block.)
// Whenever one or more creatures an opponent controls deal combat damage to one or more of your opponents, you and the
// controller of those creatures each draw a card.
import { defineCard, draw, keywords, lkiChars, on, t, tgt, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { goadaTodas, SUSPEITAR, suspeitar, suspeitas } from '../culpa.ts';

export default defineCard({
  name: 'Nelly Borca, Impulsive Accuser',
  faces: [{
    abilities: [
      ...keywords('vigilance'),
      triggered(on.selfAttacks(), function* (c) {
        const id = tgt(c);
        if (id !== null) suspeitar(c.g, id, c.you);
        // "depois goade todas as criaturas suspeitas": também as que já estavam suspeitas, de qualquer jogador
        goadaTodas(c.g, suspeitas(c.g), c.you);
      }, { targets: [t.creature()], text: 'Sempre que Nelly Borca ataca, suspeite da criatura alvo. Depois goade todas as criaturas suspeitas. (Uma criatura suspeita tem ameaçar e não pode bloquear.)' }),
      // um gatilho por oponente cujas criaturas causaram dano de combate a oponentes seus no mesmo lote (CR 603.2c)
      triggered(on.batch((evs, c) => {
        const donos = new Set<PlayerId>();
        for (const e of evs) {
          if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player') continue;
          if (!c.g.isOpponent(c.you, e.target.id) || !c.g.isOpponent(c.you, e.controller)) continue;
          if (!lkiChars(c.g, e.source)?.types.includes('Creature')) continue;
          donos.add(e.controller);
        }
        return [...donos].map((jogador) => ({ jogador }));
      }), function* (c) {
        const outro = c.event.jogador as PlayerId;
        // "você e o controlador dessas criaturas compram uma carta cada", em ordem APNAP (CR 101.4)
        for (const p of c.g.apnap().filter((x) => x === c.you || x === outro)) yield* draw(c.g, p, 1);
      }, { text: 'Sempre que uma ou mais criaturas que um oponente controla causam dano de combate a um ou mais dos seus oponentes, você e o controlador dessas criaturas compram uma carta cada.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode mirar uma criatura que já está suspeita: nada muda nela, e as suspeitas são goadadas',
    2: SUSPEITAR.designacao,
    3: SUSPEITAR.semHabilidades,
    4: SUSPEITAR.copia,
    5: SUSPEITAR.deNovo,
    6: SUSPEITAR.varias,
  },
});

