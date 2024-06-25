import React from "react";

function Button({ content, className, onClick, disabled, type }) {
  return (
    <button
      type={type}
      className={"border border-black px-4 py-2 rounded-3xl " + className}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}

export default Button;
