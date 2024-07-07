from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.http import JsonResponse
from django.conf import settings
from django.utils.html import strip_tags
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.contrib.auth.hashers import make_password, check_password
from datetime import datetime, timedelta, timezone
from bson.objectid import ObjectId
import pymongo
import json
import random
import traceback
from .mongo_pipelines import category_type_amount_pipeline, date_type_amount_pipeline, month_year_type_amount_pipeline


mongo_client = pymongo.MongoClient(settings.MONGO_CONNECTION_URL)
mongo_db = mongo_client['ExpenseTracker']

# Create your views here.


# Authentication
@method_decorator(csrf_exempt, name='dispatch')
class login(View):
    def get(self, request):
        return render(request, 'auth.html')
    
    def post(self, request):
        try:
            login_data = json.loads(request.body)
            email = login_data.get('email', None)
            password = login_data.get('password', None)

            if not email or not password:
                return JsonResponse({'status': False, 'msg': "Email and password are required!"})

            mongo_col = mongo_db['auth']
            result = mongo_col.find_one({'_id': email})

            if result is None:
                return JsonResponse({'status': False, 'msg': "Account doesn't exist!"})
            else:
                stored_hashed_password = result['password']
                # if result['password'] == password:
                if check_password(password, stored_hashed_password):
                    request.session['email'] = email
                    print(request.session.items())
                    return JsonResponse({'status': True, 'msg': 'Login Success'})
                else:
                    return JsonResponse({'status': False, 'msg': "Wrong password! Try again."})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({'status': False, 'msg': 'Login Failed!'})

@method_decorator(csrf_exempt, name='dispatch')
class signup(View):
    def get(self, request):
        return render(request, 'auth.html')
    
    def post(self, request):
        try:
            user_data = json.loads(request.body)
            name = user_data.get('name', None)
            email = user_data.get('email', None)
            password = user_data.get('password', None)
            print(name, email, password)

            if not email or not password or not name:
                return JsonResponse({'status': False, 'msg': "Username, email and password are required!"})

            hashed_password = make_password(password)
            print(hashed_password)

            mongo_col = mongo_db['auth']
            new_user = {
                '_id': email,
                'name': name,
                'email': email,
                'password': hashed_password,
            }
            insert_status = mongo_col.insert_one(new_user)
            if insert_status.inserted_id:
                request.session['email'] = email
                print(request.session.items())
                mongo_cat_col = mongo_db['category']
                insert_col_status = mongo_cat_col.insert_one({'_id': email, 'category': ['Recharge/Bill', 'Income', 'Food/Drinks', 'Transportation']})
                return JsonResponse({'status': True, 'msg': 'Account created!'})
            else:
                return JsonResponse({'status': False, 'msg': 'Account creation Failed!'})
        except pymongo.errors.DuplicateKeyError as e:
            print(traceback.format_exc())
            return JsonResponse({'status': False, 'msg': 'Account already exist!'})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({'status': False, 'msg': 'Account creation Failed!'})

@csrf_exempt
def get_user(request):
    try:
        email = request.session.get('email', None)
        if not email: return redirect('login')

        mongo_col = mongo_db['auth']
        user_data = mongo_col.find_one({'_id': email})
        if user_data:
            return JsonResponse({'status': True, 'user_data': user_data})
        else:
            return JsonResponse({'status': False, 'msg': 'User not found!'})
    except Exception as e:
        print(traceback.format_exc())
        return JsonResponse({'status': False, 'msg': 'Retrieving user data Failed!'})

# Forgot Password
@csrf_exempt
def fp_get_email(request):
    if request.method == "POST":
        try:
            request_body = json.loads(request.body)
            fp_email = request_body['fp_email']

            mongo_col = mongo_db['auth']
            result = mongo_col.find_one({'_id': fp_email})

            if result:
                otp = str(random.randint(100000, 999999))

                mongo_col_ttl_otp = mongo_db['ttl_otp']
                try: 
                    mongo_col_ttl_otp.insert_one({
                        'email': fp_email,
                        'otp': otp,
                        'createdAt': datetime.now(timezone.utc)
                    })
                except pymongo.errors.DuplicateKeyError:
                    mongo_col_ttl_otp.update_one(
                        {'email': fp_email},
                        {
                            "$set":{
                                'otp': otp,
                                'createdAt': datetime.now(timezone.utc)
                            }
                        }
                    )

                html_message = render_to_string('password_reset_email.html', {'otp': otp, 'username': result.get('name') })
                send_mail(
                    subject="Password Reset Request",
                    message=strip_tags(html_message),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[fp_email],
                    html_message=html_message,
                )
                return JsonResponse({'status': True, 'msg': f'Password reset OTP is sent to your email: {fp_email}.'})
            else:
                return JsonResponse({'status': False, 'msg': "Account doesn't exist!"})
        except Exception as e:
            print(traceback.format_exc())
    return JsonResponse({'status': False, 'msg': "Invalid request!"})

@csrf_exempt
def fp_otp_submit(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            fp_email     = body.get('fp_email')
            fp_otp_check = body.get('fp_otp')
            
            if not fp_email or not fp_otp_check:
                return JsonResponse({'status': False, 'msg': "Email and OTP are required."})
            
            mongo_col_ttl_otp = mongo_db['ttl_otp']
            otp_data = mongo_col_ttl_otp.find_one({'email': fp_email})
            if otp_data:
                fp_otp  = otp_data['otp']
                
                if fp_otp_check == fp_otp:
                    return JsonResponse({'status': True, 'msg': 'OTP validated. Set new password.'})
                else:
                    return JsonResponse({'status': False, 'msg': "Invalid OTP."})
            else:
                return JsonResponse({'status': False, 'msg': "Session expired. Please try again."})

        except Exception as e:
            print(traceback.format_exc())
    return JsonResponse({'status': False, 'msg': "Invalid request!"})

@csrf_exempt
def fp_password_submit(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            fp_email    = body.get('fp_email')
            fp_password = body.get('fp_password')

            if not fp_email or not fp_password:
                return JsonResponse({'status': False, 'msg': "Password is required."})
            
            hashed_fp_password = make_password(fp_password)
            
            mongo_col_ttl_otp = mongo_db['ttl_otp']
            otp_data = mongo_col_ttl_otp.find_one({'email': fp_email})
            if otp_data:
                mongo_col = mongo_db['auth']
                auth_data = mongo_col.update_one(
                    {
                        '_id': fp_email
                    },
                    {
                        '$set': { 'password': hashed_fp_password }
                    }
                )

                if auth_data.modified_count:
                    return JsonResponse({'status': True, 'msg': 'Password updated successfully!'})
                else:
                    return JsonResponse({'status': False, 'msg': "Failed to update password!"})
            else:
                return JsonResponse({'status': False, 'msg': "Session expired. Please try again."})

        except Exception as e:
            print(traceback.format_exc())
    return JsonResponse({'status': False, 'msg': "Invalid request!"})


# Views
def home(request):
    email = request.session.get('email', None)
    if email:
        res_context = {
            'email': email,
        }
        return render(request, 'home.html', res_context)
    else:
        return redirect('login')

def expense(request):
    return home(request)
def insights(request):
    return home(request)

# CRUD
@csrf_exempt
def get_expense(request):
    try:
        email = request.session.get('email', None)
        if not email: return redirect('login')

        mongo_col = mongo_db['transaction']
        result = mongo_col.find({'email': email}).sort('date', pymongo.DESCENDING)
        expenses = [{**trans, '_id': str(trans['_id'])} for trans in result]

        return JsonResponse({'status': True, 'expenses': expenses})
    except Exception as e:
        return JsonResponse({'status': False, 'msg': 'Retrieving expenses Failed!'})

@csrf_exempt
def get_category(request):
    try:
        email = request.session.get('email', None)
        if not email: return redirect('login')

        mongo_col = mongo_db['category']
        result = mongo_col.find_one({'_id': email})
        if result:
            return JsonResponse({'status': True, 'category': result['category']})
        else:
            return JsonResponse({'status': False, 'msg': 'Retrieving category Failed!'})
    except Exception as e:
        return JsonResponse({'status': False, 'msg': 'Retrieving category Failed!'})

@csrf_exempt
def add_expense(request):
    if request.method == 'POST':
        email = request.session.get('email', None)
        if not email: return redirect('login')

        user_data = json.loads(request.body)

        description = user_data.get('description', None)
        category = user_data.get('category', None)
        date = user_data.get('date', None)
        amount = user_data.get('amount', 0)
        expenseType = user_data.get('expenseType', None)

        print(description, category, date, amount, expenseType)
        if description and category and date and amount and expenseType:
            data = {
                'description': description,
                'category': category,
                'amount': amount,
                'email': email,
                'date': date,
                'type': expenseType,
            }
            try:
                mongo_col = mongo_db['transaction']
                result = mongo_col.insert_one(data)
                if result.inserted_id:
                    return JsonResponse({'status': True, 'msg': "Successfully added expense!"})
                else:
                    return JsonResponse({'status': False, 'msg': 'Unsuccessful in adding new expense!'})
            except Exception as e:
                print(traceback.format_exc())
                return JsonResponse({'status': False, 'msg': 'Unsuccessful in adding new expense!'})
        else:
            return JsonResponse({'status': False, 'msg': 'Invalid field(s)!'})
    return JsonResponse({'status': False, 'msg': 'Invalid request method!'}, status=405)

@csrf_exempt
def add_category(request):
    if request.method == 'POST':
        email = request.session.get('email', None)
        if not email: return redirect('login')

        user_data = json.loads(request.body)
        category = user_data.get('category', None)

        if category:
            try:
                mongo_col = mongo_db['category']
                result = mongo_col.update_one({'_id': email}, {'$addToSet': {'category': category}})
                if result.modified_count:
                    return JsonResponse({'status': True, 'msg': f"New category '{category}' added!"})
                elif result.raw_result['n'] != result.raw_result['nModified']:
                    return JsonResponse({'status': False, 'msg': 'Category already exists!'})
                else:
                    return JsonResponse({'status': False, 'msg': 'Unsuccessful in adding new category!'})
            except Exception as e:
                print(traceback.format_exc())
                return JsonResponse({'status': False, 'msg': 'Unsuccessful in adding new category!'})
        else:
            return JsonResponse({'status': False, 'msg': 'Invalid category!'})
    return JsonResponse({'status': False, 'msg': 'Invalid request method!'}, status=405)

@csrf_exempt
def update_expense(request):
    if request.method == 'POST':
        try:
            email = request.session.get('email', None)
            if not email: return redirect('login')

            user_data = json.loads(request.body)
            
            id      = user_data.get('_id')
            desc    = user_data.get('description')
            date    = user_data.get('date')
            category= user_data.get('category')
            amount  = user_data.get('amount')
            typ     = user_data.get('type')

            update_doc = {
                'description': desc,
                'category': category,
                'amount': amount,
                'date': date,
                'type': typ,
            }

            filter_doc = {
                '_id': ObjectId(id),
                'email': email,
            }

            mongo_col = mongo_db['transaction']
            result = mongo_col.update_one(filter_doc, {"$set": update_doc})
            print(result.raw_result)
            if result.modified_count:
                return JsonResponse({'status': True, 'msg': 'Expense updated!'})
            elif result.raw_result['nModified']==0:
                return JsonResponse({'status': False, 'msg': 'Nothing to update!'})
            else:
                return JsonResponse({'status': False, 'msg': 'Expense update failed!'})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({'status': False, 'msg': 'Expense update failed!'})
    return JsonResponse({'status': False, 'msg': 'Invalid request method!'}, status=405)

@csrf_exempt
def delete_expense(request):
    if request.method == 'DELETE':
        try:
            body = json.loads(request.body)
            expense_id = body['id']
            print(expense_id)

            email = request.session.get('email', None)
            if not email: return redirect('login')

            mongo_col = mongo_db['transaction']
            result = mongo_col.delete_one({'_id': ObjectId(expense_id), "email": email})
            if result.deleted_count:
                return JsonResponse({'status': True, 'msg': 'Expense deleted successfully!'})
            else:
                return JsonResponse({'status': False, 'msg': 'Expense not found!'}, status=404)
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({'status': False, 'msg': str(e)}, status=500)
    return JsonResponse({'status': False, 'msg': 'Invalid request method!'}, status=405)

@csrf_exempt
def delete_category(request):
    if request.method == 'DELETE':
        try:
            body = json.loads(request.body)
            category = body['category']
            print(category)

            email = request.session.get('email', None)
            if not email: return redirect('login')

            mongo_col = mongo_db['category']
            result = mongo_col.update_one(
                {'_id': email}, 
                {'$pull': {'category': category}}
            )
            print(result.raw_result)
            if result.modified_count:
                return JsonResponse({'status': True, 'msg': f'Category "{category}" deleted successfully!'})
            else:
                return JsonResponse({'status': False, 'msg': f'Category not found!'}, status=404)
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({'status': False, 'msg': str(e)}, status=500)
    return JsonResponse({'status': False, 'msg': 'Invalid request method'}, status=405)

@csrf_exempt
def get_insights_data(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        insight_category_type_totalAmount = body.get('insight_category_type_totalAmount', False)
        insight_date_type_totalAmount = body.get('insight_date_type_totalAmount', False)
        insight_month_year_type_totalAmount = body.get('insight_month_year_type_totalAmount', False)
        days_count = body.get('days_count', None)
        dates = body.get('dates', None)
        categories = body.get('categories', [])

        try:
            response_data = {}

            email = request.session.get('email', None)
            if not email: return redirect('login')

            mongo_col = mongo_db['transaction']

            initMatchStage = {
                '$match': {
                    'email': email,
                }
            }
            # Date match 
            date_range_mon = None
            if dates:
                if dates[1] is None:
                    initMatchStage['$match']['date'] = dates[0][:10]
                else:
                    initMatchStage['$match']['date'] = {"$gte": dates[0][:10], '$lte': dates[1][:10]}
                    date_range_mon = {"$gte": dates[0][:10], '$lte': dates[1][:10]}
            
            if days_count:
                now_utc = datetime.now(timezone.utc)
                now_ist = now_utc + timedelta(hours=5, minutes=30)
                days_count_days_ago_ist = (now_ist - timedelta(days=days_count)).strftime('%Y-%m-%d')
                initMatchStage['$match']['date'] = {"$gte": days_count_days_ago_ist}

            # Category Match
            if categories:
                initMatchStage['$match']['category'] = { "$in": categories }

            # INSIGHT types
            if insight_category_type_totalAmount:
                result = mongo_col.aggregate(category_type_amount_pipeline(initMatchStage, date_range_mon))
                response_data['category_type_totalAmount_data'] = list(result) if result else []

            if insight_date_type_totalAmount:
                result = mongo_col.aggregate(date_type_amount_pipeline(initMatchStage, categories))
                response_data['date_type_totalAmount_data'] = list(result) if result else []
            
            if insight_month_year_type_totalAmount:
                # Calculate the date 12 months ago from today in IST
                now_utc = datetime.now(timezone.utc)
                now_ist = now_utc + timedelta(hours=5, minutes=30)
                twelve_months_ago_ist = (now_ist.replace(day=1) - timedelta(days=365)).strftime('%Y-%m-%d')
                initMatchStage['$match']['date'] = {'$gte': twelve_months_ago_ist}

                result = mongo_col.aggregate(month_year_type_amount_pipeline(initMatchStage))
                response_data['month_year_type_totalAmount_data'] = list(result) if result else []

            return JsonResponse({'status': True, 'data': response_data, 'msg': 'success'})
        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({'status': False, 'msg': str(e)}, status=500)
    
    return JsonResponse({'status': False, 'msg': 'Invalid request method'}, status=405)

# Logout
@csrf_exempt
def logout(request):
    request.session.flush()
    return redirect('login')