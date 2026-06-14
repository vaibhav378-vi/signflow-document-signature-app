function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={30} />
      </div>

      <div>
        <h3>{value}</h3>
        <p className="stat-title">{title}</p>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

export default StatCard;