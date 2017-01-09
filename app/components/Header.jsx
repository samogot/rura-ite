import './Header.styl';
import {pacomoTransformer} from '../utils/pacomo';
import ConfigModalLink from '../components/ConfigModalLink';
import VERSION from '../constants/VERSION';

function resetState() {
  window.localStorage.removeItem(`ite-redux-store-${VERSION}`);
  window.location.reload();
}
const Header = () => <div>RuRanobe ITE. <ConfigModalLink>конфиг</ConfigModalLink>. <a href="#" onClick={resetState}>забыть
  сохраненное состояние</a></div>;

export default pacomoTransformer(Header);