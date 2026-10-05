// Slaughter the Strong
// Each player chooses any number of creatures they control with total power 4 or less, then sacrifices all other
// creatures they control.
import { ask, creaturesOf, defineCard, nameOf, objItem, power, sacrifice } from '../../motor/api.ts';
import type { Answer, ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Slaughter the Strong',
  faces: [{
    spell: {
      *effect(c) {
        const poupadas: ObjId[] = [];
        // ruling 2: em ordem APNAP, sabendo as escolhas anteriores; depois todos sacrificam juntos
        for (const p of c.g.apnap()) {
          const minhas = creaturesOf(c.g, p);
          if (!minhas.length) continue;
          const itens = minhas.map((id) => objItem(c.g, id, `${nameOf(c.g, id)} (força ${power(c.g, id)})`));
          // rulings 1, 3: a soma (força negativa subtrai) precisa ser 4 ou menos
          const soma = (ids: string[]) => ids.reduce((s, id) => s + power(c.g, Number(id)), 0);
          const valida = (a: Answer) => (a.kind === 'select' && soma(a.ids) > 4 ? 'A força total das criaturas escolhidas passa de 4' : null);
          const r = yield* ask<Extract<Answer, { kind: 'select' }>>(c.g, {
            kind: 'select', player: p, prompt: 'Slaughter the Strong: escolha as criaturas que ficam (força total 4 ou menos); as outras são sacrificadas',
            items: itens, min: 0, max: itens.length,
          }, valida);
          poupadas.push(...r.ids.map(Number));
        }
        const resto = c.g.apnap().flatMap((p) => creaturesOf(c.g, p)).filter((id) => !poupadas.includes(id));
        if (resto.length) yield* sacrifice(c.g, resto);
      },
    },
  }],
  rulings: {
    1: 'teste: força negativa subtrai da soma',
    2: 'regra geral: CR 101.4 — escolhas em ordem APNAP, sacrifícios simultâneos',
    3: 'teste: a soma das escolhidas precisa ser 4 ou menos',
  },
});
