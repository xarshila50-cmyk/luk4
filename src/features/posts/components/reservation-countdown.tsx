import { Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ReservationCountdownProps = {
  expiresAt: string;
};

export function ReservationCountdown({ expiresAt }: ReservationCountdownProps) {
  const expiresAtMs = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  const remainingMs = Math.max(0, expiresAtMs - (now || expiresAtMs));
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="bg-accent text-accent-foreground flex items-center gap-2 rounded-md p-3 text-sm">
      <Clock className="size-4" aria-hidden="true" />
      <span>
        Reservation expires in {hours}h {minutes}m {seconds}s
      </span>
    </div>
  );
}
