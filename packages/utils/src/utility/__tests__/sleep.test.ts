import { sleep } from '../sleep';

vi.useFakeTimers();
vi.spyOn(global, 'setTimeout');

test('waits 1 second', () => {
  sleep(1000);

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
});
