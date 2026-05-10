export default function StatCard({ title, value }) {
  return (
    <div className="statCard">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}
