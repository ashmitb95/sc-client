import React, { Component, useState } from "react";
import { ScrollMenu } from "react-horizontal-scrolling-menu";
// import "./App.css";

// list of items
const list = [
  { name: "item1" },
  { name: "item2" },
  { name: "item3" },
  { name: "item4" },
  { name: "item5" },
  { name: "item6" },
  { name: "item7" },
  { name: "item8" },
  { name: "item9" },
];

// One item component
// selected prop will be passed
const MenuItem = ({ text, selected }) => {
  return <div className="menu-item">{text}</div>;
};

// All items component
// Important! add unique key
export const Menu = (list) =>
  list.map((el) => {
    const { name } = el;

    return <MenuItem text={name} key={name} />;
  });

const Arrow = ({ text, className }) => {
  return <div className={className}>{text}</div>;
};

const ArrowLeft = Arrow({ text: "<", className: "arrow-prev" });
const ArrowRight = Arrow({ text: ">", className: "arrow-next" });

const Scroller = () => {
  const [selected, setSelected] = useState(0);

  const onSelect = (key) => {
    this.setState({ selected: key });
  };

  // Create menu from items
  const menu = Menu(list, selected);

  return (
    <>
      <div className="App">
        <ScrollMenu
          data={menu}
          arrowLeft={ArrowLeft}
          arrowRight={ArrowRight}
          selected={selected}
          onSelect={this.onSelect}
        />
      </div>
    </>
  );
};

export default Scroller;
