// Cursed Mirror
// {T}: Add {R}.
// As this artifact enters, you may have it become a copy of any creature on the battlefield until end of turn, except it
// has haste.
import { allCreatures, asEnters, chooseItems, copiableValues, defineCard, mana, nameOf, objItem } from '../../motor/api.ts';

export default defineCard({
  name: 'Cursed Mirror',
  faces: [{
    abilities: [
      mana('R', { text: '{T}: Adicione {R}.' }),
      // ruling 2: só criaturas que já estão no campo
      asEnters(function* (c, ev) {
        const cands = allCreatures(c.g).filter((id) => id !== ev.obj);
        if (!cands.length) return;
        const itens = [{ id: '', label: 'Não copiar' }, ...cands.map((id) => objItem(c.g, id, nameOf(c.g, id)))];
        const [escolha] = yield* chooseItems(c.g, ev.controller, 'Cursed Mirror: virar uma cópia de uma criatura até o fim do turno?', itens, 1, 1);
        if (!escolha) return;
        const v = copiableValues(c.g, Number(escolha));
        // rulings 1, 3-8: valores copiáveis, com ímpeto como exceção; perde o próprio {T}: Adicione {R} enquanto copia
        const of = { ...v, except: { ...(v.except ?? {}), addKeywords: [...(v.except?.addKeywords ?? []), 'haste'] } };
        ev.enterEffects = [...(ev.enterEffects ?? []), { mods: [{ k: 'copy', of }], duration: { kind: 'endOfTurn' }, controller: ev.controller, sourceDef: 'Cursed Mirror' }];
      }, 'Ao entrar, você pode fazê-lo virar uma cópia de qualquer criatura no campo até o fim do turno, exceto que tem ímpeto.'),
    ],
  }],
  rulings: {
    1: 'teste: as habilidades de entrar da criatura copiada disparam',
    2: 'regra geral: CR 614.12 — só criaturas que já estão no campo',
    3: 'regra geral: CR 707.2 — a duração não é copiada',
    4: 'teste: enquanto copia, não tem a habilidade de mana',
    5: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
    6: 'regra geral: CR 707.3 — copia o que a criatura estiver copiando',
    7: 'regra geral: CR 707.2 — copiar ficha não faz virar ficha',
    8: 'regra geral: CR 707.9 — X vale 0',
  },
});
