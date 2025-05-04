const Order = require('../models/Order');

exports.placeOrder = async (req, res) => {
  try {
    const newOrder = await Order.create(req.body);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  const { userId } = req.params;
  const orders = await Order.find({ userId });
  res.json(orders);
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
  res.json(updated);
};
