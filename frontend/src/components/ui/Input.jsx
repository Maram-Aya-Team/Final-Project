
export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className="inputGroup">
      {label && <label className="inputLabel">{label}</label>}

      <input
        className={`inputField ${error ? "inputError" : ""} ${className}`}
        {...props}
      />

      {error && <p className="inputErrorText">{error}</p>}
    </div>
  );
}