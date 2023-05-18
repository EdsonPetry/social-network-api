const router = require("express").Router();
const { User, Thought } = require("../models");

// Define your API routes here

// GET all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().populate("thoughts").populate("friends");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// GET a single user by its _id and populated thought and friend data
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("thoughts")
      .populate("friends");
    if (!user) {
      res.status(404).json({ message: "No user found with this id!" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// POST a new user
router.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// PUT to update a user by its _id
router.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ message: "No user found with this id!" });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// DELETE to remove user by its _id
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "No user found with this id!" });
      return;
    }
    // Bonus: Remove user's associated thoughts
    await Thought.deleteMany({ username: user.username });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// POST to add a new friend to a user's friend list
router.post("/users/:userId/friends/:friendId", async (req, res) => {
  try {
    const { userId, friendId } = req.params;

    // Check if both user and friend exist
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!user || !friend) {
      res
        .status(404)
        .json({ message: "No user or friend found with the provided id!" });
      return;
    }

    // Update the user's friend list
    user.friends.push(friendId);
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// DELETE to remove a friend from a user's friend list
router.delete("/users/:userId/friends/:friendId", async (req, res) => {
  try {
    const { userId, friendId } = req.params;

    // Check if both user and friend exist
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!user || !friend) {
      res
        .status(404)
        .json({ message: "No user or friend found with the provided id!" });
      return;
    }

    // Update the user's friend list
    user.friends.pull(friendId);
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
