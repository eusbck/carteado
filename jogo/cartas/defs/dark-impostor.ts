// Dark Impostor
// {4}{B}{B}: Exile target creature and put a +1/+1 counter on this creature.
// This creature has all activated abilities of all creature cards exiled with it.
import { activated, addCounters, defineCard, exile, linkedExiled, printedChars, selfGets, t, tgt } from '../../motor/api.ts';
import { registry } from '../../motor/defs.ts';

const CHAVE = 'impostor';

export default defineCard({
  name: 'Dark Impostor',
  faces: [{
    abilities: [
      activated('{4}{B}{B}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // ruling 5: cada Dark Impostor guarda as próprias cartas (CR 607.2a)
        yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { targets: [t.creature()], text: '{4}{B}{B}: Exile a criatura alvo e coloque um marcador +1/+1 nesta criatura.' }),
      // ruling 2: só habilidades ativadas (as de mana inclusive); ruling 4: só de cartas de criatura; ruling 1: só as da
      // face da frente; ruling 3: a habilidade ganha fala desta criatura (c.source é o Dark Impostor)
      selfGets((c, o) => {
        const ids: string[] = [];
        for (const carta of linkedExiled(c.g, o.id, CHAVE)) {
          const x = c.g.state.objects[carta];
          if (!x || !x.def || !printedChars(x.def, 0, x.owner).types.includes('Creature')) continue;
          for (const a of printedChars(x.def, 0, x.owner).abilities) {
            const def = registry.abilities.get(a.id);
            if ((def?.kind === 'activated' || def?.kind === 'mana') && !ids.includes(a.id)) ids.push(a.id);
          }
        }
        return ids.map((id) => ({ k: 'addAbility' as const, id }));
      }, 'Esta criatura tem todas as habilidades ativadas de todas as cartas de criatura exiladas com ela.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 712.8a — da carta de duas faces exilada valem só as habilidades da face da frente (cartas/defs/dark-impostor.ts)',
    2: 'teste: ganha as habilidades ativadas da criatura exilada, não as desencadeadas nem as estáticas',
    3: 'regra geral: CR 201.5 — a habilidade ganha se refere ao próprio Dark Impostor (a fonte da habilidade é ele)',
    4: 'regra geral: CR 607.2a — só as cartas de criatura exiladas contam; um terreno animado exilado não dá habilidades',
    5: 'regra geral: CR 607.2a — cada Dark Impostor tem só as habilidades das cartas exiladas com ele (motor/criaturas.ts linkedExiled)',
    6: 'regra geral: CR 400.7 — saindo do campo, perde a ligação com as cartas exiladas',
  },
});
