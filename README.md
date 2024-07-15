# ExpenseTracker
ExpenseTracker is a web application for tracking personal expenses and income. It allows users to categorize their transactions, view their spending patterns, and manage their financial activities efficiently. The application is built using Django for the backend and React for the frontend.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#API-Endpoints)
- [Technologies Used](#Technologies-Used)
- [License](#License)

## Features
- User authentication.
- Add, edit, and delete transactions.
- Categorize transactions (e.g., Food, Transport, Salary).
- View transactions sorted by date,category,amount, etc.
- View charts and graphs to gain insights in past expenses.
- Responsive UI with React and PrimeReact components.

## Installation
1. Clone the repository:
```

git clone https://github.com/MayurVadhadiya360/expense-tracker-v2.git
```
### Backend (Django)
1. Create a virtual environment and activate it:
```
python -m venv myenv

source myenv/bin/activate
# On Windows use `myenv\Scripts\activate.bat`
```
2. Install the required packages:
```

pip3 install -r requirements.txt
```
3. Configure `.env` file for `settings.py`:
    - Create `.env` in the same directory as `settings.py` i.e., `/backend/backend/` in this case.
    - `.env` file:
```
SECRET_KEY="your secret key for django"
ALLOWED_HOSTS=127.0.0.1,localhost,yourdomain.com,etc
DEBUG=True
EMAIL_HOST_USER=yourmail@gmail.com
EMAIL_HOST_PASSWORD=app-password-of-your-gmail-account
DEFAULT_FROM_EMAIL=yourmail@gmail.com
MONGO_CONNECTION_URL=mongodb://localhost:27017/
```
5. Run the Django development server:
```

python3 manage.py runserver
```

### Frontend (React)
  1. Navigate to the frontend directory:
```
cd ./frontend
where frontend = (expense-tracker-auth or expense-tracker-mainapp)
```
2. Install the required packages:
```

npm install
```
3. Start the development server:
```

npm start
```

## Usage
1. Open your browser and navigate to `http://localhost:3000` to access the frontend.
2. Use `http://localhost:8000` for API requests.
3. Make apropriate changes in views to use it in development of front end, as views are written be to used in production.
    - You can define hardcodes `email` to use during development of `expense-tracker-mainapp`
4. You can gain updated files of `frontend` by running `npm run build` and update it in `templates` and `static` file of django project.

## API Endpoints
### Authentication
#### Register a New User
- URL: POST /signup/
- View: signup
- Description: Registers a new user with name, email, and password.

#### Login a User
- URL: POST /login/
- View: login
- Description: Logs in a user with email and password.

#### Get User Details
- URL: GET /get_user/
- View: get_user
- Description: Retrieves details of the logged-in user.

### Forgot Password
#### Get Email for Password Reset
- URL: POST /fp_get_email/
- View: fp_get_email
- Description: Sends a password reset OTP to the provided email.

#### Submit OTP for Password Reset
- URL: POST /fp_otp_submit/
- View: fp_otp_submit
- Description: Validates the OTP sent to the user's email.

#### Submit New Password
- URL: POST /fp_password_submit/
- View: fp_password_submit
- Description: Updates the user's password.

### Transactions
#### Retrieve All Transactions
- URL: GET /get_expense/
- View: get_expense
- Description: Retrieves all transactions of the logged-in user.

#### Add a New Transaction
- URL: POST /add_expense/
- View: add_expense
- Description: Adds a new transaction for the logged-in user.

#### Edit an Existing Transaction
- URL: PUT /edit_expense/
- View: update_expense
- Description: Edits an existing transaction for the logged-in user.

#### Delete a Transaction
- URL: DELETE /delete_expense/
- View: delete_expense
- Description: Deletes a transaction for the logged-in user.

### Categories
#### Retrieve All Categories
- URL: GET /get_category/
- View: get_category
- Description: Retrieves all categories of the logged-in user.

#### Add a New Category
- URL: POST /add_category/
- View: add_category
- Description: Adds a new category for the logged-in user.

#### Delete a Category
- URL: DELETE /delete_category/
- View: delete_category
- Description: Deletes a category for the logged-in user.

### Insights
#### Get Insights Data
- URL: POST /get_insights_data/
- View: get_insights_data
- Description: Retrieves insights data for the logged-in user based on filters.

### Logout
#### Logout User
- URL: POST /logout/
- View: logout
- Description: Logs out the current user.

## License
This project is licensed under the MIT License. See the [LICENSE](https://github.com/MayurVadhadiya360/expense-tracker-v2?tab=MIT-1-ov-file) file for more details.
