import { AppProviders } from './providers';
import { Routing } from './routing';

export const App = () => {
  return (
    <AppProviders>
      <Routing />
    </AppProviders>
  );
};

