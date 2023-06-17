import { Tab } from '@headlessui/react';
import { ReactNode } from 'react';

export default function ExampleTab({ children }: { children: ReactNode }) {
  return (
    <Tab className="ui-selected:bg-blue-500 ui-selected:text-white ui-not-selected:bg-white ui-not-selected:text-black">
      {children}
    </Tab>
  );
}
