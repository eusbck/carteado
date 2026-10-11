// Thran Dynamo
// {T}: Add {C}{C}{C}.
import { defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Thran Dynamo',
  faces: [{ abilities: [mana('CCC')] }],
  rulings: {},
});