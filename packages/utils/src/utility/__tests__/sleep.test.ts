import { sleep } from '../sleep';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

test('waits 1 second', () => {
  sleep(1000);

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
});
