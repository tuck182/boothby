import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from 'components/Header';
import EditRecipe from 'components/EditRecipe';
import RecipeList from 'components/RecipeList';

class Boothby extends Component {
  static propTypes = {
  }

  render() {
    // const {} = this.props;
    return (
      <div>
        <Header />
        <RecipeList />
      </div>
    );
  }
}

function mapDispatchToProps(_dispatch) {
  return {
  };
}

export default connect(
  (state) => state,
  mapDispatchToProps
)(Boothby);
