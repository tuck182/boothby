import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class RecipeListEntry extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    ingredients: PropTypes.array.isRequired,
    served: PropTypes.string.isRequired,
  }

  handleFieldClicked(fieldName, event) {
    alert(`${fieldName} clicked ` + event.target);
  }

  render() {
    const {name, ingredients, served} = this.props;
    return (
      <tr>
        <td onClick={(e) => this.handleFieldClicked('name', e)}>{name}</td>
        <td onClick={(e) => this.handleFieldClicked('ingredients', e)}><ul>{
          _.map(ingredients, (ingredient, idx) =>
              <li key={idx}>{ingredient}</li>)
        }</ul></td>
        <td onClick={(e) => this.handleFieldClicked('served', e)}>{served}</td>
      </tr>
    );
  }
}

export default connect(
  (state) => state
)(RecipeListEntry);
