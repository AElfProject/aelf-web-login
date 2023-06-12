import { useState, useEffect } from 'react';
import { WebLoginState } from '../constants';
import { useWebLogin } from '../context';

export default function useLoginState(onChanged: (loginState: WebLoginState) => void) {
  const [prevLoginState, setPrevLoginState] = useState(WebLoginState.initial);
  const { loginState } = useWebLogin();

  useEffect(() => {
    if (loginState !== prevLoginState) {
      setPrevLoginState(loginState);
      onChanged(loginState);
    }
  }, [prevLoginState, loginState, onChanged]);
}
