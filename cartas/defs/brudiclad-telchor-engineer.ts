// Brudiclad, Telchor Engineer
// Creature tokens you control have haste.
// At the beginning of combat on your turn, create a 2/1 blue Phyrexian Myr artifact creature token. Then you may choose a
// token you control. If you do, each other token you control becomes a copy of that token.
import { addEffect, chooseItems, controlledBy, copiableValues, createTokens, defineCard, isCreature, nameOf, objItem, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Brudiclad, Telchor Engineer',
  faces: [{
    abilities: [
      staticAbility({
        affects: (c, o) => o.zone === 'battlefield' && o.controller === c.you && o.isToken && isCreature(c.g, o.id),
        mods: () => [{ k: 'addKeyword', kw: 'haste' }],
        text: 'As fichas de criatura que você controla têm ímpeto.',
      }),
      triggered(on.beginCombat('you'), function* (c) {
        yield* createTokens(c.g, c.you, 'Phyrexian Myr', 1);
        const fichas = controlledBy(c.g, c.you, (id) => c.g.state.objects[id].isToken);
        if (fichas.length < 2) return;
        const itens = [{ id: '', label: 'Não escolher' }, ...fichas.map((id) => objItem(c.g, id, nameOf(c.g, id)))];
        const [escolha] = yield* chooseItems(c.g, c.you, 'Brudiclad: escolha uma ficha; as outras viram cópias dela', itens, 1, 1);
        if (!escolha) return;
        const modelo = Number(escolha);
        // rulings 1-5: dura para sempre; todas as outras fichas, de qualquer tipo; valores copiáveis do modelo
        const outras = fichas.filter((id) => id !== modelo && c.g.state.objects[id]?.zone === 'battlefield');
        if (outras.length) addEffect(c.g, { source: c.source, sourceDef: 'Brudiclad, Telchor Engineer', controller: c.you, duration: { kind: 'permanent' }, affected: outras, mods: [{ k: 'copy', of: copiableValues(c.g, modelo) }] });
      }, { text: 'No início do combate no seu turno, crie uma ficha de criatura artefato Phyrexian Myr azul 2/1. Depois, você pode escolher uma ficha que você controla. Se fizer isso, cada outra ficha que você controla vira uma cópia dela.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 611.2a — o efeito dura mesmo que Brudiclad saia',
    2: 'teste: a Myr nova também vira cópia se não for a escolhida',
    3: 'regra geral: CR 707.3 — copia o que a escolhida estiver copiando',
    4: 'regra geral: CR 707.2 — sem marcadores nem efeitos',
    5: 'teste: um Tesouro vira cópia da criatura escolhida',
    6: 'regra geral: CR 506.4 — atacante continua atacando se perder o ímpeto',
  },
});
