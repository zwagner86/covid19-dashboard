# react-parcel
My personal React + Parcel set up

## Quick Overview
Inside the newly created project, you can run some built-in commands:

### `npm start` or `yarn start`

Runs the app in development mode.<br>
Open [http://localhost:1234](http://localhost:1234) to view it in the browser.

The page will automatically reload if you make changes to the code.<br>
You will see the build errors and lint warnings in the console.

### `npm test` or `yarn test`

This will run tests using Jest and React Testing Library.

### `npm run build` or `yarn build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

Your app is ready to be deployed.

## URL Parameters
| URL Param    | Default                  | Description                                                                                                        |
|--------------|--------------------------|--------------------------------------------------------------------------------------------------------------------|
| disableForm  | false                    | Disables entire settings form                                                                                      |
| onlyCase     | false                    | Flag for only showing the Cases tab                                                                                |
| onlyRisk     | false                    | Flag for only showing the Risk tab                                                                                 |
| onlyCharts   | false                    | Flag for only showing the charts                                                                                   |
| onlyTables   | false                    | Flag for only showing the tables                                                                                   |
| doublingTime | 2.3                      | Sets the doubling time                                                                                             |
| countryCode  | USA                      | Sets the country                                                                                                   |
| stateCode    | IL                       | Sets the state                                                                                                     |
| population   | 1000000                  | Sets the population.  Defaults to a selected state's population or 1,000,000 if no state found.                    |
| exposure     | 100                      | Sets the exposure                                                                                                  |
| startDate    | 7 days before now        | Sets the start date.  Defaults to a state's first data entry date or 7 days before current date if no state found. |
| lastDate     | 30 days after start date | Sets the last date.  Defaults to 'numDays' after startDate if set, otherwise 30 days after startDate.              |
| numDays      | 30                       | Sets number of days to model                                                                                       |
| baseCases    | 5                        | Sets number of initial cases.  Defaults to a state's first data entry 'cases' or 5 if no state is found.           |
| multiplier   | 5                        | Sets the multiplier                                                                                                |
| riskPerDay   | 5                        | Sets acceptable risk per day                                                                                       |
| cumRisk      | 10                       | Sets acceptable cumulative risk                                                                                    |
| hospRate     | 10                       | Sets hospitalization rate                                                                                          |
| hospDelay    | 9                        | Sets delay in hospital admission                                                                                   |
| hospStay     | 10                       | Sets length of hospital stay                                                                                       |
| hospBeds     | 33000                    | Sets amount of hospital beds                                                                                       |
| fatalityRate | 2                        | Sets fatality rate                                                                                                 |
