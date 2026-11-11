// Zack Fair
// Zack Fair enters with a +1/+1 counter on it.
// {1}, Sacrifice Zack Fair: Target creature you control gains indestructible until end of turn. Put Zack Fair's
// counters on that creature and attach an Equipment that was attached to Zack Fair to that creature.
import { activated, addCounters, attach, chooseItems, defineCard, entersWithCounters, is, lkiObj, nameOf, objItem, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { equipamentosDoJogador } from '../armaria.ts';

export default defineCard({
  name: 'Zack Fair',
  faces: [{
    abilities: [
      entersWithCounters('+1/+1', 1),
      activated([{ k: 'mana', cost: '{1}' }, { k: 'sacrificeSelf' }], function* (c) {
        const alvo = tgt(c);
        if (alvo === null) return;
        untilEndOfTurn(c, [alvo], [{ k: 'addKeyword', kw: 'indestructible' }]);
        // rulings 1 e 3: põe a mesma quantidade de cada tipo de marcador que Zack tinha (última informação)
        const antes = lkiObj(c.g, c.source)?.counters ?? {};
        for (const [tipo, n] of Object.entries(antes)) if (n > 0) addCounters(c.g, { kind: 'obj', id: alvo }, tipo, n, c.you);
        // simplificação: o Equipamento que estava em Zack fica desanexado ao ele sair; escolhe um Equipamento seu solto
        const soltos = equipamentosDoJogador(c.g, c.you).filter((id) => c.g.state.objects[id].attachedTo == null);
        if (!soltos.length) return;
        const [e] = yield* chooseItems(c.g, c.you, 'Anexe um Equipamento que estava em Zack Fair', soltos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (e !== undefined) attach(c.g, Number(e), alvo);
      }, {
        targets: [t.creature(is.yours, 'criatura alvo que você controla')],
        text: '{1}, Sacrifique Zack Fair: A criatura alvo que você controla ganha indestrutível até o fim do turno. Coloque os marcadores de Zack Fair nela e anexe a ela um Equipamento que estava anexado a Zack Fair.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o alvo ganha indestrutível, os marcadores de Zack e o Equipamento',
    2: 'regra geral: CR 122.1 — outros efeitos podem pôr os mesmos marcadores em outra permanente (The Ozolith); não há The Ozolith nos decks',
    3: 'teste: o alvo ganha indestrutível, os marcadores de Zack e o Equipamento',
  },
});
