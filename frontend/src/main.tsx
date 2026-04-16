import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppModule from './app/app.module';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppModule />
  </BrowserRouter>
);
