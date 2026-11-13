// Tishana's Tidebinder
// Flash
// When this creature enters, counter up to one target activated or triggered ability. If an ability of an artifact,
// creature, or planeswalker is countered this way, that permanent loses all abilities for as long as this creature
// remains on the battlefield. (Mana abilities can't be targeted.)
import { addEffect, counter, defineCard, etb, isType, keyword, nameOf, tgt } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: "Tishana's Tidebinder",
  faces: [{
    abilities: [
      keyword('flash'),
      etb(function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const fonte = c.g.state.objects[id]?.stack?.source as ObjId | undefined;
        if (!(yield* counter(c.g, id))) return;
        // ruling 3: o tipo da fonte é visto agora; ruling 1: sem o Tidebinder no campo, ela não perde nada
        const f = fonte !== undefined ? c.g.state.objects[fonte] : undefined;
        if (!f || f.zone !== 'battlefield' || c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        if (!['Artifact', 'Creature', 'Planeswalker'].some((tp) => isType(c.g, f.id, tp))) return;
        // camada 6 (CR 613.1f): ruling 2, o que ela ganhar depois continua valendo (registro de data e hora)
        addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: c.source }, affected: [f.id], mods: [{ k: 'loseAllAbilities' }] });
        c.g.log(`${nameOf(c.g, f.id)} perde todas as habilidades enquanto Tishana's Tidebinder estiver no campo.`, { rule: '613.1f' });
      }, {
        // CR 115.5: não mira a si mesma (o próprio gatilho já está na pilha quando os alvos são escolhidos)
        targets: [{
          what: 'ability', label: 'até uma habilidade ativada ou desencadeada alvo', min: 0, max: 1,
          filter: (c, t) => { const st = t.kind === 'obj' ? c.g.state.objects[t.id]?.stack : undefined; return !!st && !(st.kind === 'triggered' && st.source === c.source); },
        }],
        text: 'Quando esta criatura entra, anule até uma habilidade ativada ou desencadeada alvo. Se uma habilidade de um artefato, criatura ou planeswalker for anulada assim, esse permanente perde todas as habilidades enquanto esta criatura continuar no campo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: se o Tidebinder sai do campo antes de resolver, a habilidade é anulada mas a fonte não perde nada',
    2: 'regra geral: CR 613.7 — o que a permanente ganhar depois tem registro mais novo e continua (motor/chars.ts)',
    3: 'teste: a fonte que não é artefato, criatura nem planeswalker (um terreno) não perde as habilidades',
  },
});
