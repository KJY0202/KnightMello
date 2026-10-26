export default function SectionHeading({ eyebrow, title, link, children }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {children}
      </div>
      {link}
    </div>
  );
}
