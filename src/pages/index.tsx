import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import { Main } from '@app/Main';

export default function App() {
  return (
      <Router>
        <Main />
      </Router>
  );
}