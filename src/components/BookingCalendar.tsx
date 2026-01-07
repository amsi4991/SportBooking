
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { createBooking } from '../services/booking';

export default function BookingCalendar() {
  function handleSelect(info: any) {
    createBooking({
      courtId: 'campo-1',
      startsAt: info.startStr,
      endsAt: info.endStr
    });
  }

  return (
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable={true}
      select={handleSelect}
    />
  );
}
