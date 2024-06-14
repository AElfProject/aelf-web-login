import dayjs, { OpUnitType } from 'dayjs';
import duration, { Duration } from 'dayjs/plugin/duration';
dayjs.extend(duration);

type UnitTypeLongPlural =
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'months'
  | 'years'
  | 'dates';

type DurationUnitsObjectType = Partial<{
  [unit in Exclude<UnitTypeLongPlural, 'dates'> | 'weeks']: number;
}>;

type DurationUnitType = Exclude<OpUnitType, 'date' | 'dates'>;

// ((units: DurationUnitsObjectType) => Duration)
// & ((time: number, unit?: DurationUnitType) => Duration)
// & ((ISO_8601: string) => Duration)
function formatTime(date: string | number, formats = 'YYYY-MM-DD') {
  return dayjs(date).format(formats);
}

function createDuration(units: DurationUnitsObjectType): Duration;
function createDuration(time: number, unit?: DurationUnitType): Duration;
function createDuration(ISO_8601: string): Duration;

function createDuration(
  args1: DurationUnitsObjectType | string | number,
  args2?: DurationUnitType,
): Duration {
  if (typeof args1 === 'number') {
    return dayjs.duration(args1, args2);
  } else if (typeof args1 === 'string') {
    console.log('arg', args1);
    return dayjs.duration(args1);
  } else {
    return dayjs.duration(args1);
  }
}
export { formatTime, createDuration };
