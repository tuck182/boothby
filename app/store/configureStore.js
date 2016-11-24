import { createStore, combineReducers, applyMiddleware } from 'redux';
import { reducer as formReducer } from 'redux-form';
import createLogger from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import Immutable from 'seamless-immutable';

const loggerMiddleware = createLogger();

const DEFAULT_STATE = Immutable({
  recipes: [
    {
      name: 'Old Fashioned',
      ingredients: [
        '1-1/2 oz Bourbon',
        '2 dashes Angostura bitters',
        '1 sugar cube',
      ],
      glass: 'Old Fashioned glass',
      served: 'on the rocks',
      garnish: [
        'orange slice',
        'cocktail cherry',
      ],
      directions: [
        'add sugar cube & bitters to glass, muddle',
        'add ice cubes & whiskey',
      ],
    },
    {
      name: 'Boulevardier',
      ingredients: [
        '1 oz Bourbon',
        '1 oz sweet vermouth',
        '1 oz Campari',
      ],
      glass: 'martini',
      served: 'up',
      garnish: [
        'orange twist',
      ],
      directions: [
        'shake all ingredients with ice',
        'strain into glass',
      ],
    },
    {
      name: 'Daiquiri',
      ingredients: [
        '2 oz dark rum',
        '1 oz lime juice',
        '1 oz simple syrup',
      ],
      glass: 'martini',
      served: 'up',
      garnish: [
        'lime wheel',
      ],
      directions: [
        'shake all ingredients with ice',
        'strain into glass',
      ],
    },
  ],
});

const rootReducer = combineReducers({
  recipes: (previousState = DEFAULT_STATE.recipes, action) => {
    return previousState;
  },
  form: formReducer,
});

export default function configureStore(preloadedState) {
  return createStore(
    rootReducer,
    preloadedState || DEFAULT_STATE,
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  );
}


/*

https://robertknight.github.io/hot-reloading-talk/#36

var reducer = require('./rootReducer');
if (module.hot) {
  module.hot.accept('./rootReducer', function () {
    reducer = require('./rootReducer');
    store.replaceReducer(reducer);
  });
}


If you are using Babel, the react-transform-hmr plugin can be used to rewrite
your code at compile time to add module.hot calls and reload the component

Caveat: react-transform-hmr does not yet support stateless function components.



Error handling

React will get stuck in a broken state if component render function throws
Wrap render() method to catch errors and render a fallback instead.
The react-transform-catch-errors Babel plugin will do this for you
Improvements ("error boundaries") coming in v0.15

*/