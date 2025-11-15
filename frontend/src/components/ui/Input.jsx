const Input = ({
  label,
  error,
  helperText,
  icon,
  type = "text",
  className = "",
  containerClass = "",
  ...props
}) => {
  const baseStyles =
    "w-full px-4 py-2.5 rounded-lg border bg-bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 transition-all";
  const errorStyles = error
    ? "border-error focus:ring-error/20"
    : "border-border focus:ring-primary/20";

  return (
    <div className={`flex flex-col gap-1.5 ${containerClass}`}>
      {label && (
        <label className="text-label font-medium text-text-primary">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}

        <input
          type={type}
          className={`${baseStyles} ${errorStyles} ${
            icon ? "pl-10" : ""
          } ${className}`}
          {...props}
        />
      </div>

      {error && <span className="text-caption text-error-text">{error}</span>}

      {helperText && !error && (
        <span className="text-caption text-text-secondary">{helperText}</span>
      )}
    </div>
  );
};

export default Input;
