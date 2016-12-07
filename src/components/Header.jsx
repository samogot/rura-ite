import './Header.styl';
import {pacomoTransformer} from '../utils/pacomo';
import ConfigModalLink from '../components/ConfigModalLink';

const Header = () => <div>RuRanobe ITE. <ConfigModalLink>конфиг</ConfigModalLink></div>;

export default pacomoTransformer(Header);