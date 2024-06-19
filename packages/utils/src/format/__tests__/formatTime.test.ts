import { formatTime, createDuration } from '../formatTime';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

describe('formatTime', () => {
  it('formats date string correctly', () => {
    const formatted = formatTime('2023-04-01');
    expect(formatted).toBe('2023-04-01');
  });

  it('formats timestamp number correctly', () => {
    const timestamp = Date.now();
    const formatted = formatTime(timestamp);
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Matches YYYY-MM-DD format
  });

  it('accepts custom format', () => {
    const formatted = formatTime('2023-04-01', 'MM/DD/YYYY');
    expect(formatted).toBe('04/01/2023');
  });
});

describe('createDuration', () => {
  it('creates duration from number and unit', () => {
    const durationObj = createDuration(2, 'hours');
    expect(durationObj.hours()).toBe(2);
  });

  it('creates duration from object', () => {
    const durationObj = createDuration({ hours: 2, minutes: 30 });
    expect(durationObj.hours()).toBe(2);
    expect(durationObj.minutes()).toBe(30);
  });

  it('creates duration from ISO 8601 string', () => {
    const durationObj = createDuration('P2DT3H4M');
    expect(durationObj.days()).toBe(2);
    expect(durationObj.hours()).toBe(3);
    expect(durationObj.minutes()).toBe(4);
  });
});
