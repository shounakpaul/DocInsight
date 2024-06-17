import React from "react";

function Button({ content, className, onClick }) {
  return (
    <button
      className={"border border-black px-4 py-2 rounded-3xl " + className}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

export default Button;
