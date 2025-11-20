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
  return (
    <div className={`flex flex-col gap-2 ${containerClass}`}>
      {label && (
        <label className="text-sm font-bold text-text-primary ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}

        <input
          type={type}
          className={`
            w-full px-4 py-3.5 rounded-2xl border bg-bg-surface 
            text-text-primary placeholder:text-text-secondary/70 
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-all duration-200
            ${error ? "border-error focus:ring-error/20" : "border-border"}
            ${icon ? "pl-11" : ""}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <span className="text-xs text-error font-medium ml-1">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-xs text-text-secondary ml-1">{helperText}</span>
      )}
    </div>
  );
};

export default Input;
