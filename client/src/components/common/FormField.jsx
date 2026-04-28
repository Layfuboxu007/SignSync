export function FormField({ label, id, children, ...inputProps }) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      {children || <input id={id} {...inputProps} />}
    </div>
  );
}
