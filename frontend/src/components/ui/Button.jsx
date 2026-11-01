const buttonVariants = {
  primary: "bg-purple-600 text-white hover:bg-purple-700",

  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",

  danger: "bg-red-600 text-white hover:bg-red-700",
};

function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
}) {
  const variantClasses = buttonVariants[variant] ?? buttonVariants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses}`}
    >
      {children}
    </button>
  );
}

export default Button;
