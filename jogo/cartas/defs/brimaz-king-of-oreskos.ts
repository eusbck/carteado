// Brimaz, King of Oreskos
// Vigilance
// Whenever Brimaz attacks, create a 1/1 white Cat Soldier creature token with vigilance that's attacking.
// Whenever Brimaz blocks a creature, create a 1/1 white Cat Soldier creature token with vigilance that's blocking that
// creature.
import { createTokens, defineCard, keyword, on, putOntoBattlefield, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { escolheAtacado } from '../viloes.ts';

export default defineCard({
  name: 'Brimaz, King of Oreskos',
  faces: [{
    abilities: [
      keyword('vigilance'),
      // ruling 1: você escolhe quem a ficha ataca ao criá-la (CR 508.4); ruling 3: ela não foi declarada atacante
      triggered(on.selfAttacks(), function* (c) {
        const alvo = yield* escolheAtacado(c, 'Brimaz');
        yield* putOntoBattlefield(c.g, [{ controller: c.you, token: { def: 'Cat Soldier' }, attacking: alvo ?? undefined }], 'token');
      }, { text: 'Sempre que Brimaz ataca, crie uma ficha de criatura Cat Soldier 1/1 branca com vigilância que está atacando.' }),
      // ruling 2: um gatilho para cada criatura que Brimaz bloqueia
      triggered(on.custom((e, c) => (e.type === 'blockers' ? e.blocks.filter(([b]) => b === c.source).map(([, a]) => ({ atacante: a })) : false)), function* (c) {
        const atacante = c.event.atacante as ObjId;
        const [ficha] = yield* createTokens(c.g, c.you, 'Cat Soldier', 1);
        const combate = c.g.state.combat;
        const a = combate?.attackers.find((x) => x.id === atacante && !x.removed);
        // a ficha entra bloqueando só se o atacante ainda está no combate (ruling 3: ela não foi declarada bloqueadora)
        if (ficha === undefined || !combate || !a || c.g.state.objects[atacante]?.zone !== 'battlefield') return;
        combate.blockers.push({ id: ficha, blocking: [atacante] });
        a.blockers.push(ficha);
        a.blocked = true;
        c.g.bump();
      }, { text: 'Sempre que Brimaz bloqueia uma criatura, crie uma ficha de criatura Cat Soldier 1/1 branca com vigilância que está bloqueando essa criatura.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 508.4 — você escolhe quem a ficha ataca ao criá-la (cartas/viloes.ts escolheAtacado)',
    2: 'regra geral: CR 603.2 — bloqueando duas criaturas, o gatilho dispara para cada uma (cartas/defs/brimaz-king-of-oreskos.ts)',
    3: 'regra geral: CR 506.3 — a ficha entra atacando ou bloqueando sem ter sido declarada: gatilhos de atacar e bloquear não disparam',
  },
});
