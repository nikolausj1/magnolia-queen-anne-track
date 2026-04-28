import { NextMeetHero } from "@/components/NextMeetHero";
import { UpcomingList } from "@/components/UpcomingList";
import type { Meet } from "@/lib/data";

type Props = {
  nextMeet: Meet;
  restMeets: Meet[];
};

export function UpcomingSection({ nextMeet, restMeets }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,340px)_1fr] gap-5 md:gap-6">
      <NextMeetHero meet={nextMeet} />
      <UpcomingList meets={restMeets} />
    </div>
  );
}
