# Front Back Integration 002

### Changes
- Included new Login State that requires the user to log in to access data
  - Goes to main page on success
  - Displays invalid credentials, logs a 401 error, and remains on login page on failure
  - Added tests for login
  - Modified app tests to account for new login screen
  - Modified .css file to account for new login screen
- Modified CustomerController to fix the search function
- Modified AuthController to fix 500 internal server errors

### AI Usage
AI was used to determine the cause of the 500 responses.
After discovering the cause, it was added to propose a solution.
After review, the solution was added as is.