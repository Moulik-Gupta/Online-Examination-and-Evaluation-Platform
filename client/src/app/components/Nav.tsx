import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ChevronDown, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../auth';

type NavLink = { to: string; label: string; active?: boolean };

type NavProps = {
  section?: string;
  links?: NavLink[];
  initials?: string;
  userLabel?: string;
};

export function Nav({ section, links = [], initials, userLabel }: NavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const name = user?.name ?? userLabel;
  const avatar =
    user?.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ??
    initials ??
    '?';

  const handleSignOut = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  const avatarCircle = (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {avatar}
    </div>
  );

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

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center gap-3 rounded-full py-1 pl-3 pr-2 transition-colors hover:bg-accent"
            >
              <span className="text-sm text-muted-foreground">{name}</span>
              {avatarCircle}
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 rounded-lg border border-border bg-card p-1 shadow-lg"
              >
                <div className="border-b border-border px-3 py-3">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-xs text-primary">
                    {user.role === 'admin' ? 'Administrator' : 'Student'}
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {name && <span className="text-sm text-muted-foreground">{name}</span>}
            {avatarCircle}
          </div>
        )}
      </div>
    </header>
  );
}