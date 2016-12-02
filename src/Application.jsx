import React, {PropTypes} from 'react';
import GoldenLayoutContainer from './containers/GoldenLayoutContainer';
import HeaderContainer from './containers/HeaderContainer';
import FooterContainer from './containers/FooterContainer';


const App = ({store}) => (
  <div>
          <HeaderContainer />
          <GoldenLayoutContainer store={store}/>
          <FooterContainer />
  </div>
);

export default App
