// Armed and Armored
// Vehicles you control become artifact creatures until end of turn. Choose a Dwarf you control. Attach any number of
// Equipment you control to it.
import { attach, chooseItems, controlledBy, defineCard, isCreature, isSubtype, nameOf, objItem } from '../../motor/api.ts';
import { equipamentosDe } from '../jin.ts';
import { veiculosDe, viramCriaturasArtefato } from '../veiculos.ts';

export default defineCard({
  name: 'Armed and Armored',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 2: os Veículos afetados são os de agora (CR 611.2c)
        viramCriaturasArtefato(c, veiculosDe(c.g, c.you));
        // ruling 1: sem Dwarf ou sem Equipamento, o resto não acontece
        const anoes = controlledBy(c.g, c.you, (id) => isCreature(c.g, id) && isSubtype(c.g, id, 'Dwarf'));
        if (!anoes.length) return;
        const [anao] = anoes.length === 1 ? [String(anoes[0])] : yield* chooseItems(c.g, c.you, 'Armed and Armored: escolha um Dwarf que você controla', anoes.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
        const equips = equipamentosDe(c.g, c.you);
        if (!equips.length) return;
        const quais = yield* chooseItems(c.g, c.you, `Armed and Armored: anexe quantos Equipamentos quiser a ${nameOf(c.g, Number(anao))}`, equips.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, equips.length);
        for (const e of quais) attach(c.g, Number(e), Number(anao));
      },
    },
  }],
  rulings: {
    1: 'teste: os Veículos viram criaturas; sem Dwarf, nada é anexado',
    2: 'regra geral: CR 611.2c — os Veículos afetados são os controlados quando a mágica resolve (efeito com conjunto travado)',
  },
});
