# Formatting custom time entries into Toggl format

Since we had been writing the time entries in Excel files and switched to [Toggl](https://toggl.com/), we wanted to import all the historical data to have it in one place.

Our custom Excel format is the following:

```
------------------------------------------------------
| Projekt;Aufgabe;Tätigkeit;Beschreibung;Dauer;Datum |
------------------------------------------------------
```

However, the [Toggl format](https://support.toggl.com/en/articles/2216070-editing-and-uploading-a-csv-file) expects the following format:

```
-------------------------------------------------------------------------------------------------------------
| User,Email,Client,Project,Task,Description,Billable,Start date,Start time,End date,End time,Duration,Tags |
-------------------------------------------------------------------------------------------------------------
```

This script parses the raw CSV data and converts it into the expected Toggl format.

Toggl expects a little more information than we have available in our Excel data. For this reason, the user, the user mail and the client must be passed as environment variables. An example call looks like this:

```
USER="John Doe" EMAIL=john.doe@example.com CLIENT="Best Client GmbH" node formatIntoTogglCsvFormat.js
```

In addition, we use the activity, which in our case is the "Fehlerbehebung" (eng: troubleshooting) label, to determine whether a time entry is billable or not.

It can be imported in Toggl under `Settings` > `CSV import`.
