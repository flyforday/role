import { useRoute } from './router';
import { Home } from './screens/Home';
import { SoloGameRoute, SoloNew } from './screens/Solo';
import { JoinRoute, OnlineNew, OnlineRoute } from './screens/Online';

export function App() {
  const [page, arg] = useRoute();
  switch (page) {
    case 'nouvelle':
      return <SoloNew />;
    case 'partie':
      return <SoloGameRoute key={arg} id={arg} />;
    case 'nouvelle-en-ligne':
      return <OnlineNew />;
    case 'en-ligne':
      return <OnlineRoute key={arg} id={arg} />;
    case 'rejoindre':
      return <JoinRoute key={arg} code={arg} />;
    default:
      return <Home />;
  }
}
