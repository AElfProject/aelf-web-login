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

  test('return false when params is empty string', () => {
    expect(isELFAddress('')).toBeFalsy();
  });

  test('return false when params is null', () => {
    expect(isELFAddress(null as any)).toBeFalsy();
  });

  test('return false when params is undefined', () => {
    expect(isELFAddress(undefined as any)).toBeFalsy();
  });

  test('return false when params is not a string', () => {
    expect(isELFAddress(123 as any)).toBeFalsy();
  });

  test('return false when params contains special characters', () => {
    expect(isELFAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQN@k')).toBeFalsy();
  });

  test('return false when params is too short', () => {
    expect(isELFAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQN')).toBeFalsy();
  });

  test('return false when params is too long', () => {
    expect(isELFAddress('rRZCro3wsAk2mW1s4CvM66wCe8cYgKKBCUFGuBhF6rUtoQNykExtra')).toBeFalsy();
  });
});
