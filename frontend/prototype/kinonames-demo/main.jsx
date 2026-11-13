import {createRoot} from 'react-dom/client';
import DemoProvider from './DemoProvider.jsx';
import DemoControls from './DemoControls.jsx';
import CinemaApp from '../../src/cinema/CinemaApp.jsx';
import '../../src/index.css';
import './demo.css';

const params=new URLSearchParams(location.search);
const view=params.get('view')==='player'?'player':'leader';
const root=createRoot(document.getElementById('root'));
root.render(<DemoProvider view={view}><CinemaApp/><DemoControls view={view}/></DemoProvider>);
if(import.meta.hot)import.meta.hot.dispose(()=>root.unmount());
