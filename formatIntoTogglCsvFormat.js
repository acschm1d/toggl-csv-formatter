const fs = require("node:fs/promises");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { parse: parseDate, addSeconds, add: addDate } = require("date-fns");

const { env } = process;

const masterData = {
  user: env.USER || null,
  email: env.EMAIL || null,
  client: env.CLIENT || null,
};

(async () => {
  const csvData = [];

  try {
    const data = await fs.readFile(
      path.resolve(__dirname, "./rawTimeEntries.csv"),
      { encoding: "utf8" }
    );

    const parsedCsvData = parse(data, {
      delimiter: ";",
    });

    [].push.apply(csvData, parsedCsvData);
  } catch (err) {
    console.log(err);
  }

  const { user, email, client } = masterData;

  // Format csv
  const [] = csvData.shift();
  const dataCSV = csvData.reduce(
    (acc, timeEntry) => {
      const [project, task, activity, description, duration, date] = timeEntry;

      // format date
      const parsedDate = parseDate(date, "dd.MM.yy", new Date());
      const formattedStartDate = parsedDate.toISOString().split("T")[0];

      // format duration to determine end time
      const hm = duration.split(":");
      const parsedDuration = +hm[0] * 60 * 60 + +hm[1] * 60;

      const endDateTime = addSeconds(
        new Date(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getUTCDate(),
          10 // we start at 10:00:00
        ),
        parsedDuration
      );

      const formattedEndDate = endDateTime.toISOString().split("T")[0];

      const minutes =
        (endDateTime.getMinutes() < 10 ? "0" : "") + endDateTime.getMinutes();
      const endTime = `${endDateTime.getHours()}:${minutes}:00`;

      // Determine billable and non-billable time entries
      const billable = activity !== "Fehlerbehebung" ? "Yes" : "No";

      // Remove " in description
      const escapedDescription = description.replace(/"/g, "'");

      acc += `${user},${email},${client},${project},${task},"${escapedDescription}",${billable},${formattedStartDate},10:00:00,${formattedEndDate},${endTime},${duration}:00,${activity}\n`;
      return acc;
    },
    `User,Email,Client,Project,Task,Description,Billable,Start date,Start time,End date,End time,Duration,Tags\n` // Toggl column names for csv
  );

  // Write formatted data into csv
  try {
    console.log("Writing to csv.");
    await fs.writeFile(
      path.resolve(__dirname, "./togglTimeEntries.csv"),
      dataCSV,
      "utf8"
    );
  } catch (e) {
    console.error("Error while saving to csv.");
  }
})();
