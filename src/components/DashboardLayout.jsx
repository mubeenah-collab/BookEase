import Navbar from "./Navbar";

export default function DashboardLayout({ title, subtitle, children, actions }) {
  return (
    <div>
      <Navbar />
      <main className="container dashboard-wrap">
        <section className="panel panel-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions ? <div className="header-actions">{actions}</div> : null}
        </section>
        {children}
      </main>
    </div>
  );
}
