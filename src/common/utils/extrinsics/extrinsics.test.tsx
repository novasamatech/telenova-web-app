import { handleSend, handleSendGift } from './index';
import { TrasferAsset } from '../../types';

const mockSubmitExtrinsic = jest.fn().mockResolvedValue('successHash');
const mockEstimateFee = jest.fn().mockResolvedValue(10);
console.log = jest.fn();

const transferAsset = {
  destinationAddress: '0x1234567890123456789012345678901234567890',
  chainId: 'chainId',
  amount: '100',
  transferAll: false,
  asset: { precision: 18 },
};

describe('handleSend function', () => {
  test('should handle sending of funds', async () => {
    await handleSend(mockSubmitExtrinsic, transferAsset as TrasferAsset);

    expect(mockSubmitExtrinsic).toHaveBeenCalledWith('chainId', expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('Success, Hash:', 'successHash');
  });
});

describe('handleSendGift function', () => {
  test('should calculate the amount of a gift', async () => {
    await handleSendGift(
      mockSubmitExtrinsic,
      mockEstimateFee,
      transferAsset as TrasferAsset,
      '0x1234567890123456789012345678901234567890',
    );
    expect(mockSubmitExtrinsic).toHaveBeenCalledWith('chainId', expect.any(Function));

    const transferAmount = (+transferAsset.amount * Math.pow(10, 18)).toString();
    expect(transferAmount).toEqual('100000000000000000000');

    const fee = 10000000000000;
    const giftAmount = (+transferAmount + fee).toString();
    expect(giftAmount).toEqual('100000010000000000000');
  });
});
