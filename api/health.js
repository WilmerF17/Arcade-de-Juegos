/* GET /api/health */
module.exports = async (_req, res) => {
  res.status(200).json({ ok: true, app: "arcadepalomuchacho", tiempo: new Date().toISOString() });
};
