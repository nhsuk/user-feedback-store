const { getAllComments } = require('../lib/database.js');

const arrayToCSVRow = (array) => {
  const values = array
    .map((value) => String(value))
    .map((value) => value.replace('"', '\\"')) // convert doublequote to escaped-doublequote
    .map((value) => `"${value}"`) // Wrap values in doublequotes
    .join(','); // Join array together with commas

  // Add a newline to end the row
  return `${values}\n`;
};

module.exports = async (dateSince) => {
  const data = await getAllComments(dateSince);

  const cleanData = data.map((row) => ({
    ...row,
    timestamp: row.timestamp.toISOString(),
  }));

  // Turn comments into CSV
  const columns = [{
    key: 'timestamp',
    label: 'Datetime',
  }, {
    key: 'url',
    label: 'URL',
  }, {
    key: 'isSatisfied',
    label: 'Satisfied',
  }, {
    key: 'comments',
    label: 'Comments',
  }];

  // Write the header labels as the first row
  const headerLabels = columns.map((column) => column.label);
  process.stdout.write(arrayToCSVRow(headerLabels));

  // Write each data row
  cleanData.forEach((row) => {
    const values = columns.map((column) => row[column.key]);
    process.stdout.write(arrayToCSVRow(values));
  });
};
