import { NextUIProvider } from '@nextui-org/react';
import AppShell from './components/layout/AppShell';

export default function App() {
  return (
    <NextUIProvider>
      <AppShell />
    </NextUIProvider>
  );
}
