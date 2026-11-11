// Shuri, Wakandan Inventor
// Artifact spells you cast cost {1} less to cast.
// {1}, {T}: Target artifact you control becomes a copy of a second target artifact you control until end of turn,
// except it isn't legendary. Activate only as a sorcery.
import { activated, becomeCopy, defineCard, is, staticAbility, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Shuri, Wakandan Inventor',
  faces: [{
    abilities: [
      staticAbility({
        rules: { costModifier: (c, spell) => (spell.controller === c.you && spell.chars.types.includes('Artifact') ? { reduce: 1 } : null) },
        text: 'As mágicas de artefato que você conjura custam {1} a menos para conjurar.',
      }),
      activated('{1}, {T}', function* (c) {
        const a = c.targets[0]?.[0], b = c.targets[1]?.[0];
        if (!a || !b || a.kind !== 'obj' || b.kind !== 'obj' || a.id === b.id) return;
        if (c.g.state.objects[a.id]?.zone !== 'battlefield' || c.g.state.objects[b.id]?.zone !== 'battlefield') return;
        becomeCopy(c, a.id, b.id, { except: { legendary: false }, duration: { kind: 'endOfTurn' } });
      }, {
        timing: 'sorcery',
        targets: [t.artifact(is.yours, 'artefato alvo que você controla (vira a cópia)'), t.artifact(is.yours, 'segundo artefato alvo que você controla (o modelo)')],
        text: '{1}, {T}: O artefato alvo que você controla vira uma cópia de um segundo artefato alvo que você controla até o fim do turno, exceto que não é lendário. Ative apenas como um feitiço.',
      }),
    ],
  }],
  rulings: {},
});
