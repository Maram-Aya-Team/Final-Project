
export default function Select({
  label,
  options = [],
  error,
  className = "",
  ...props
}) {
  return (
    <div className="selectGroup">
      {label && <label className="selectLabel">{label}</label>}

      <select
        className={`selectField ${error ? "selectError" : ""} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="selectErrorText">{error}</p>}
    </div>
  );
}