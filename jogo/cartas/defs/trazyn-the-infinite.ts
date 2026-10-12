// Trazyn the Infinite
// Deathtouch
// Prismatic Gallery — As long as Trazyn is on the battlefield, it has all activated abilities of all artifact cards in
// your graveyard.
import { chars, defineCard, keyword, selfGets } from '../../motor/api.ts';
import { registry } from '../../motor/defs.ts';

export default defineCard({
  name: 'Trazyn the Infinite',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      // ruling 1: só habilidades ativadas (as de mana inclusive); ruling 3: a habilidade ganha fala do próprio Trazyn
      // (c.source é ele). Olha as cartas como estão no cemitério (com Biotransference, as de criatura contam).
      selfGets((c, o) => {
        const ids: string[] = [];
        for (const carta of c.g.state.zones.graveyard[c.you]) {
          const ch = chars(c.g, carta);
          if (!ch.types.includes('Artifact')) continue;
          for (const a of ch.abilities) {
            const def = registry.abilities.get(a.id);
            if ((def?.kind === 'activated' || def?.kind === 'mana') && !ids.includes(a.id)) ids.push(a.id);
          }
        }
        void o;
        return ids.map((id) => ({ k: 'addAbility' as const, id }));
      }, 'Prismatic Gallery — Enquanto Trazyn estiver no campo de batalha, ele tem todas as habilidades ativadas de todas as cartas de artefato no seu cemitério.'),
    ],
  }],
  rulings: {
    1: 'teste: tem as habilidades ativadas das cartas de artefato do seu cemitério, e só delas',
    2: 'regra geral: CR 602.1 — habilidade ativada é a escrita como "[custo]: [efeito]", inclusive palavras-chave ativadas (motor/defs.ts)',
    3: 'regra geral: CR 201.5 — a habilidade que cita a carta pelo nome passa a falar de Trazyn (a fonte da habilidade é ele)',
  },
});