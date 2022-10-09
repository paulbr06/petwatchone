
import './Header.css';
import Paw from "../../assets/paw.png";
import SmallPaw from "../../assets/smallpaw.png";

function Header() {
  return (
    <div className="Header">
      <img className='logo' src={SmallPaw}></img>
      <h1 className="title">PetWatch</h1>
      <img className='profileIcon' src={SmallPaw}></img>
    </div>
  );
}

export default Header;