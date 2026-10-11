// Exchange of Words
// When this enchantment enters, choose two target creatures. For as long as this enchantment remains on the battlefield,
// exchange the text boxes of those creatures.
import { addEffect, copiableValues, copyValuesChars, defineCard, etb, t, tgt } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

/** o texto de regras da criatura: as habilidades dos valores copiáveis dela, sem o que outros efeitos concederam */
function textoDe(g: G, id: ObjId): { id: string; kw?: string; param?: unknown }[] {
  return copyValuesChars(copiableValues(g, id), g.state.objects[id].owner).abilities.map((a) => ({ id: a.id, kw: a.kw, param: a.param }));
}

export default defineCard({
  name: 'Exchange of Words',
  faces: [{
    abilities: [
      etb(function* (c) {
        const s = c.g.state;
        const a = tgt(c, 0);
        const b = tgt(c, 1);
        // ruling 3: sem Exchange of Words no campo, ou com um dos alvos ilegal, nada é trocado (CR 701.12a)
        if (a === null || b === null || s.objects[c.source]?.zone !== 'battlefield') return;
        const textoA = textoDe(c.g, a);
        const textoB = textoDe(c.g, b);
        // CR 612.5, camada 3 (mudança de texto, 613.1c): o que outros efeitos concedem vem depois e continua valendo (ruling 2). Um
        // efeito por criatura: a saída de uma delas não desfaz a troca na outra (ruling 4)
        const duracao = { kind: 'whileOnBattlefield' as const, obj: c.source };
        addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: duracao, affected: [a], mods: [{ k: 'setText', abilities: textoB }] });
        addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: duracao, affected: [b], mods: [{ k: 'setText', abilities: textoA }] });
        c.g.log('Exchange of Words: as duas criaturas trocam as caixas de texto.', { rule: '612.5' });
      }, {
        targets: [t.creature(undefined, 'primeira criatura alvo'), { ...t.creature(undefined, 'segunda criatura alvo'), differentFrom: [0] }],
        text: 'Quando este encantamento entra, escolha duas criaturas alvo. Enquanto este encantamento continuar no campo, troque as caixas de texto dessas criaturas.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: cada criatura perde o próprio texto de regras e fica com o da outra',
    2: 'teste: a habilidade concedida por uma Aura continua na criatura em que a Aura está',
    3: 'teste: se Exchange of Words sai do campo antes de o gatilho resolver, nada é trocado',
    4: 'teste: a troca acaba quando Exchange of Words sai do campo, e não quando uma das criaturas sai',
    5: 'regra geral: CR 611.2b — a duração depende só de Exchange of Words continuar no campo, tenha ela habilidades ou não (motor/state.ts, duração whileOnBattlefield)',
  },
});
