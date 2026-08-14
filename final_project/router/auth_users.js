const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({
      message: "Error logging in: Username and password are required",
    });
  }

  // Validate user credentials
  if (authenticatedUser(username, password)) {
    // Generate a JWT session token (expires in 1 hour)
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 },
    );

    // Store the access token and username in the session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "Customer successfully logged in" });
  } else {
    return res
      .status(401)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!review) {
    return res
      .status(400)
      .json({ message: "Review content is required as a query parameter" });
  }

  if (books[isbn]) {
    let bookReviews = books[isbn].reviews;

    bookReviews[username] = review;

    return res.status(200).json({
      message: `The review for the book with ISBN ${isbn} has been added/updated successfully.`,
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Retrieve the username from the session authorization object
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Check if the book exists
  if (books[isbn]) {
    let bookReviews = books[isbn].reviews;

    if (bookReviews[username]) {
      delete bookReviews[username];
      return res.status(200).json({
        message: `Review for the book with ISBN ${isbn} posted by user ${username} deleted successfully.`,
      });
    } else {
      return res.status(404).json({
        message: "Review not found for this user on the specified book",
      });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
