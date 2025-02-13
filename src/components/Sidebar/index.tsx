import React, { useState } from "react";
import "./Sidebar.css";

interface MenuItem {
  label: string;
  subItems?: { label: string; redirect: string }[];
  redirect?: string;
}

const menuItems: MenuItem[] = [
  { label: "Home", redirect: "/home" },
  { label: "Cadastrar Cliente", redirect: "/new-customer" },
  {
    label: "Cadastrar Veículo",
    subItems: [{ label: "Novo Veículo", redirect: "/new-vehicle" }],
  },
  { label: "Relatório de Clientes", redirect: "/customer-reports" },
];

const Sidebar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  const toggleMenu = (label: string) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  return (
    <div className="sidebar">
      <div className="logo"><img src="/images/logo.png" alt="Prime Autodocs" /></div>
    <ul className="menu">
      {menuItems.map((item) => (
        <li key={item.label}>
        <div
          className={`menu-item ${window.location.pathname === item.redirect ? "active" : ""}`}
          onClick={() => {
            toggleMenu(item.label);
            if (item.redirect) {
              window.location.href = item.redirect;
            }
          }}
        >
          {item.label}
          {item.subItems && <span className="arrow">{activeMenu === item.label ? "▼" : "▶"}</span>}
        </div>

        {item.subItems && activeMenu === item.label && (
          <ul className="submenu">
            {item.subItems.map((subItem) => (
            <li
              key={subItem.label}
              className={window.location.pathname === subItem.redirect ? "active-sub" : ""}
              onClick={() => {
                setActiveSubMenu(subItem.label);
                window.location.href = subItem.redirect;
              }}
            >
              {subItem.label}
            </li>
            ))}
          </ul>
        )}
        </li>
      ))}
    </ul>
    </div>
  );
};

export default Sidebar;
