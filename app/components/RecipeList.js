import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import RecipeListEntry from 'components/RecipeListEntry';

class RecipeList extends Component {
  static propTypes = {
    recipes: PropTypes.array.isRequired,
  }

  render() {
    const {recipes} = this.props;
    return (
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Ingredients</td>
            <td>Style</td>
          </tr>
        </thead>
        <tbody>{
          _.map(recipes, (recipe) => <RecipeListEntry key={recipe.name} {...recipe} />)
        }</tbody>
      </table>
    );
  }
}

export default connect(
  (state) => state
)(RecipeList);
