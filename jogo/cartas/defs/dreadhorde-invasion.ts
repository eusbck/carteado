// Dreadhorde Invasion
// At the beginning of your upkeep, you lose 1 life and amass Zombies 1. (Put a +1/+1 counter on an Army you control.
// It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)
// Whenever a Zombie token you control with power 6 or greater attacks, it gains lifelink until end of turn.
import {
  addCounters, addEffect, chars, chooseItems, controllerOf, createTokens, creaturesOf, defineCard, loseLife, nameOf, objItem, on,
  power, triggered, untilEndOfTurn, type Ctx, type Gen,
} from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

/**
 * CR 701.47a: amass Zombies N — sem Army, cria uma ficha Zombie Army preta 0/0; escolhe uma Army sua, põe N marcadores
 * +1/+1 nela e, se não for Zombie, ela passa a ser Zombie além dos outros tipos.
 */
function* amassarZumbis(c: Ctx, n: number): Gen<ObjId | null> {
  const exercitos = () => creaturesOf(c.g, c.you).filter((id) => chars(c.g, id).subtypes.includes('Army'));
  // ruling 7: a ficha entra como 0/0 e só depois recebe os marcadores
  if (exercitos().length === 0) yield* createTokens(c.g, c.you, 'Zombie Army', 1);
  const opcoes = exercitos();
  if (opcoes.length === 0) return null; // CR 701.47b: amassou mesmo assim
  // ruling 5: com várias Armies, você escolhe qual recebe os marcadores
  const alvo = opcoes.length === 1 ? opcoes[0]
    : Number((yield* chooseItems(c.g, c.you, `Amassar Zombies ${n}: escolha uma Army sua para receber os marcadores`, opcoes.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1))[0]);
  addCounters(c.g, { kind: 'obj', id: alvo }, '+1/+1', n, c.you);
  if (!chars(c.g, alvo).subtypes.includes('Zombie')) {
    addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: { kind: 'whileOnBattlefield', obj: alvo }, affected: [alvo], mods: [{ k: 'addTypes', subtypes: ['Zombie'] }] });
  }
  return alvo;
}

export default defineCard({
  name: 'Dreadhorde Invasion',
  faces: [{
    abilities: [
      triggered(on.upkeep('you'), function* (c) {
        loseLife(c.g, c.you, 1, c.source);
        yield* amassarZumbis(c, 1);
      }, { text: 'No início da sua manutenção, você perde 1 de vida e amassa Zombies 1.' }),
      // rulings 8-9: a força é vista só quando ela ataca; mudanças depois não tiram nem dão o vínculo
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        return e.attackers.filter((a) => {
          const o = c.g.state.objects[a.obj];
          return !!o && o.isToken && controllerOf(c.g, a.obj) === c.you && chars(c.g, a.obj).subtypes.includes('Zombie') && power(c.g, a.obj) >= 6;
        }).map((a) => ({ criatura: a.obj }));
      }), function* (c) {
        const id = c.event.criatura as ObjId;
        if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'lifelink' }]);
      }, { text: 'Sempre que uma ficha de Zombie que você controla com força 6 ou mais ataca, ela ganha vínculo com a vida até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: qualquer ficha de Zombie com força 6 ou mais ganha vínculo ao atacar, não só a Army',
    2: 'regra geral: CR 701.47c — a Army escolhida é a amassada',
    3: 'regra geral: CR 701.47d — amass Zombies',
    4: 'não se aplica: nenhuma carta dos decks amassa Orcs',
    5: 'teste: com duas Armies, você escolhe; uma Army que não é Zombie passa a ser',
    6: 'teste: na manutenção, perde 1 de vida e cria a Zombie Army 0/0 com um marcador +1/+1',
    7: 'teste: na manutenção, perde 1 de vida e cria a Zombie Army 0/0 com um marcador +1/+1',
    8: 'teste: a força é vista ao atacar: aumentar depois não dá vínculo',
    9: 'teste: a força é vista ao atacar: aumentar depois não dá vínculo',
  },
});
