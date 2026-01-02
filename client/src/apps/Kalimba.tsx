export function Kalimba() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <iframe
        src="/kalimba.html"
        className="w-full h-full border-0"
        title="Kalimba Virtual Instrument"
      />
    </div>
  );
}
