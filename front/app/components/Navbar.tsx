import React, { useContext, useState } from "react";
import Link from "next/link";
import AuthContext, { AuthContextType } from "../context/AuthContext";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const { user, logout } = useContext(AuthContext) as AuthContextType;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="navbarcontainer">
      {/* Hamburger button */}
      <div className="hamburger" onClick={toggleSidebar}>
        &#9776; {/* Hamburger icon */}
      </div>

      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="logo">
          <img src="/images/download.png" alt="My Image" />
        </div>
        <nav className="nav">
          <ul>
            <li>
              <Link className="link" href="/Profile">
                Profile
              </Link>
            </li>

            {user?.role === "admin" && (
              <>
                <li>
                  <Link className="link" href="/admin/dashboard/">
                    Home
                  </Link>
                </li>
                <li>
                  <Link className="link" href="/admin/dashboard/ManageUser">
                    Manage Users
                  </Link>
                </li>
              </>
            )}

            {user?.role === "teacher" && (
              <>
                <li>
                  <Link className="link" href="/teacher/dashboard">
                    HOME
                  </Link>
                </li>
              </>
            )}

            {user?.role === "student" && (
              <>
                <li>
                  <Link className="link" href="/student/dashboard">
                    HOME
                  </Link>
                </li>
                <li>
                  <Link className="link" href="/Speakpdf">
                    Chat AI
                  </Link>
                </li>
                <li>
                  <Link className="link" href="/TestYourSkills">
                    Test your skills
                  </Link>
                </li>
              </>
            )}

            <button className="linklogin" onClick={logout}>
              Log out
            </button>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Navbar;




//   return (
//     <aside className="sidebar">
//       <div className="logo">
//         <img src="/images/download.png" alt="My Image" />
//       </div>
//       <nav className="nav">
//         <ul>
//           <li>
//             <Link className="link" href="/Profile">
//               Profile
//             </Link>
//           </li>

//           {user?.role === "admin" && (
//             <>
//               <li>
//                 <Link className="link" href="/admin/dashboard/">
//                   Home
//                 </Link>
//               </li>

//               <li>
//                 <Link className="link" href="/admin/dashboard/ManageUser">
//                   Manage Users
//                 </Link>
//               </li>
//             </>
//           )}

//           {user?.role === "teacher" && (
//             <>
//               <li>
//                 <Link className="link" href="/teacher/dashboard">
//                   HOME
//                 </Link>
//               </li>
//             </>
//           )}

//           {user?.role === "student" && (
//             <>
//               <li>
//                 <Link className="link" href="/student/dashboard">
//                   HOME
//                 </Link>
//               </li>

//               <li>
//                 <Link className="link" href="/Speakpdf">
//                   Chat AI
//                 </Link>
//               </li>

//               <li>
//                 <Link className="link" href="/TestYourSkills">
//                   Test your skills
//                 </Link>
//               </li>
//             </>
//           )}

//           <button className="linklogin" onClick={logout}>
//             Log out
//           </button>
//         </ul>
//       </nav>
//     </aside>
//   );
// };
