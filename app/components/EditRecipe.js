import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import IngredientList from 'components/IngredientList';

class EditRecipe extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
  }

  render() {
    console.log('props', this.props);
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <Field component="input" type="text"
            name="name"
            placeholder="Recipe Name" />
        </label>
        <IngredientList />
      </form>
    );
  }
}

export default connect(
  (_state) => ({
    // initialValues: state.recipes[0],
  })
)(reduxForm({
  form: 'edit-recipe',
})(EditRecipe));
