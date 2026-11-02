import { Link } from 'react-router';
import { Shield } from 'lucide-react';

type NavLink = { to: string; label: string; active?: boolean };

type NavProps = {
  section?: string;
  links?: NavLink[];
  initials: string;
  userLabel?: string;
};

export function Nav({ section, links = [], initials, userLabel }: NavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-4 lg:px-12">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-6 w-6 text-primary" />
            CheatBlock
            {section && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {section}
              </span>
            )}
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  link.active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {userLabel && <span className="text-sm text-muted-foreground">{userLabel}</span>}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
