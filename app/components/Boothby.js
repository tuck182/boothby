import React, { Component } from 'react';
import { connect } from 'react-redux';

class Boothby extends Component {
  static propTypes = {
  }

  render() {
    // const {} = this.props;
    return (
      <div>
        <h1>Hello, world.</h1>
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
)(Boothby);
