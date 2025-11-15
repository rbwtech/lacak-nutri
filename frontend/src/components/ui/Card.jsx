const Card = ({
  children,
  title,
  subtitle,
  className = "",
  headerAction,
  padding = true,
}) => {
  return (
    <div
      className={`bg-bg-surface rounded-xl border border-border ${className}`}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-h4 font-semibold text-text-primary">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-label text-text-secondary mt-1">{subtitle}</p>
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
