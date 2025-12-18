import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Outreach from './pages/Outreach';
import AnswersLogs from './pages/AnswersLogs';
import Simulator from './pages/Simulator';
import Projects from './pages/Projects';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path='outreach' element={<Outreach />} />
        <Route path='logs' element={<AnswersLogs />} />
        <Route path='simulator' element={<Simulator />} />
        <Route path='projects' element={<Projects />} />
      </Route>
    </Routes>
  );
}

export default App;
