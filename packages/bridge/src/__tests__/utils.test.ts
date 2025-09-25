import { describe, it, expect, vi } from 'vitest';
import { EE, SET_GUARDIAN_APPROVAL_MODAL, SET_GUARDIAN_APPROVAL_PAYLOAD } from '../utils';

// Mock EventEmitter
vi.mock('@aelf-web-login/wallet-adapter-base', () => ({
  EventEmitter: class MockEventEmitter {
    private events: Map<string, ((...args: any[]) => void)[]> = new Map();

    on(event: string, listener: (...args: any[]) => void) {
      if (!this.events.has(event)) {
        this.events.set(event, []);
      }
      this.events.get(event)!.push(listener);
    }

    off(event: string, listener: (...args: any[]) => void) {
      const listeners = this.events.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }

    emit(event: string, ...args: any[]) {
      const listeners = this.events.get(event);
      if (listeners) {
        listeners.forEach((listener) => listener(...args));
      }
    }

    once(event: string, listener: (...args: any[]) => void) {
      const onceWrapper = (...args: any[]) => {
        this.off(event, onceWrapper);
        listener(...args);
      };
      this.on(event, onceWrapper);
    }

    removeAllListeners(event?: string) {
      if (event) {
        this.events.delete(event);
      } else {
        this.events.clear();
      }
    }
  },
}));

describe('Utils', () => {
  describe('EventEmitter', () => {
    it('should create EventEmitter instance', () => {
      expect(EE).toBeDefined();
      expect(typeof EE.on).toBe('function');
      expect(typeof EE.off).toBe('function');
      expect(typeof EE.emit).toBe('function');
      expect(typeof EE.once).toBe('function');
    });

    it('should handle event subscription and emission', () => {
      const mockListener = vi.fn();
      const testData = { test: 'data' };

      EE.on('test-event', mockListener);
      EE.emit('test-event', testData);

      expect(mockListener).toHaveBeenCalledWith(testData);
    });

    it('should handle event unsubscription', () => {
      const mockListener = vi.fn();

      EE.on('test-event', mockListener);
      EE.off('test-event', mockListener);
      EE.emit('test-event', 'data');

      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should handle once event listener', () => {
      const mockListener = vi.fn();

      EE.once('test-event', mockListener);
      EE.emit('test-event', 'data1');
      EE.emit('test-event', 'data2');

      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith('data1');
    });

    it('should handle multiple listeners for same event', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      EE.on('test-event', mockListener1);
      EE.on('test-event', mockListener2);
      EE.emit('test-event', 'data');

      expect(mockListener1).toHaveBeenCalledWith('data');
      expect(mockListener2).toHaveBeenCalledWith('data');
    });

    it('should handle removeAllListeners', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      EE.on('test-event-1', mockListener1);
      EE.on('test-event-2', mockListener2);

      EE.removeAllListeners('test-event-1');
      EE.emit('test-event-1', 'data1');
      EE.emit('test-event-2', 'data2');

      expect(mockListener1).not.toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalledWith('data2');
    });

    it('should handle removeAllListeners without event name', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      EE.on('test-event-1', mockListener1);
      EE.on('test-event-2', mockListener2);

      EE.removeAllListeners();
      EE.emit('test-event-1', 'data1');
      EE.emit('test-event-2', 'data2');

      expect(mockListener1).not.toHaveBeenCalled();
      expect(mockListener2).not.toHaveBeenCalled();
    });
  });

  describe('Constants', () => {
    it('should export SET_GUARDIAN_APPROVAL_MODAL constant', () => {
      expect(SET_GUARDIAN_APPROVAL_MODAL).toBe('SET_GUARDIAN_APPROVAL_MODAL');
    });

    it('should export SET_GUARDIAN_APPROVAL_PAYLOAD constant', () => {
      expect(SET_GUARDIAN_APPROVAL_PAYLOAD).toBe('SET_GUARDIAN_APPROVAL_PAYLOAD');
    });
  });

  describe('Guardian Approval Events', () => {
    it('should handle guardian approval modal event', () => {
      const mockListener = vi.fn();
      const testData = { modalVisible: true };

      EE.on(SET_GUARDIAN_APPROVAL_MODAL, mockListener);
      EE.emit(SET_GUARDIAN_APPROVAL_MODAL, testData);

      expect(mockListener).toHaveBeenCalledWith(testData);
    });

    it('should handle guardian approval payload event', () => {
      const mockListener = vi.fn();
      const testData = { guardians: ['guardian1', 'guardian2'] };

      EE.on(SET_GUARDIAN_APPROVAL_PAYLOAD, mockListener);
      EE.emit(SET_GUARDIAN_APPROVAL_PAYLOAD, testData);

      expect(mockListener).toHaveBeenCalledWith(testData);
    });

    it('should handle guardian approval payload with once listener', () => {
      const mockListener = vi.fn();
      const testData = { guardians: ['guardian1', 'guardian2'] };

      EE.once(SET_GUARDIAN_APPROVAL_PAYLOAD, mockListener);
      EE.emit(SET_GUARDIAN_APPROVAL_PAYLOAD, testData);
      EE.emit(SET_GUARDIAN_APPROVAL_PAYLOAD, { guardians: ['guardian3'] });

      expect(mockListener).toHaveBeenCalledTimes(1);
      expect(mockListener).toHaveBeenCalledWith(testData);
    });
  });
});
