import { useNightElf } from './context';

export function withNightElf<P extends { onClick: () => void }>(Component: React.ComponentType<P>) {
  return function NightElfButtonWrapper(props: P) {
    const nightElf = useNightElf();
    return (
      <>
        <Component {...props} onClick={() => nightElf.login()} />
      </>
    );
  };
}
