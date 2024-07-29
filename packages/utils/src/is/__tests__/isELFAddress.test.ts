import { isELFAddress } from '../isELFAddress';

describe('test isELFAddress', () => {
  test('return false when params is between /[\u4e00-\u9fa5]/', () => {
    expect(isELFAddress('我')).toBeFalsy();
  });

  test('return false when params is invalid address', () => {
    expect(isELFAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyp')).toBeFalsy();
  });

  test('return true when params is valid address', () => {
    expect(isELFAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNyk')).toBeTruthy();
  });
});
