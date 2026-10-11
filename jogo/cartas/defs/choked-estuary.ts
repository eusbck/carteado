// Choked Estuary
// As this land enters, you may reveal an Island or Swamp card from your hand. If you don't, this land enters tapped.
// {T}: Add {U} or {B}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Choked Estuary",
  faces: [{ abilities: [
    // CR 614.1c: a revelação é parte da substituição de "ao entrar"
    land.snarl('Island', 'Swamp'),
    mana(['U', 'B']),
  ] }],
  rulings: {
    1: 'teste: outro Choked Estuary na mão não serve para revelar (não tem os subtipos)',
    2: 'teste: posto no campo virado por um efeito, continua virado mesmo revelando',
    3: 'não se aplica: nenhuma carta dos decks põe dois terrenos da mão no campo ao mesmo tempo',
    4: 'teste: revelar um terreno não básico com o subtipo serve',
  },
});
