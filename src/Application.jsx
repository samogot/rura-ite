import React, {PropTypes} from 'react';
// import GoldenLayout from './components/GoldenLayout';
import GoldenLayoutContainer from './containers/GoldenLayoutContainer';


// const App = () => (
//   <div>
//     <Header />
//     <GoldenLayout />
//     <Footer />
//   </div>
// );
const App = ({store}) => (
  <GoldenLayoutContainer store={store}/>
);

export default App
