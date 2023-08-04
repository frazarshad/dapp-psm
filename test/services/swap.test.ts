import { expect, it, describe } from 'vitest';
import { mockBrand } from '../../mock/brand.mock';
import { makeMarshal } from '@endo/marshal';
import { makeSwapOffer } from '../../src/services/swap';
import { SwapDirection } from '../../src/store/swap';
import { AmountMath } from '@agoric/ertp';

describe('helpers', () => {
  const minted = mockBrand();
  const anchor = mockBrand();

  it('serializes the amounts properly', async () => {
    let config: any;
    const wallet = {
      addOffer: offerConfig => {
        config = offerConfig;
      },
    };

    const marshal = makeMarshal();

    const d = 10n ** 18n;
    const fromValue = 5000n * d;
    const toValue = 50_000n * d;

    expect(Number(fromValue) > Number.MAX_SAFE_INTEGER).toBe(true);

    await makeSwapOffer({
      wallet,
      instanceId: '123',
      fromPurse: { brand: anchor },
      fromValue,
      toPurse: { brand: minted },
      toValue,
      swapDirection: SwapDirection.WantMinted,
      marshal,
    });

    const fromAmount = marshal.fromCapData(
      config.proposalTemplate.give.In.amount
    );
    const toAmount = marshal.fromCapData(
      config.proposalTemplate.want.Out.amount
    );

    expect(AmountMath.isEqual(AmountMath.make(anchor, fromValue), fromAmount));
    expect(AmountMath.isEqual(AmountMath.make(minted, toValue), toAmount));
  });
});
