import { Button } from 'antd';
import { PortkeyStyleProvider } from '@portkey/did-ui-react';
import { useNightElf } from 'src/nightElf/context';

export default function ExtraElement() {
  return (
    <PortkeyStyleProvider>
      <Button className="aelf-web-login-btn">Night Elf</Button>
    </PortkeyStyleProvider>
  );
}
