const Card = ({
  children,
  title,
  subtitle,
  className = "",
  headerAction,
  padding = true,
  hover = false,
}) => {
  return (
    <div
      className={`
        bg-bg-surface rounded-3xl border border-border shadow-card
        ${
          hover
            ? "hover:shadow-soft hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            : ""
        }
        ${className}
      `}
    >
      {(title || headerAction) && (
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-text-primary">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={padding ? "p-6" : ""}>{children}</div>
    </div>
  );
};

export default Card;
