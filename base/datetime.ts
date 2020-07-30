import {
  dayOfYear,
  currentDayOfYear,
} from "https://deno.land/std/datetime/mod.ts";
console.log("[datetime]", dayOfYear(new Date("2020-5-29")));
console.log(currentDayOfYear());
