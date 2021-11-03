module.exports = (err, req, res) => {
  if (err.message === 'Validation failed') {
    const err = new Error('Некорректно');
    res.status(400).send({ message: err.message });
  }
  const status = err.statusCode || 500;
  console.log(err.message);
  res.status(status).send({ message: err.message });
};