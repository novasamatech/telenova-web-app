import BigNumber from 'bignumber.js';
import { AssetAccount, TrasferAsset } from '@/common/types';
import { formatBalance, formatAmount, getTotalBalance, getTransferDetails, updateAssetsBalance } from './index';
import { Chain } from '@/common/chainRegistry/types';

describe('formatBalance function', () => {
  test('should calculate small amount', () => {
    const { formattedValue, suffix, decimalPlaces } = formatBalance('592321079928', 12);

    expect(formattedValue).toEqual('0.59232');
    expect(suffix).toEqual('');
    expect(decimalPlaces).toEqual(5);
  });

  test('should calculate thousands', () => {
    const { formattedValue, suffix, decimalPlaces } = formatBalance('16172107992822306', 12);

    expect(formattedValue).toEqual('16172.1');
    expect(suffix).toEqual('');
    expect(decimalPlaces).toEqual(2);
  });

  test('should calculate millions', () => {
    const { formattedValue, suffix, decimalPlaces } = formatBalance('1617210799282230602', 12);

    expect(formattedValue).toEqual('1.61');
    expect(suffix).toEqual('M');
    expect(decimalPlaces).toEqual(2);
  });

  test('should calculate billion', () => {
    const { formattedValue, suffix, decimalPlaces } = formatBalance('8717210799282230602024', 12);

    expect(formattedValue).toEqual('8.71');
    expect(suffix).toEqual('B');
    expect(decimalPlaces).toEqual(2);
  });

  test('should calculate trillion', () => {
    const { formattedValue, suffix, decimalPlaces } = formatBalance('91528717210799282230602024', 12);

    expect(formattedValue).toEqual('91.52');
    expect(suffix).toEqual('T');
    expect(decimalPlaces).toEqual(2);
  });
});

describe('formatAmount function', () => {
  test('should freturn zero value with empty string', () => {
    const amount = '';
    const formattedAmount = formatAmount(amount, 12);

    expect(formattedAmount).toBe('0');
  });

  test('should format amount', () => {
    const amount = '5';
    const formattedAmount = formatAmount(amount, 12);

    expect(formattedAmount).toBe('5000000000000');
  });
  test('should format amount with precision', () => {
    const amount = '0.92321';
    const formattedAmount = formatAmount(amount, 12);

    expect(formattedAmount).toBe('923210000000');
  });
});

describe('getTotalBalance function', () => {
  test('should return total balance', () => {
    const assets = [
      { totalBalance: '100', asset: { priceId: '1' } },
      { totalBalance: '200', asset: { priceId: '2' } },
    ];
    const assetsPrices = { '1': { price: 1 }, '2': { price: 2 } };
    const totalBalance = getTotalBalance(assets as AssetAccount[], assetsPrices);

    expect(totalBalance).toBe(500);
  });
});

describe('updateAssetsBalance function', () => {
  test('should update assets balances', () => {
    const prevAssets = [
      { chainId: 'chain1', totalBalance: '100' },
      { chainId: 'chain2', totalBalance: '200' },
    ];
    const chain = { chainId: 'chain1' };
    const balance = { total: () => '300', transferable: () => '250' };
    const updatedAssets = updateAssetsBalance(prevAssets as AssetAccount[], chain as Chain, balance);

    expect(updatedAssets[0].totalBalance).toBe('300');
    expect(updatedAssets[0].transferableBalance).toBe('250');
    expect(updatedAssets[1].totalBalance).toBe('200');
  });
});

describe('getTransferDetails function', () => {
  test('should return transfer details', async () => {
    const selectedAsset = {
      chainId: 'chain1',
      transferableBalance: '100000000000',
      asset: { precision: 12 },
      isGift: false,
    };
    const amount = '50';
    const estimateFee = jest.fn().mockResolvedValue(new BigNumber(0.00001));
    const getExistentialDeposit = jest.fn().mockResolvedValue('10000000000');

    const transferDetails = await getTransferDetails(
      selectedAsset as TrasferAsset,
      amount,
      estimateFee,
      getExistentialDeposit,
    );

    expect(transferDetails.fee).toBe(0.00001);
    expect(transferDetails.max).toBe('0.10000');
    expect(transferDetails.formattedDeposit).toBe(0.01);
  });
});
