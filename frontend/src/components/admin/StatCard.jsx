export default function StatCard({ title, value, description }) {
  return (
    <div className="statCard">
      <p>{title}</p>
      <h3>{value}</h3>
      {description && <span>{description}</span>}
    </div>
  );
}