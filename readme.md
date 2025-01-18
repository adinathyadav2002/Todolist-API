# To-Do List API

This repository contains a To-Do List API project. The project allows users to manage tasks by providing endpoints to add and retrieve tasks. The application is built using Node.js and follows the MVC (Model-View-Controller) architecture for better organization and maintainability.

## Features

- Add tasks as a user.
- Retrieve user data.
- Follows MVC architecture with separate folders for controllers and models.
- Includes data import functionality from JSON to a MongoDB cluster.

---

## Setup Instructions

### 1. Prerequisites

Ensure that the following software is installed on your system:

- [Node.js](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) (or a locally hosted MongoDB instance)

### 2. Install Dependencies

Run the following command to install all the necessary dependencies:

```bash
npm i
```

### 3. Configure ESLint

This project includes an `.eslintrc.js` file to enforce coding standards. To make ESLint work:

1. Install the required ESLint dependencies:
   ```bash
   npm install eslint eslint-config-airbnb eslint-config-prettier eslint-plugin-node eslint-plugin-prettier --save-dev
   ```
2. Ensure your IDE is configured to use ESLint for linting.

The `.eslintrc.js` file includes the following configuration:

```json
{
  "extends": ["airbnb", "prettier", "plugin:node/recommended"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "off",
    "spaced-comment": "off",
    "no-console": "warn",
    "consistent-return": "off",
    "func-names": "off",
    "object-shorthand": "off",
    "no-process-exit": "off",
    "no-param-reassign": "off",
    "no-return-await": "off",
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off",
    "prefer-destructuring": ["error", { "object": true, "array": false }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "req|res|next|val|err" }]
  }
}
```

### 4. Set Up the `config.env` File

Create a `config.env` file in the root directory of your project and add the following environment variables:

```env
NODE_ENV = development or production
PORT = <port number you want to use>
DATABASE = <mongodb url>
DATABASEPASS = <cluster password>
```

Replace `<port number>`, `<mongodb url>`, and `<cluster password>` with your specific values.

### 5. Data Import

The project includes a `dev-data` folder containing the following:

- `import_data.js`: Contains methods to push JSON data from `sample_data.json` to a MongoDB cluster.
- `sample_data.json`: Sample data to populate the database.
- Provide commands works when you are in root directory

To import data, run:

```bash
node dev-data/import_data.js --import
```

To delete data, run:

```bash
node dev-data/import_data.js --delete
```

### 6. Run the Application

Start the server by running:

```bash
node server.js
```

OR

```bash
npm start
```

The server will use the configurations from the `config.env` file.

---

## Project Structure

```plaintext
.
├── .gitignore          # Files and directories ignored by Git
├── .eslintrc.js        # ESLint configuration file
├── .prettierrc         # Prettier configuration file
├── app.js              # Express application and error handling
├── server.js           # Server creation using app.js
├── dev-data/           # Development data
│   ├── data/
│   │   ├── import_data.js
│   │   └── sample_data.json
├── controllers/        # Controller files
│   ├── globalErrorHandler.js
│   └── userController.js
├── models/             # Model files
│   └── userModel.js
├── routes/             # Route files
│   └── userRoutes.js
├── utilities/          # Utility files
│   ├── appError.js
│   └── catchAsync.js
├── node_modules/       # Node.js dependencies (ignored by Git)
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Lock file for dependencies
└── config.env          # Environment configuration file (ignored by Git)
```

---

## Using Postman to Test the API

1. Open Postman and create a new request.
2. Set the request type to `GET`.
3. Enter the following URL to retrieve data for a specific user:
   ```
   127.0.0.1:<port_used>/api/v1/user/<id_user>
   ```
   Replace `<port_used>` with the port number you configured in `config.env` and `<id_user>` with the ID of the user.
4. Send the request, and Postman will display the user's data and tasks.

---

## Routes Implemented

1. **Get All Users**:

   ```
   GET 127.0.0.1:<port_used>/api/v1/users
   ```

   Retrieves all users from the database.

2. **Get User by ID**:
   ```
   GET 127.0.0.1:<port_used>/api/v1/user/<id_user>
   ```
   Retrieves a specific user's data and tasks by their ID.

---

## Author

Adinath Satish Yadav

### Contact

- **Email**: adinathsyadav2016@gmail.com
- **LinkedIn**: [Adinath Satish Yadav](https://www.linkedin.com/in/adinath-yadav-50a294251/)
