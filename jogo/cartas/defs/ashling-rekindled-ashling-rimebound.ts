// Ashling, Rekindled // Ashling, Rimebound
// Frente — Whenever this creature enters or transforms into Ashling, Rekindled, you may discard a card. If you do, draw
// a card. At the beginning of your first main phase, you may pay {U}. If you do, transform Ashling.
// Verso — Whenever this creature transforms into Ashling, Rimebound and at the beginning of your first main phase, add
// two mana of any one color. Spend this mana only to cast spells with mana value 4 or greater.
// At the beginning of your first main phase, you may pay {R}. If you do, transform Ashling.
import { addMana, chooseColor, defineCard, defineFn, discard, draw, manaValue, mayPay, on, transformFrom, triggered, yesNo, type G } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';

const NOME = 'Ashling, Rekindled // Ashling, Rimebound';
const VM4 = 'Ashling, Rimebound:valorDeMana4';
defineFn(VM4, (g: G, purpose: { kind: string; obj?: number }) => purpose.kind === 'spell' && purpose.obj !== undefined && manaValue(g, purpose.obj) >= 4);

function* ciclo(c: Ctx) {
  if (c.g.state.zones.hand[c.you].length === 0) return;
  if (!(yield* yesNo(c.g, c.you, 'Ashling: descartar uma carta para comprar uma?'))) return;
  const d = yield* discard(c.g, c.you, 1);
  if (d.length) yield* draw(c.g, c.you, 1);
}

function* manaDoVerso(c: Ctx) {
  const cor = yield* chooseColor(c.g, c.you, 'Ashling, Rimebound: escolha a cor das duas manas');
  addMana(c.g, c.you, [cor, cor], { source: c.source, restriction: VM4 });
}

const transforma = (custo: string, face: number) => function* (c: Ctx) {
  // ruling 1: se já transformou enquanto a habilidade esperava, pagar não transforma de novo (CR 701.28f)
  if (c.g.state.objects[c.source]?.face !== face) return;
  if (yield* mayPay(c, c.you, custo, 'transformar Ashling')) transformFrom(c.g, c.source, face);
};

export default defineCard({
  name: NOME,
  faces: [
    {
      abilities: [
        triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'transform' && e.obj === c.source && e.to === 0)), ciclo,
          { text: 'Sempre que esta criatura entra ou se transforma em Ashling, Rekindled, você pode descartar uma carta. Se fizer isso, compre uma carta.' }),
        triggered(on.firstMain(), transforma('{U}', 0), { text: 'No início da sua primeira fase principal, você pode pagar {U}. Se fizer isso, transforme Ashling.' }),
      ],
    },
    {
      abilities: [
        triggered(on.custom((e, c) => e.type === 'transform' && e.obj === c.source && e.to === 1), manaDoVerso,
          { text: 'Sempre que esta criatura se transforma em Ashling, Rimebound, adicione duas manas de uma cor. Gaste essa mana só em mágicas com valor de mana 4 ou mais.' }),
        triggered(on.firstMain(), manaDoVerso, { text: 'No início da sua primeira fase principal, adicione duas manas de uma cor. Gaste essa mana só em mágicas com valor de mana 4 ou mais.' }),
        triggered(on.firstMain(), transforma('{R}', 1), { text: 'No início da sua primeira fase principal, você pode pagar {R}. Se fizer isso, transforme Ashling.' }),
      ],
    },
  ],
  rulings: {
    1: 'teste: CR 701.28f: se já transformou, pagar não transforma de novo',
    2: 'regra geral: CR 707.8 — ficha cópia de carta de duas faces também tem as duas faces',
    3: 'regra geral: CR 903.4 — identidade de cor considera as duas faces (dados Oracle)',
    4: 'teste: no campo, só valem as características da face para cima',
    5: 'regra geral: CR 712.8a — fora do campo, só a frente',
    6: 'não se aplica: nenhuma carta dos decks põe no campo transformada uma carta que não é de duas faces',
    7: 'regra geral: CR 202.2 — a cor do verso vem do indicador de cor (dados Oracle)',
    8: 'regra geral: CR 712.14 — entra com a frente para cima',
    9: 'regra geral: CR 712.8e — valor de mana da frente (motor/oracle.ts)',
    10: 'regra geral: CR 107.3 — X na pilha',
  },
});
