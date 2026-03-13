import { useEffect, useState } from "react";
import api from "../lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/api/events", { params: { search } })
      .then((response) => setEvents(response.data.events))
      .catch(() => setEvents([]));
  }, [search]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink">Events</h1>
          <p className="mt-2 text-ink/70">Search, filter, and explore community events.</p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by event name"
          className="w-full rounded-2xl border border-ink/15 px-4 py-3 md:max-w-sm"
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <article key={event.id} className="rounded-[1.75rem] bg-white p-6 shadow-soft">
            <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold uppercase text-leaf">
              {event.category}
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-ink">{event.title}</h2>
            <p className="mt-3 text-sm text-ink/70">{event.description}</p>
            <div className="mt-5 space-y-2 text-sm text-ink/70">
              <p>{event.locationName}</p>
              <p>{new Date(event.startsAt).toLocaleString()}</p>
              <p>{event.currentParticipants} registered</p>
              {event.distanceKm ? <p>{event.distanceKm} km away</p> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
