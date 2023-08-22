import { CancelablePromise as CancelablePromiseImpl } from 'cancelable-promise';
import { CancelablePromise, CancelablePromiseExecutor } from '../types';

export function newCancelablePromise<T>(executor: CancelablePromiseExecutor<T>): CancelablePromise<T> {
  return new CancelablePromiseImpl<T>(executor);
}
