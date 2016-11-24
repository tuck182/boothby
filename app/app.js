/* global document */

import 'install-source-map-support';

import React from 'react';
import {render} from 'react-dom';
import { Provider } from 'react-redux';
import Boothby from 'components/Boothby';

import configureStore from 'store/configureStore';
const store = configureStore();

render(
  <Provider store={store}>
    <Boothby />
  </Provider>,
  document.getElementById('boothby')
);
