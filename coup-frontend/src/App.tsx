import MatchSetup from './components/MatchSetup/MatchSetup';
import MatchDashboard from './components/MatchDashboard/MatchDashboard';
import { useMatch } from './contexts/MatchProvider';

export default function App() {
  const {match} = useMatch();

  return (
    <div className="app-container">
      {
        match?.inProgress ? <MatchDashboard /> : <MatchSetup />
      }

    </div>
  );
}
