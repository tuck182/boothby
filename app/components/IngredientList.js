import React, { Component } from 'react';
import { connect } from 'react-redux';

class IngredientList extends Component {
  static propTypes = {
  }

  render() {
    // const {} = this.props;
    return (
      <div>
        <label>
          Ingredients:
          <input type="text" name="name" />
        </label>
      </div>
    );
  }
}

function mapStateToProps(_state) {
  return {
  };
}

function mapDispatchToProps(_dispatch) {
  return {
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IngredientList);
