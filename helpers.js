const generateRandomString = () => {
  // creates a random alpha-numeric string of 6 characters
  const shortURL = Math.random().toString(36).substring(2, 8);
  return shortURL;
};

// Had to modify Compass' getUserByEmail function to match what it does in my project
const getUserByEmail = (usersDatabase, email) => {
  for (const id in usersDatabase) {
    if (usersDatabase[id].email === email) {
      return usersDatabase[id];
    }
  }
  return undefined;
};

const urlsForUser = (urlDatabase, id) => {
  let usersUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      usersUrls[url] = { longURL: urlDatabase[url].longURL, userID: id };
    }
  }
  return usersUrls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };