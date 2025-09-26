import { render, renderHook, act } from '@testing-library/react';
import { ModalProvider, useModal } from '../useModal';
import { basicModalView } from '../useModal/actions';

// Test component to use the modal context
const TestComponent = () => {
  const [state, actions] = useModal();
  return (
    <div>
      <div data-testid="modal-state">{JSON.stringify(state)}</div>
      <button
        data-testid="dispatch-button"
        onClick={() => actions.dispatch({ type: 'test', payload: { test: 'value' } })}
      >
        Dispatch
      </button>
      <button
        data-testid="destroy-button"
        onClick={() => actions.dispatch({ type: basicModalView.destroy.type, payload: {} })}
      >
        Destroy
      </button>
      <button
        data-testid="destroy-payload-button"
        onClick={() =>
          actions.dispatch({ type: 'test', payload: { destroy: true, test: 'value' } })
        }
      >
        Destroy with Payload
      </button>
    </div>
  );
};

describe('useModal', () => {
  it('should provide modal context', () => {
    const { getByTestId } = render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>,
    );

    expect(getByTestId('modal-state')).toBeInTheDocument();
  });

  it('should handle default action without destroy', () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
    });

    // Test default action without destroy
    act(() => {
      result.current[1].dispatch({
        type: 'test',
        payload: { test: 'value' },
      });
    });

    expect(result.current[0]).toEqual({ test: 'value' });
  });

  it('should handle default action with destroy', () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
    });

    // First set some state
    act(() => {
      result.current[1].dispatch({
        type: 'test',
        payload: { test: 'value' },
      });
    });

    // Then dispatch with destroy
    act(() => {
      result.current[1].dispatch({
        type: 'destroy-test',
        payload: { destroy: true, newValue: 'destroyed' },
      });
    });

    expect(result.current[0]).toEqual({ destroy: true, newValue: 'destroyed' });
  });

  it('should handle destroy action', () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
    });

    // First set some state
    act(() => {
      result.current[1].dispatch({
        type: 'test',
        payload: { test: 'value' },
      });
    });

    // Then dispatch destroy action
    act(() => {
      result.current[1].dispatch({
        type: basicModalView.destroy.type,
        payload: {},
      });
    });

    expect(result.current[0]).toEqual({});
  });

  it('should handle multiple state updates', () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
    });

    // Multiple updates
    act(() => {
      result.current[1].dispatch({
        type: 'update1',
        payload: { field1: 'value1' },
      });
    });

    act(() => {
      result.current[1].dispatch({
        type: 'update2',
        payload: { field2: 'value2' },
      });
    });

    expect(result.current[0]).toEqual({
      field1: 'value1',
      field2: 'value2',
    });
  });

  it('should handle empty payload', () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: ({ children }) => <ModalProvider>{children}</ModalProvider>,
    });

    act(() => {
      result.current[1].dispatch({
        type: 'empty',
        payload: {},
      });
    });

    expect(result.current[0]).toEqual({});
  });
});
