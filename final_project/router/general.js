const express = require("express");
const axios = require("axios"); // <-- Make sure this line is included
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Get all books using async-await with Axios
public_users.get("/axios", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  // If valid and unique, add the new user
  users.push({ username: username, password: password });
  return res
    .status(200)
    .json({ message: "Customer successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.status(200).json(books);
});

// Get book details based on ISBN using Axios with async-await
public_users.get("/axios/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    // Fetching from your own server's ISBN endpoint
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res
      .status(500)
      .json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  // Find and return the book matching the ISBN
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on Author using Axios with async-await
public_users.get("/axios/author/:author", async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res
      .status(500)
      .json({
        message: "Error fetching books by author",
        error: error.message,
      });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const authorName = req.params.author;
  let matchingBooks = [];

  let bookKeys = Object.keys(books);

  bookKeys.forEach((key) => {
    if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
      matchingBooks.push(books[key]);
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const bookTitle = req.params.title;
  let matchingBooks = [];

  let bookKeys = Object.keys(books);

  bookKeys.forEach((key) => {
    if (books[key].title.toLowerCase() === bookTitle.toLowerCase()) {
      matchingBooks.push(books[key]);
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
