# ExpenseTracker
ExpenseTracker is a web application for tracking personal expenses and income. It allows users to categorize their transactions, view their spending patterns, and manage their financial activities efficiently. The application is built using Django for the backend and React for the frontend.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#API-Endpoints)
- [Technologies Used](#Technologies-Used)
- [Contributing](#Contributing)
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
1. POST /signup/ - Register a new user
2. POST /login/ - Login a user
