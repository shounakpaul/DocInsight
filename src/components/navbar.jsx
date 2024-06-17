import React from "react";
import Button from "./button";
import Logo from "./logo";

function Navbar() {
  return (
    <div className="flex flex-row items-center justify-center px-10 py-10 mx-10 my-5 border border-neutral-500 rounded-3xl">
      <Logo />
    </div>
  );
}

export default Navbar;
