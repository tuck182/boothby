import React, { Component } from 'react';
import { connect } from 'react-redux';

class Header extends Component {
  static propTypes = {
  }

  render() {
    // const {} = this.props;
    return (
      <ul>
        <li>Home</li>
      </ul>
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
)(Header);
