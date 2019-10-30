import React from 'react';
import Link from 'next/link';
import { of, Subject } from 'rxjs';
import { StateObservable } from 'redux-observable';
import { connect } from 'react-redux';
import * as actions from '../redux/actions';
import dynamic from 'next/dynamic';

const Createjs = dynamic(() => import('../components/createjs'), { ssr: false });

import css from './styles/index.styl';

const mapStateToProps = (state) => ({ state });
const dispatchProps = {
  changeMessage: actions.CHANGE_MESSAGE,
};

const initialState = Object.freeze({
  greeting: 'hello',
});

const getInitialState = (props) => {
  return {
    ...initialState,
    reduxCopyMessage: props.state.message,
  };
};

class Index extends React.Component {
  static async getInitialProps({ store, isServer }) {
    return { isServer };
  }

  constructor(props) {
    super(props);
    this.state = getInitialState(props);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  changeRedux() {
    this.props.changeMessage('newReduxMessage');
  }

  render() {
    return (
      <div>
        <Createjs />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  dispatchProps,
)(Index);
