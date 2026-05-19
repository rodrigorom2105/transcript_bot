const LA_TZ = "America/Los_Angeles";

const fechaFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: LA_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const horaFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: LA_TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatLA(date: Date): { fecha: string; hora: string } {
  return {
    fecha: fechaFmt.format(date),
    hora: horaFmt.format(date),
  };
}
