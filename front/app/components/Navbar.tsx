import React, { useContext } from "react";
import Link from 'next/link';
import AuthContext, { AuthContextType } from '../context/AuthContext';
import "./Navbar.css";

const Navbar: React.FC = () => {
  const { logout } = useContext(AuthContext) as AuthContextType;

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src="/images/download.png" alt="My Image" />
      </div>
      <nav className="nav">
        <ul>
          <li><Link className="link" href="/">Dashboard</Link></li>
          <li><Link className="link" href="">Profile</Link></li>
          <li><Link className="link" href="/Resumer">Documents</Link></li>
          <li><Link className="link" href="">Note</Link></li>
          <li><Link className="link" href="/Speakpdf">Chat Ai</Link></li> 
          <li><Link className="link" href="/Calendrier">Calendrier</Link></li> 
          <li><Link className="link" href="/Messages">Message</Link></li> 
          <li><Link className="link" href="/Settings">Setting</Link></li> 
          <li><Link className="link" href="/Help">Help</Link></li> 
          <li><Link className="link" href="/TestYourSkills">Test your skills</Link></li> 
          <button className="link_login" onClick={logout}>Log out</button>
        </ul>
      </nav>
    </aside>
  );
}

export default Navbar;
